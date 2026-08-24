// Three.js stub for the WeChat Mini Game build.
//
// The 3D renderer is disabled on WeChat — we don't bundle the real three.js.
// But three-view.ts builds a top-level GEOMETRY = { ... new THREE.XGeometry() }
// table at module load, so the stub must let `new THREE.Whatever()` succeed
// without throwing. The first real method call inside ThreeEntityRenderer's
// constructor (e.g. this.renderer.setClearColor) then throws TypeError, which
// runtime.ts's try/catch catches and falls back to pure 2D.

function StubCtor() {}
StubCtor.prototype = {};

module.exports = {
  AmbientLight: StubCtor,
  BoxGeometry: StubCtor,
  BufferGeometry: StubCtor,
  ConeGeometry: StubCtor,
  CylinderGeometry: StubCtor,
  DirectionalLight: StubCtor,
  DodecahedronGeometry: StubCtor,
  Group: StubCtor,
  HemisphereLight: StubCtor,
  IcosahedronGeometry: StubCtor,
  Mesh: StubCtor,
  MeshLambertMaterial: StubCtor,
  Object3D: StubCtor,
  OctahedronGeometry: StubCtor,
  OrthographicCamera: StubCtor,
  Scene: StubCtor,
  WebGLRenderer: StubCtor,
  SRGBColorSpace: 'srgb',
};
