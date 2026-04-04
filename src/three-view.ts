import * as THREE from 'three';
import { Enemy, EnemyType } from './enemies';
import { GameWorld } from './world';
import { wrappedAngle } from './utils';

type LitMaterial = THREE.MeshLambertMaterial;

type EnemyParts = {
  wings?: THREE.Object3D[];
  tentacles?: THREE.Object3D[];
  petals?: THREE.Object3D[];
  crown?: THREE.Object3D[];
  legs?: THREE.Object3D[];
  pods?: THREE.Object3D[];
  core?: THREE.Object3D;
};

type EnemyVisual = {
  type: EnemyType;
  group: THREE.Group;
  materials: LitMaterial[];
  seed: number;
};

type PlayerVisual = {
  group: THREE.Group;
  shell: THREE.Mesh<THREE.DodecahedronGeometry, LitMaterial>;
  core: THREE.Mesh<THREE.IcosahedronGeometry, LitMaterial>;
  fins: THREE.Mesh<THREE.BoxGeometry, LitMaterial>[];
};

const BASE_CLEAR_COLOR = 0x070b16;
const PLAYER_BASE_RADIUS = 15;
const BASE_RADII: Record<EnemyType, number> = {
  swarmer: 10,
  drifter: 20,
  titan: 40,
  overlord: 55,
};

const GEOMETRY = {
  playerShell: new THREE.DodecahedronGeometry(15, 0),
  playerCore: new THREE.IcosahedronGeometry(9, 0),
  playerFin: new THREE.BoxGeometry(5.5, 16, 1.8),
  swarmerThorax: new THREE.DodecahedronGeometry(7.8, 0),
  swarmerAbdomen: new THREE.OctahedronGeometry(6.2, 0),
  swarmerHead: new THREE.OctahedronGeometry(4.1, 0),
  swarmerWing: new THREE.BoxGeometry(8.8, 1.1, 5.8),
  swarmerStinger: new THREE.ConeGeometry(1.8, 6.5, 4),
  swarmerLeg: new THREE.ConeGeometry(1.2, 7, 4),
  drifterMantle: new THREE.IcosahedronGeometry(18, 0),
  drifterCore: new THREE.OctahedronGeometry(6.4, 0),
  drifterTentacle: new THREE.CylinderGeometry(1.2, 2.9, 18, 5),
  drifterFrill: new THREE.ConeGeometry(2.8, 10, 4),
  titanHull: new THREE.IcosahedronGeometry(31, 0),
  titanCrust: new THREE.DodecahedronGeometry(11, 0),
  titanSpire: new THREE.ConeGeometry(5.2, 18, 4),
  titanCore: new THREE.OctahedronGeometry(8.5, 0),
  overlordThorax: new THREE.CylinderGeometry(16, 20, 13, 6),
  overlordAbdomen: new THREE.DodecahedronGeometry(15, 0),
  overlordWing: new THREE.BoxGeometry(10, 25, 3.5),
  overlordHorn: new THREE.ConeGeometry(3.5, 12, 4),
  overlordPod: new THREE.DodecahedronGeometry(5.5, 0),
  overlordCore: new THREE.OctahedronGeometry(9, 0),
};

function makeMaterial(color: number, emissive = color): LitMaterial {
  return new THREE.MeshLambertMaterial({
    color,
    emissive,
    emissiveIntensity: 0.18,
    flatShading: true,
  });
}

function varyMaterial(material: LitMaterial, hueShift: number, lightnessShift: number): void {
  material.color.offsetHSL(hueShift, 0, lightnessShift);
  material.emissive.copy(material.color).multiplyScalar(0.5);
}

function createMesh<TGeometry extends THREE.BufferGeometry>(
  geometry: TGeometry,
  material: LitMaterial,
): THREE.Mesh<TGeometry, LitMaterial> {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.matrixAutoUpdate = true;
  return mesh;
}

function isMobileLikeViewport(): boolean {
  return window.innerWidth < 900 || window.matchMedia('(pointer: coarse)').matches;
}

export class ThreeEntityRenderer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
  private readonly playerVisual: PlayerVisual;
  private readonly enemyVisuals = new Map<Enemy, EnemyVisual>();
  private readonly enemyPools: Record<EnemyType, EnemyVisual[]> = {
    swarmer: [],
    drifter: [],
    titan: [],
    overlord: [],
  };
  private readonly pixelRatioCap: number;
  private width = 1;
  private height = 1;

  constructor(overlayCanvas: HTMLCanvasElement) {
    const compactQuality = isMobileLikeViewport();
    this.pixelRatioCap = compactQuality ? 1.35 : 1.85;

    this.renderer = new THREE.WebGLRenderer({
      antialias: !compactQuality,
      alpha: false,
      powerPreference: 'high-performance',
      precision: 'mediump',
      stencil: false,
      depth: true,
    });
    this.renderer.setClearColor(BASE_CLEAR_COLOR, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.id = 'playfield-3d';
    this.renderer.domElement.style.position = 'fixed';
    this.renderer.domElement.style.inset = '0';
    this.renderer.domElement.style.width = '100vw';
    this.renderer.domElement.style.height = '100vh';
    this.renderer.domElement.style.zIndex = '0';
    this.renderer.domElement.style.pointerEvents = 'none';

    overlayCanvas.style.position = 'fixed';
    overlayCanvas.style.inset = '0';
    overlayCanvas.style.zIndex = '1';
    overlayCanvas.style.background = 'transparent';

    const parent = overlayCanvas.parentElement ?? document.body;
    parent.insertBefore(this.renderer.domElement, overlayCanvas);

    this.scene.add(new THREE.AmbientLight(0x8aa5ff, 1.1));

    const hemi = new THREE.HemisphereLight(0x9ed0ff, 0x11151b, 0.9);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xe0eeff, 1.9);
    key.position.set(-0.5, 0.8, 1.3);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xffc695, 0.6);
    fill.position.set(0.85, -0.5, 1);
    this.scene.add(fill);

    this.playerVisual = this.createPlayerVisual();
    this.scene.add(this.playerVisual.group);
  }

  resize(width: number, height: number, dpr: number): void {
    this.width = width;
    this.height = height;
    this.camera.left = -width / 2;
    this.camera.right = width / 2;
    this.camera.top = height / 2;
    this.camera.bottom = -height / 2;
    this.camera.position.set(0, 0, 400);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();

    this.renderer.setPixelRatio(Math.min(dpr, this.pixelRatioCap));
    this.renderer.setSize(width, height, false);
  }

  render(world: GameWorld | null, time: number): void {
    if (!world) {
      this.playerVisual.group.visible = false;
      for (const visual of this.enemyVisuals.values()) {
        visual.group.visible = false;
      }
      this.renderer.render(this.scene, this.camera);
      return;
    }

    this.syncPlayer(world, time);
    this.syncEnemies(world, time);
    this.renderer.render(this.scene, this.camera);
  }

  private syncPlayer(world: GameWorld, time: number): void {
    const player = world.player;
    const screen = world.camera.worldToScreen(player.x, player.y);
    const root = this.playerVisual.group;
    root.visible = true;
    root.position.set(screen.x - this.width / 2, this.height / 2 - screen.y, 10);
    root.scale.setScalar(player.radius / PLAYER_BASE_RADIUS);
    root.rotation.z = time * 0.18;

    const pulse = 1 + Math.sin(time * 2.8) * 0.08;
    this.playerVisual.core.rotation.y = time * 1.4;
    this.playerVisual.core.rotation.x = time * 0.8;
    this.playerVisual.core.scale.setScalar(pulse);

    for (let i = 0; i < this.playerVisual.fins.length; i++) {
      const fin = this.playerVisual.fins[i];
      fin.rotation.z = (i / this.playerVisual.fins.length) * Math.PI * 2 + time * 0.42;
      fin.rotation.x = 0.34 + Math.sin(time * 2 + i) * 0.16;
    }

    this.playerVisual.shell.material.emissiveIntensity = 0.18 + player.hurtRatio * 0.65;
    this.playerVisual.core.material.emissiveIntensity = 0.36 + player.hurtRatio * 0.55;
  }

  private syncEnemies(world: GameWorld, time: number): void {
    const active = new Set(world.spawner.enemies);

    for (const [enemy, visual] of this.enemyVisuals) {
      if (!active.has(enemy)) {
        this.releaseEnemyVisual(enemy, visual);
      }
    }

    for (const enemy of world.spawner.enemies) {
      let visual = this.enemyVisuals.get(enemy);
      if (!visual) {
        visual = this.acquireEnemyVisual(enemy.type);
        this.enemyVisuals.set(enemy, visual);
      }
      this.updateEnemyVisual(enemy, visual, world, time);
    }
  }

  private acquireEnemyVisual(type: EnemyType): EnemyVisual {
    const pooled = this.enemyPools[type].pop();
    if (pooled) {
      pooled.group.visible = true;
      return pooled;
    }

    const visual = this.createEnemyVisual(type);
    this.scene.add(visual.group);
    return visual;
  }

  private releaseEnemyVisual(enemy: Enemy, visual: EnemyVisual): void {
    visual.group.visible = false;
    this.enemyVisuals.delete(enemy);
    this.enemyPools[visual.type].push(visual);
  }

  private updateEnemyVisual(enemy: Enemy, visual: EnemyVisual, world: GameWorld, time: number): void {
    const visible = world.camera.isVisible(enemy.x, enemy.y, enemy.radius + 120);
    visual.group.visible = visible;
    if (!visible) return;

    const screen = world.camera.worldToScreen(enemy.x, enemy.y);
    visual.group.position.set(screen.x - this.width / 2, this.height / 2 - screen.y, 0);
    visual.group.scale.setScalar(enemy.radius / BASE_RADII[enemy.type]);

    const seed = visual.seed;
    const bob = Math.sin(time * 1.8 + seed * 6.1) * 2.4;
    const wobble = Math.sin(time * 2.4 + seed * 4.7) * 0.1;
    const chaseRotation = -wrappedAngle(enemy.x, enemy.y, world.player.x, world.player.y) + Math.PI / 2;
    const baseRotation = enemy.type === 'swarmer'
      ? chaseRotation
      : time * (enemy.type === 'drifter' ? 0.56 : enemy.type === 'titan' ? 0.22 : 0.3) + seed * Math.PI;
    visual.group.position.z = enemy.type === 'overlord' ? 4 + bob * 0.3 : bob;
    visual.group.rotation.z = baseRotation;
    visual.group.rotation.x = enemy.type === 'overlord' ? 0.12 : 0.18 + wobble * 0.22;
    visual.group.rotation.y = enemy.type === 'titan' ? 0.12 + wobble * 0.18 : wobble * 0.14;

    const lowHealth = 1 - enemy.hp / enemy.maxHp;
    for (const material of visual.materials) {
      material.emissiveIntensity = 0.14 + lowHealth * 0.32;
    }

    const parts = visual.group.userData as EnemyParts;

    if (parts.wings) {
      for (let i = 0; i < parts.wings.length; i++) {
        parts.wings[i].rotation.x = 0.32 + Math.sin(time * 8 + seed * 5 + i) * 0.2;
      }
    }
    if (parts.legs) {
      for (let i = 0; i < parts.legs.length; i++) {
        parts.legs[i].rotation.z = parts.legs[i].userData.baseRotation + Math.sin(time * 6 + seed * 7 + i) * 0.18;
      }
    }
    if (parts.tentacles) {
      for (let i = 0; i < parts.tentacles.length; i++) {
        parts.tentacles[i].rotation.z = parts.tentacles[i].userData.baseRotation + Math.sin(time * 3 + seed * 3 + i) * 0.28;
        parts.tentacles[i].rotation.x = 0.26 + Math.sin(time * 2.2 + i + seed) * 0.12;
      }
    }
    if (parts.petals) {
      for (let i = 0; i < parts.petals.length; i++) {
        parts.petals[i].rotation.z = (i / parts.petals.length) * Math.PI * 2 + time * 0.28 + seed;
        parts.petals[i].rotation.x = 0.62 + Math.sin(time * 1.6 + i + seed) * 0.12;
      }
    }
    if (parts.crown) {
      for (let i = 0; i < parts.crown.length; i++) {
        parts.crown[i].rotation.z = parts.crown[i].userData.baseRotation + time * 0.16;
      }
    }
    if (parts.pods) {
      for (let i = 0; i < parts.pods.length; i++) {
        parts.pods[i].position.y = parts.pods[i].userData.baseY + Math.sin(time * 2 + seed * 4 + i) * 1.8;
      }
    }
    if (parts.core) {
      const pulse = 0.94 + Math.sin(time * 2.4 + seed * 6.3) * 0.09;
      parts.core.scale.setScalar(pulse);
    }
  }

  private createPlayerVisual(): PlayerVisual {
    const root = new THREE.Group();

    const shell = createMesh(GEOMETRY.playerShell, makeMaterial(0x2f6dff, 0x5aa0ff));
    shell.scale.set(1.08, 0.95, 0.8);
    root.add(shell);

    const core = createMesh(GEOMETRY.playerCore, makeMaterial(0x9fd9ff, 0x8ecbff));
    root.add(core);

    const fins: THREE.Mesh<THREE.BoxGeometry, LitMaterial>[] = [];
    for (let i = 0; i < 3; i++) {
      const fin = createMesh(GEOMETRY.playerFin, makeMaterial(0x5e9dff, 0x7dc0ff));
      fin.position.set(0, 0, -3.5);
      root.add(fin);
      fins.push(fin);
    }

    return { group: root, shell, core, fins };
  }

  private createEnemyVisual(type: EnemyType): EnemyVisual {
    const seed = Math.random();
    switch (type) {
      case 'swarmer':
        return this.createSwarmerVisual(seed);
      case 'drifter':
        return this.createDrifterVisual(seed);
      case 'titan':
        return this.createTitanVisual(seed);
      case 'overlord':
        return this.createOverlordVisual(seed);
    }
  }

  private createSwarmerVisual(seed: number): EnemyVisual {
    const root = new THREE.Group();
    const materials: LitMaterial[] = [];

    const thoraxMat = makeMaterial(0x8e4c30, 0xff7447);
    varyMaterial(thoraxMat, (seed - 0.5) * 0.06, (seed - 0.5) * 0.08);
    const thorax = createMesh(GEOMETRY.swarmerThorax, thoraxMat);
    thorax.scale.set(1.12, 0.9, 0.82);
    root.add(thorax);
    materials.push(thoraxMat);

    const abdomenMat = makeMaterial(0xc9853b, 0xffb24f);
    varyMaterial(abdomenMat, (seed - 0.5) * 0.05, 0.04);
    const abdomen = createMesh(GEOMETRY.swarmerAbdomen, abdomenMat);
    abdomen.position.set(0, 8.2, -0.8);
    abdomen.scale.set(0.95, 1.2, 0.82);
    root.add(abdomen);
    materials.push(abdomenMat);

    const headMat = makeMaterial(0x51342d, 0xbd6756);
    const head = createMesh(GEOMETRY.swarmerHead, headMat);
    head.position.set(0, -8.8, 1.8);
    head.scale.set(0.85, 1.1, 0.85);
    root.add(head);
    materials.push(headMat);

    const wingMat = makeMaterial(0xd2deeb, 0xc4d8ff);
    wingMat.transparent = true;
    wingMat.opacity = 0.76;
    const wings: THREE.Object3D[] = [];
    for (const side of [-1, 1] as const) {
      const wing = createMesh(GEOMETRY.swarmerWing, wingMat.clone());
      wing.position.set(side * 8.7, -1.8, 1.8);
      wing.rotation.z = side * 0.5;
      root.add(wing);
      wings.push(wing);
      materials.push(wing.material);
    }

    const legs: THREE.Object3D[] = [];
    for (let i = 0; i < 3; i++) {
      const legAngle = -0.8 + i * 0.8;
      for (const side of [-1, 1] as const) {
        const legMat = makeMaterial(0x3d261d, 0x74453b);
        const leg = createMesh(GEOMETRY.swarmerLeg, legMat);
        leg.position.set(side * (5.5 + i * 1.4), i * 2.5 - 1.5, -2.6);
        leg.rotation.x = 1.1;
        leg.rotation.z = side * (1.1 + legAngle * 0.25);
        leg.userData.baseRotation = leg.rotation.z;
        root.add(leg);
        legs.push(leg);
        materials.push(legMat);
      }
    }

    const stingerMat = makeMaterial(0x261615, 0x8f4238);
    const stinger = createMesh(GEOMETRY.swarmerStinger, stingerMat);
    stinger.position.set(0, 15, -0.2);
    stinger.rotation.z = Math.PI;
    root.add(stinger);
    materials.push(stingerMat);

    root.userData = { wings, legs };
    return { type: 'swarmer', group: root, materials, seed };
  }

  private createDrifterVisual(seed: number): EnemyVisual {
    const root = new THREE.Group();
    const materials: LitMaterial[] = [];

    const mantleMat = makeMaterial(0x3a6d65, 0x69c7bb);
    varyMaterial(mantleMat, (seed - 0.5) * 0.08, 0.03);
    const mantle = createMesh(GEOMETRY.drifterMantle, mantleMat);
    mantle.scale.set(1.14, 0.84, 0.78);
    root.add(mantle);
    materials.push(mantleMat);

    const coreMat = makeMaterial(0xb6fff7, 0xb8fff1);
    const core = createMesh(GEOMETRY.drifterCore, coreMat);
    core.position.set(0, -1.5, 5.8);
    root.add(core);
    materials.push(coreMat);

    const petals: THREE.Object3D[] = [];
    for (let i = 0; i < 5; i++) {
      const frillMat = makeMaterial(0x5f928b, 0x9de8dd);
      const frill = createMesh(GEOMETRY.drifterFrill, frillMat);
      frill.position.set(0, 2, -4);
      frill.rotation.x = 0.75;
      root.add(frill);
      petals.push(frill);
      materials.push(frillMat);
    }

    const tentacles: THREE.Object3D[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = -Math.PI * 0.82 + (i / 5) * Math.PI * 1.64;
      const tentacleMat = makeMaterial(0x47655f, 0x88dbce);
      const tentacle = createMesh(GEOMETRY.drifterTentacle, tentacleMat);
      tentacle.position.set(Math.cos(angle) * 10.5, 14 + Math.sin(angle) * 2.4, -3.4);
      tentacle.rotation.z = angle + Math.PI;
      tentacle.rotation.x = 0.25;
      tentacle.userData.baseRotation = tentacle.rotation.z;
      root.add(tentacle);
      tentacles.push(tentacle);
      materials.push(tentacleMat);
    }

    root.userData = { tentacles, petals, core };
    return { type: 'drifter', group: root, materials, seed };
  }

  private createTitanVisual(seed: number): EnemyVisual {
    const root = new THREE.Group();
    const materials: LitMaterial[] = [];

    const hullMat = makeMaterial(0x5f5a72, 0xa98fff);
    varyMaterial(hullMat, (seed - 0.5) * 0.05, (seed - 0.5) * 0.06);
    const hull = createMesh(GEOMETRY.titanHull, hullMat);
    hull.scale.set(1.08, 0.96, 0.88);
    root.add(hull);
    materials.push(hullMat);

    const coreMat = makeMaterial(0xf7e8ff, 0xf0c2ff);
    const core = createMesh(GEOMETRY.titanCore, coreMat);
    core.position.set(0, -1, 10);
    root.add(core);
    materials.push(coreMat);

    const petals: THREE.Object3D[] = [];
    for (let i = 0; i < 7; i++) {
      const spireMat = makeMaterial(0x3f3557, 0x9a7ee6);
      const spire = createMesh(GEOMETRY.titanSpire, spireMat);
      spire.position.set(0, 0, -7.5);
      spire.rotation.x = 0.56;
      root.add(spire);
      petals.push(spire);
      materials.push(spireMat);
    }

    for (let i = 0; i < 3; i++) {
      const crustMat = makeMaterial(0x786489, 0xc6a0ff);
      const crust = createMesh(GEOMETRY.titanCrust, crustMat);
      crust.position.set((i - 1) * 10, i === 1 ? -8 : 7, 5 - i * 3);
      crust.scale.set(0.65, 0.5, 0.5);
      crust.rotation.set(0.2 * i, 0.3 + i * 0.2, i * 0.4);
      root.add(crust);
      materials.push(crustMat);
    }

    root.userData = { petals, core };
    return { type: 'titan', group: root, materials, seed };
  }

  private createOverlordVisual(seed: number): EnemyVisual {
    const root = new THREE.Group();
    const materials: LitMaterial[] = [];

    const thoraxMat = makeMaterial(0x60362a, 0xe25f46);
    varyMaterial(thoraxMat, (seed - 0.5) * 0.03, 0.02);
    const thorax = createMesh(GEOMETRY.overlordThorax, thoraxMat);
    thorax.rotation.z = Math.PI / 6;
    thorax.scale.set(1, 1, 0.7);
    root.add(thorax);
    materials.push(thoraxMat);

    const abdomenMat = makeMaterial(0x9d5c30, 0xff9f51);
    const abdomen = createMesh(GEOMETRY.overlordAbdomen, abdomenMat);
    abdomen.position.set(0, 16, -3);
    abdomen.scale.set(1.1, 1.35, 0.75);
    root.add(abdomen);
    materials.push(abdomenMat);

    const coreMat = makeMaterial(0xffd79e, 0xffba6d);
    const core = createMesh(GEOMETRY.overlordCore, coreMat);
    core.position.set(0, -1, 9.2);
    root.add(core);
    materials.push(coreMat);

    const wings: THREE.Object3D[] = [];
    for (const side of [-1, 1] as const) {
      const wingMat = makeMaterial(0x6d4135, 0xc35f4e);
      const wing = createMesh(GEOMETRY.overlordWing, wingMat);
      wing.position.set(side * 18.5, -1, -1.5);
      wing.rotation.z = side * 0.38;
      wing.rotation.x = 0.32;
      root.add(wing);
      wings.push(wing);
      materials.push(wingMat);
    }

    const crown: THREE.Object3D[] = [];
    for (let i = 0; i < 5; i++) {
      const hornMat = makeMaterial(0x2a1915, 0x8d3a32);
      const horn = createMesh(GEOMETRY.overlordHorn, hornMat);
      horn.position.set(0, -16, 3);
      horn.rotation.x = 0.18;
      horn.userData.baseRotation = (i / 5) * Math.PI * 2;
      horn.rotation.z = horn.userData.baseRotation;
      root.add(horn);
      crown.push(horn);
      materials.push(hornMat);
    }

    const pods: THREE.Object3D[] = [];
    for (const side of [-1, 1] as const) {
      const podMat = makeMaterial(0x7e3d2e, 0xff7b50);
      const pod = createMesh(GEOMETRY.overlordPod, podMat);
      pod.position.set(side * 11, 19, 1);
      pod.scale.set(0.75, 1, 0.72);
      pod.userData.baseY = pod.position.y;
      root.add(pod);
      pods.push(pod);
      materials.push(podMat);
    }

    root.userData = { wings, crown, pods, core };
    return { type: 'overlord', group: root, materials, seed };
  }
}
