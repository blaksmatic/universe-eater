"use strict";
(() => {
  // src/camera.ts
  var Camera = class {
    constructor(canvasWidth, canvasHeight) {
      this.x = 0;
      this.y = 0;
      this.width = canvasWidth;
      this.height = canvasHeight;
    }
    follow(targetX, targetY) {
      this.x = targetX - this.width / 2;
      this.y = targetY - this.height / 2;
    }
    resize(canvasWidth, canvasHeight) {
      this.width = canvasWidth;
      this.height = canvasHeight;
    }
    worldToScreen(wx, wy) {
      return { x: wx - this.x, y: wy - this.y };
    }
    isVisible(wx, wy, margin = 100) {
      const sx = wx - this.x;
      const sy = wy - this.y;
      return sx > -margin && sx < this.width + margin && sy > -margin && sy < this.height + margin;
    }
  };

  // src/input.ts
  var keys = {};
  window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
  });
  window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });
  function isKeyDown(key) {
    return !!keys[key];
  }

  // src/utils.ts
  var MAP_WIDTH = 5e4;
  var MAP_HEIGHT = 5e4;
  function randomRange(min, max) {
    return min + Math.random() * (max - min);
  }
  function wrapPosition(x, y) {
    let wx = x;
    let wy = y;
    if (wx < 0) wx += MAP_WIDTH;
    if (wx >= MAP_WIDTH) wx -= MAP_WIDTH;
    if (wy < 0) wy += MAP_HEIGHT;
    if (wy >= MAP_HEIGHT) wy -= MAP_HEIGHT;
    return { x: wx, y: wy };
  }
  function wrappedDelta(x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    if (dx > MAP_WIDTH / 2) dx -= MAP_WIDTH;
    if (dx < -MAP_WIDTH / 2) dx += MAP_WIDTH;
    if (dy > MAP_HEIGHT / 2) dy -= MAP_HEIGHT;
    if (dy < -MAP_HEIGHT / 2) dy += MAP_HEIGHT;
    return { x: dx, y: dy };
  }
  function wrappedDistance(x1, y1, x2, y2) {
    const d = wrappedDelta(x1, y1, x2, y2);
    return Math.sqrt(d.x * d.x + d.y * d.y);
  }
  function wrappedAngle(x1, y1, x2, y2) {
    const d = wrappedDelta(x1, y1, x2, y2);
    return Math.atan2(d.y, d.x);
  }
  function parseHexColor(hex) {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16)
    ];
  }
  function formatTime(seconds) {
    const t = Math.ceil(seconds);
    const min = Math.floor(t / 60);
    const sec = t % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }
  function drawSphereShading(ctx2, cx, cy, radius, r, g, b) {
    const hlX = cx - radius * 0.3;
    const hlY = cy - radius * 0.3;
    const grad = ctx2.createRadialGradient(hlX, hlY, radius * 0.1, cx, cy, radius);
    grad.addColorStop(0, `rgba(${Math.min(255, r + 80)}, ${Math.min(255, g + 80)}, ${Math.min(255, b + 80)}, 0.25)`);
    grad.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, 0.08)`);
    grad.addColorStop(1, "rgba(0, 0, 0, 0.2)");
    ctx2.beginPath();
    ctx2.arc(cx, cy, radius - 1, 0, Math.PI * 2);
    ctx2.fillStyle = grad;
    ctx2.fill();
  }

  // src/player.ts
  var Player = class {
    constructor() {
      this.x = MAP_WIDTH / 2;
      this.y = MAP_HEIGHT / 2;
      this.radius = 15;
      this.speed = 200;
      this.maxHp = 100;
      this.hp = 100;
      this.xp = 0;
      this.level = 1;
      this.kills = 0;
      this.ripples = [];
    }
    getXpForNextLevel() {
      return Math.floor(10 * Math.pow(1.4, this.level - 1));
    }
    addXp(amount) {
      this.xp += amount;
      if (this.xp >= this.getXpForNextLevel()) {
        this.xp -= this.getXpForNextLevel();
        this.level++;
        return true;
      }
      return false;
    }
    takeDamage(amount) {
      this.hp = Math.max(0, this.hp - amount);
    }
    isDead() {
      return this.hp <= 0;
    }
    addRipple(angle) {
      this.ripples.push({ angle, age: 0, duration: 0.4 });
    }
    updateRipples(dt) {
      for (const r of this.ripples) r.age += dt;
      this.ripples = this.ripples.filter((r) => r.age < r.duration);
    }
    regenerate(dt) {
      if (this.hp < this.maxHp) {
        this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.01 * dt);
      }
    }
    update(dt) {
      let dx = 0;
      let dy = 0;
      if (isKeyDown("w") || isKeyDown("arrowup")) dy -= 1;
      if (isKeyDown("s") || isKeyDown("arrowdown")) dy += 1;
      if (isKeyDown("a") || isKeyDown("arrowleft")) dx -= 1;
      if (isKeyDown("d") || isKeyDown("arrowright")) dx += 1;
      if (dx !== 0 && dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        dx /= len;
        dy /= len;
      }
      this.x += dx * this.speed * dt;
      this.y += dy * this.speed * dt;
      const wrapped = wrapPosition(this.x, this.y);
      this.x = wrapped.x;
      this.y = wrapped.y;
    }
    draw(ctx2, camera2) {
      const screen = camera2.worldToScreen(this.x, this.y);
      const hpRatio = this.hp / this.maxHp;
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, this.radius - 1, 0, Math.PI * 2);
      ctx2.fillStyle = `rgba(20, 50, 100, ${0.3 + hpRatio * 0.4})`;
      ctx2.fill();
      drawSphereShading(ctx2, screen.x, screen.y, this.radius, 60, 120, 255);
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, this.radius, 0, Math.PI * 2);
      ctx2.strokeStyle = "#4488ff";
      ctx2.lineWidth = 2;
      ctx2.stroke();
      if (hpRatio > 0) {
        const arcRadius = this.radius + 5;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + Math.PI * 2 * hpRatio;
        ctx2.beginPath();
        ctx2.arc(screen.x, screen.y, arcRadius, startAngle, endAngle);
        const r = Math.round(60 + (1 - hpRatio) * 195);
        const g = Math.round(180 * hpRatio);
        const b = Math.round(255 * hpRatio);
        ctx2.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.25)`;
        ctx2.lineWidth = 6;
        ctx2.lineCap = "round";
        ctx2.stroke();
        ctx2.beginPath();
        ctx2.arc(screen.x, screen.y, arcRadius, startAngle, endAngle);
        ctx2.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
        ctx2.lineWidth = 2;
        ctx2.lineCap = "round";
        ctx2.stroke();
      }
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, this.radius + 4, 0, Math.PI * 2);
      ctx2.strokeStyle = `rgba(68, 136, 255, ${0.1 + hpRatio * 0.2})`;
      ctx2.lineWidth = 3;
      ctx2.stroke();
      for (const ripple of this.ripples) {
        const t = ripple.age / ripple.duration;
        const alpha = 0.6 * (1 - t);
        const spread = Math.PI * 0.4 * (1 + t * 0.5);
        const rippleR = this.radius + 2 + t * 12;
        ctx2.beginPath();
        ctx2.arc(screen.x, screen.y, rippleR, ripple.angle - spread / 2, ripple.angle + spread / 2);
        ctx2.strokeStyle = `rgba(100, 180, 255, ${alpha})`;
        ctx2.lineWidth = 2.5 * (1 - t);
        ctx2.stroke();
        const rippleR2 = this.radius + 2 + t * 18;
        ctx2.beginPath();
        ctx2.arc(screen.x, screen.y, rippleR2, ripple.angle - spread * 0.3, ripple.angle + spread * 0.3);
        ctx2.strokeStyle = `rgba(150, 210, 255, ${alpha * 0.5})`;
        ctx2.lineWidth = 1.5 * (1 - t);
        ctx2.stroke();
      }
    }
  };

  // src/background.ts
  var PARALLAX_FACTORS = [0.2, 0.5, 0.8];
  function createStar(layer) {
    return {
      x: Math.random() * MAP_WIDTH,
      y: Math.random() * MAP_HEIGHT,
      layer,
      size: layer === 0 ? randomRange(0.5, 1) : layer === 1 ? randomRange(1, 2) : randomRange(1.5, 3),
      brightness: randomRange(0.3, 1),
      twinkleSpeed: randomRange(0.5, 2),
      twinkleOffset: Math.random() * Math.PI * 2
    };
  }
  function createNebula() {
    const colors = [
      [100, 50, 150],
      [50, 80, 180],
      [150, 50, 100],
      [40, 100, 160]
    ];
    return {
      x: Math.random() * MAP_WIDTH,
      y: Math.random() * MAP_HEIGHT,
      radius: randomRange(200, 600),
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: randomRange(0.03, 0.08)
    };
  }
  function createDust() {
    return {
      x: Math.random() * MAP_WIDTH,
      y: Math.random() * MAP_HEIGHT,
      size: randomRange(0.5, 1.5),
      alpha: randomRange(0.1, 0.3),
      vx: randomRange(-5, 5),
      vy: randomRange(-5, 5)
    };
  }
  var Background = class {
    constructor() {
      this.stars = [];
      this.nebulae = [];
      this.dust = [];
      this.driftIntensity = 0;
      this.velocityX = 0;
      this.velocityY = 0;
      for (let i = 0; i < 300; i++) this.stars.push(createStar(0));
      for (let i = 0; i < 150; i++) this.stars.push(createStar(1));
      for (let i = 0; i < 80; i++) this.stars.push(createStar(2));
      for (let i = 0; i < 6; i++) this.nebulae.push(createNebula());
      for (let i = 0; i < 50; i++) this.dust.push(createDust());
    }
    update(dt, playerSpeed2 = 0, vx = 0, vy = 0) {
      const targetDrift = playerSpeed2 < 10 ? 1 : 0;
      const rampSpeed = 3;
      this.driftIntensity += (targetDrift - this.driftIntensity) * Math.min(1, rampSpeed * dt);
      const smoothing = Math.min(1, 8 * dt);
      this.velocityX += (vx - this.velocityX) * smoothing;
      this.velocityY += (vy - this.velocityY) * smoothing;
      for (const d of this.dust) {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        if (d.x < 0) d.x += MAP_WIDTH;
        if (d.x >= MAP_WIDTH) d.x -= MAP_WIDTH;
        if (d.y < 0) d.y += MAP_HEIGHT;
        if (d.y >= MAP_HEIGHT) d.y -= MAP_HEIGHT;
      }
    }
    draw(ctx2, camera2, time) {
      for (const n of this.nebulae) {
        const px = n.x - camera2.x * 0.3;
        const py = n.y - camera2.y * 0.3;
        const gradient = ctx2.createRadialGradient(px, py, 0, px, py, n.radius);
        gradient.addColorStop(0, `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, ${n.alpha})`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx2.fillStyle = gradient;
        ctx2.fillRect(px - n.radius, py - n.radius, n.radius * 2, n.radius * 2);
      }
      const parallaxFactors = PARALLAX_FACTORS;
      const cx = camera2.width / 2;
      const cy = camera2.height / 2;
      const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
      const streakFactors = [0, 0.03, 0.07];
      for (const star of this.stars) {
        const factor = parallaxFactors[star.layer];
        const sx = star.x - camera2.x * factor;
        const sy = star.y - camera2.y * factor;
        let screenX = (sx % camera2.width + camera2.width) % camera2.width;
        let screenY = (sy % camera2.height + camera2.height) % camera2.height;
        const offX = (screenX - cx) / cx;
        const offY = (screenY - cy) / cy;
        const edgeDist = Math.sqrt(offX * offX + offY * offY);
        const perspScale = 1 + edgeDist * 0.075 * (star.layer * 0.5);
        const drawSize = star.size * perspScale;
        if (this.driftIntensity > 0.01) {
          const driftFactor = [5, 12, 20][star.layer];
          const oscillation = Math.sin(time * 0.4) * 0.5 + 0.5;
          screenX += offX * driftFactor * oscillation * this.driftIntensity;
          screenY += offY * driftFactor * oscillation * this.driftIntensity;
        }
        const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.brightness * twinkle;
        const dofAlpha = star.layer === 0 ? alpha * 0.5 : alpha;
        if (star.layer === 2 && star.size > 2) {
          const glowR = drawSize * 3;
          const glow = ctx2.createRadialGradient(screenX, screenY, 0, screenX, screenY, glowR);
          glow.addColorStop(0, `rgba(200, 220, 255, ${dofAlpha * 0.3})`);
          glow.addColorStop(1, "rgba(200, 220, 255, 0)");
          ctx2.fillStyle = glow;
          ctx2.beginPath();
          ctx2.arc(screenX, screenY, glowR, 0, Math.PI * 2);
          ctx2.fill();
        }
        const streakLen = speed * streakFactors[star.layer];
        if (streakLen > 1) {
          const nx = this.velocityX / speed;
          const ny = this.velocityY / speed;
          ctx2.beginPath();
          ctx2.moveTo(screenX - nx * streakLen, screenY - ny * streakLen);
          ctx2.lineTo(screenX + nx * streakLen, screenY + ny * streakLen);
          ctx2.strokeStyle = `rgba(255, 255, 255, ${dofAlpha * 0.7})`;
          ctx2.lineWidth = drawSize * 0.8;
          ctx2.lineCap = "round";
          ctx2.stroke();
        } else {
          ctx2.fillStyle = `rgba(255, 255, 255, ${dofAlpha})`;
          ctx2.beginPath();
          ctx2.arc(screenX, screenY, drawSize, 0, Math.PI * 2);
          ctx2.fill();
        }
      }
      for (const d of this.dust) {
        const screen = camera2.worldToScreen(d.x, d.y);
        if (screen.x < -10 || screen.x > camera2.width + 10 || screen.y < -10 || screen.y > camera2.height + 10) continue;
        ctx2.fillStyle = `rgba(180, 200, 255, ${d.alpha})`;
        ctx2.beginPath();
        ctx2.arc(screen.x, screen.y, d.size, 0, Math.PI * 2);
        ctx2.fill();
      }
    }
    drawWrapZone(ctx2, camera2) {
      const padding = 200;
      if (camera2.x < padding) {
        const w = padding - camera2.x;
        const gradient = ctx2.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, "rgba(30, 0, 60, 0.4)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx2.fillStyle = gradient;
        ctx2.fillRect(0, 0, w, camera2.height);
      }
      if (camera2.x + camera2.width > MAP_WIDTH - padding) {
        const start = Math.max(0, camera2.width - (camera2.x + camera2.width - (MAP_WIDTH - padding)));
        const gradient = ctx2.createLinearGradient(camera2.width, 0, start, 0);
        gradient.addColorStop(0, "rgba(30, 0, 60, 0.4)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx2.fillStyle = gradient;
        ctx2.fillRect(start, 0, camera2.width - start, camera2.height);
      }
      if (camera2.y < padding) {
        const h = padding - camera2.y;
        const gradient = ctx2.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, "rgba(30, 0, 60, 0.4)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx2.fillStyle = gradient;
        ctx2.fillRect(0, 0, camera2.width, h);
      }
      if (camera2.y + camera2.height > MAP_HEIGHT - padding) {
        const start = Math.max(0, camera2.height - (camera2.y + camera2.height - (MAP_HEIGHT - padding)));
        const gradient = ctx2.createLinearGradient(0, camera2.height, 0, start);
        gradient.addColorStop(0, "rgba(30, 0, 60, 0.4)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx2.fillStyle = gradient;
        ctx2.fillRect(0, start, camera2.width, camera2.height - start);
      }
    }
  };

  // src/enemies.ts
  var CHARGE_SPEED = 500;
  var ENEMY_TYPES = {
    swarmer: {
      baseRadius: 10,
      radiusVariation: 4,
      speed: 150,
      baseHp: 38,
      color: [255, 60, 60],
      outlineColor: "#ff3c3c",
      xpDrop: 1,
      damageMultiplier: 1
    },
    drifter: {
      baseRadius: 20,
      radiusVariation: 6,
      speed: 80,
      baseHp: 100,
      color: [255, 160, 40],
      outlineColor: "#ffa028",
      xpDrop: 3,
      damageMultiplier: 1.5
    },
    titan: {
      baseRadius: 40,
      radiusVariation: 10,
      speed: 40,
      baseHp: 300,
      color: [160, 60, 255],
      outlineColor: "#a03cff",
      xpDrop: 8,
      damageMultiplier: 2
    },
    overlord: {
      baseRadius: 55,
      radiusVariation: 10,
      speed: 60,
      baseHp: 800,
      color: [200, 20, 40],
      outlineColor: "#c81428",
      xpDrop: 15,
      damageMultiplier: 2.5
    }
  };
  var Enemy = class {
    constructor(type, x, y) {
      this.dead = false;
      this.rotation = 0;
      this.summonTimer = 0;
      this.canSummon = false;
      this.shootTimer = 0;
      this.projectiles = [];
      this.chargeTimer = 0;
      this.isCharging = false;
      this.chargeVx = 0;
      this.chargeVy = 0;
      this.chargeDuration = 0;
      const config = ENEMY_TYPES[type];
      this.type = type;
      this.x = x;
      this.y = y;
      this.radius = config.baseRadius + randomRange(-config.radiusVariation / 2, config.radiusVariation / 2);
      const sizeRatio = this.radius / config.baseRadius;
      this.maxHp = config.baseHp * sizeRatio;
      this.hp = this.maxHp;
      this.speed = config.speed;
      this.color = config.color;
      this.outlineColor = config.outlineColor;
      this.xpDrop = config.xpDrop;
      this.damageMultiplier = config.damageMultiplier;
      if (type === "overlord") {
        this.summonTimer = 3;
        this.shootTimer = 2;
      }
      if (type === "drifter") {
        this.chargeTimer = randomRange(3, 6);
      }
    }
    update(dt, playerX, playerY) {
      const angle = wrappedAngle(this.x, this.y, playerX, playerY);
      if (this.type === "drifter") {
        if (this.isCharging) {
          this.chargeDuration -= dt;
          this.x += this.chargeVx * dt;
          this.y += this.chargeVy * dt;
          if (this.chargeDuration <= 0) {
            this.isCharging = false;
            this.chargeTimer = randomRange(3, 6);
          }
        } else {
          this.chargeTimer -= dt;
          if (this.chargeTimer <= 0 && wrappedDistance(this.x, this.y, playerX, playerY) < 600) {
            this.isCharging = true;
            this.chargeDuration = 0.6;
            this.chargeVx = Math.cos(angle) * CHARGE_SPEED;
            this.chargeVy = Math.sin(angle) * CHARGE_SPEED;
          } else {
            this.x += Math.cos(angle) * this.speed * dt;
            this.y += Math.sin(angle) * this.speed * dt;
          }
        }
      } else {
        this.x += Math.cos(angle) * this.speed * dt;
        this.y += Math.sin(angle) * this.speed * dt;
      }
      const wrapped = wrapPosition(this.x, this.y);
      this.x = wrapped.x;
      this.y = wrapped.y;
      if (this.type === "overlord") {
        this.rotation += 0.5 * dt;
        this.summonTimer -= dt;
        if (this.summonTimer <= 0) {
          this.summonTimer = 3;
          this.canSummon = true;
        }
        this.shootTimer -= dt;
        if (this.shootTimer <= 0) {
          this.shootTimer = 1.5;
          const projSpeed = 250;
          const spread = 0.15;
          for (let i = -1; i <= 1; i++) {
            const a = angle + i * spread;
            this.projectiles.push({
              x: this.x,
              y: this.y,
              vx: Math.cos(a) * projSpeed,
              vy: Math.sin(a) * projSpeed,
              lifetime: 3,
              radius: 4
            });
          }
        }
      }
      if (this.projectiles.length > 0) {
        for (const p of this.projectiles) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.lifetime -= dt;
        }
        this.projectiles = this.projectiles.filter((p) => p.lifetime > 0);
      }
    }
    takeDamage(amount) {
      this.hp -= amount;
      if (this.hp <= 0) {
        this.hp = 0;
        this.dead = true;
      }
    }
    draw(ctx2, camera2, time) {
      const screen = camera2.worldToScreen(this.x, this.y);
      if (this.type === "drifter" && this.isCharging) {
        const trailLen = 20;
        const nx = -this.chargeVx / CHARGE_SPEED;
        const ny = -this.chargeVy / CHARGE_SPEED;
        for (let i = 1; i <= 4; i++) {
          const tx = screen.x + nx * trailLen * i;
          const ty = screen.y + ny * trailLen * i;
          ctx2.beginPath();
          ctx2.arc(tx, ty, this.radius * (1 - i * 0.15), 0, Math.PI * 2);
          ctx2.fillStyle = `rgba(255, 160, 40, ${0.15 - i * 0.03})`;
          ctx2.fill();
        }
      }
      for (const p of this.projectiles) {
        const ps = camera2.worldToScreen(p.x, p.y);
        const glow = ctx2.createRadialGradient(ps.x, ps.y, 0, ps.x, ps.y, p.radius * 3);
        glow.addColorStop(0, "rgba(255, 255, 255, 0.8)");
        glow.addColorStop(0.4, "rgba(255, 200, 200, 0.3)");
        glow.addColorStop(1, "rgba(255, 100, 100, 0)");
        ctx2.beginPath();
        ctx2.arc(ps.x, ps.y, p.radius * 3, 0, Math.PI * 2);
        ctx2.fillStyle = glow;
        ctx2.fill();
        ctx2.beginPath();
        ctx2.arc(ps.x, ps.y, p.radius, 0, Math.PI * 2);
        ctx2.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx2.fill();
      }
      if (this.type === "overlord") {
        const side = this.radius * 2;
        const pulse = 0.5 + 0.5 * Math.sin(time * 2.5);
        const glowSize = this.radius + 10 + pulse * 8;
        ctx2.save();
        ctx2.translate(screen.x, screen.y);
        ctx2.rotate(this.rotation);
        const gradient = ctx2.createRadialGradient(0, 0, this.radius * 0.5, 0, 0, glowSize * 1.4);
        gradient.addColorStop(0, `rgba(200, 20, 40, ${0.25 + pulse * 0.15})`);
        gradient.addColorStop(1, "rgba(200, 20, 40, 0)");
        ctx2.fillStyle = gradient;
        ctx2.fillRect(-glowSize * 1.4, -glowSize * 1.4, glowSize * 2.8, glowSize * 2.8);
        ctx2.restore();
        ctx2.save();
        ctx2.translate(screen.x, screen.y);
        ctx2.rotate(this.rotation);
        ctx2.strokeStyle = this.outlineColor;
        ctx2.lineWidth = 3;
        ctx2.strokeRect(-side / 2, -side / 2, side, side);
        ctx2.restore();
        const hpRatio = this.hp / this.maxHp;
        if (hpRatio > 0) {
          ctx2.save();
          ctx2.translate(screen.x, screen.y);
          ctx2.rotate(this.rotation);
          ctx2.beginPath();
          const innerSide = side - 2;
          ctx2.rect(-innerSide / 2, -innerSide / 2, innerSide, innerSide);
          ctx2.clip();
          const fillTop = -this.radius + 1 + innerSide * (1 - hpRatio);
          const [r, g, b] = this.color;
          ctx2.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx2.fillRect(-innerSide / 2, fillTop, innerSide, innerSide);
          ctx2.restore();
        }
      } else {
        ctx2.beginPath();
        ctx2.arc(screen.x, screen.y, this.radius, 0, Math.PI * 2);
        ctx2.strokeStyle = this.outlineColor;
        ctx2.lineWidth = 2;
        ctx2.stroke();
        const hpRatio = this.hp / this.maxHp;
        if (hpRatio > 0) {
          ctx2.save();
          ctx2.beginPath();
          ctx2.arc(screen.x, screen.y, this.radius - 1, 0, Math.PI * 2);
          ctx2.clip();
          const fillTop = screen.y + this.radius - this.radius * 2 * hpRatio;
          const [r, g, b] = this.color;
          ctx2.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx2.fillRect(screen.x - this.radius, fillTop, this.radius * 2, this.radius * 2);
          ctx2.restore();
        }
        drawSphereShading(ctx2, screen.x, screen.y, this.radius, ...this.color);
      }
    }
  };
  var EnemySpawner = class {
    constructor() {
      this.enemies = [];
      this.spawnTimer = 0;
    }
    getSpawnConfig(elapsed) {
      const minute = elapsed / 60;
      if (minute < 1) {
        return { spawnInterval: 1, types: [{ type: "swarmer", weight: 1 }] };
      } else if (minute < 2) {
        return { spawnInterval: 0.7, types: [{ type: "swarmer", weight: 3 }, { type: "drifter", weight: 1 }] };
      } else if (minute < 2.5) {
        return { spawnInterval: 0.5, types: [{ type: "swarmer", weight: 3 }, { type: "drifter", weight: 2 }, { type: "titan", weight: 0.5 }] };
      } else if (minute < 3) {
        return {
          spawnInterval: 0.5,
          types: [{ type: "swarmer", weight: 3 }, { type: "drifter", weight: 2 }, { type: "titan", weight: 0.5 }, { type: "overlord", weight: 0.3 }]
        };
      }
      return {
        spawnInterval: 0.3,
        types: [{ type: "swarmer", weight: 2 }, { type: "drifter", weight: 2 }, { type: "titan", weight: 1.5 }, { type: "overlord", weight: 0.8 }]
      };
    }
    pickType(types) {
      const total = types.reduce((s, t) => s + t.weight, 0);
      let roll = Math.random() * total;
      for (const t of types) {
        roll -= t.weight;
        if (roll <= 0) return t.type;
      }
      return types[0].type;
    }
    spawnEnemy(type, camera2) {
      const margin = 100;
      const side = Math.floor(Math.random() * 4);
      let x, y;
      switch (side) {
        case 0:
          x = camera2.x + Math.random() * camera2.width;
          y = camera2.y - margin - Math.random() * 100;
          break;
        case 1:
          x = camera2.x + Math.random() * camera2.width;
          y = camera2.y + camera2.height + margin + Math.random() * 100;
          break;
        case 2:
          x = camera2.x - margin - Math.random() * 100;
          y = camera2.y + Math.random() * camera2.height;
          break;
        default:
          x = camera2.x + camera2.width + margin + Math.random() * 100;
          y = camera2.y + Math.random() * camera2.height;
          break;
      }
      const pos = wrapPosition(x, y);
      if (type === "swarmer") {
        const count = Math.floor(randomRange(3, 6));
        for (let i = 0; i < count; i++) {
          const gp = wrapPosition(pos.x + randomRange(-40, 40), pos.y + randomRange(-40, 40));
          this.enemies.push(new Enemy("swarmer", gp.x, gp.y));
        }
      } else if (type === "drifter" && Math.random() < 0.4) {
        this.enemies.push(new Enemy("drifter", pos.x, pos.y));
        const dp = wrapPosition(pos.x + randomRange(-30, 30), pos.y + randomRange(-30, 30));
        this.enemies.push(new Enemy("drifter", dp.x, dp.y));
      } else {
        this.enemies.push(new Enemy(type, pos.x, pos.y));
      }
    }
    update(dt, elapsed, playerX, playerY, camera2) {
      const config = this.getSpawnConfig(elapsed);
      this.spawnTimer += dt;
      if (this.spawnTimer >= config.spawnInterval) {
        this.spawnTimer = 0;
        this.spawnEnemy(this.pickType(config.types), camera2);
      }
      for (const enemy of this.enemies) {
        enemy.update(dt, playerX, playerY);
      }
      for (const overlord of this.enemies) {
        if (!overlord.canSummon) continue;
        overlord.canSummon = false;
        const count = Math.floor(randomRange(2, 4));
        for (let i = 0; i < count; i++) {
          const sp = wrapPosition(
            overlord.x + randomRange(-80, 80),
            overlord.y + randomRange(-80, 80)
          );
          this.enemies.push(new Enemy("swarmer", sp.x, sp.y));
        }
      }
    }
    removeDead() {
      this.enemies = this.enemies.filter((e) => !e.dead);
    }
    draw(ctx2, camera2, time) {
      for (const enemy of this.enemies) {
        if (camera2.isVisible(enemy.x, enemy.y, enemy.radius + 50)) {
          enemy.draw(ctx2, camera2, time);
        }
      }
    }
  };

  // src/particles.ts
  var DeathParticle = class {
    constructor(x, y, radius, outlineColor, lifetime = 1) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.lifetime = lifetime;
      this.elapsed = 0;
      this.done = false;
      this.vy = -40 - Math.random() * 30;
      this.wobbleSpeed = 2 + Math.random() * 3;
      this.wobbleAmp = 5 + Math.random() * 10;
      this.wobbleOffset = Math.random() * Math.PI * 2;
      [this.r, this.g, this.b] = parseHexColor(outlineColor);
    }
    update(dt) {
      this.elapsed += dt;
      if (this.elapsed >= this.lifetime) {
        this.done = true;
        return;
      }
      this.y += this.vy * dt;
      this.x += Math.sin(this.elapsed * this.wobbleSpeed + this.wobbleOffset) * this.wobbleAmp * dt;
    }
    draw(ctx2, camera2) {
      const alpha = 1 - this.elapsed / this.lifetime;
      const screen = camera2.worldToScreen(this.x, this.y);
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, this.radius, 0, Math.PI * 2);
      ctx2.strokeStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
      ctx2.lineWidth = 2;
      ctx2.stroke();
    }
  };
  var ExplosionParticle = class {
    constructor(x, y, outlineColor) {
      this.x = x;
      this.y = y;
      this.elapsed = 0;
      this.gravity = 60;
      this.done = false;
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 150;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.particleRadius = 1 + Math.random() * 2;
      this.lifetime = 0.5 + Math.random() * 0.3;
      [this.r, this.g, this.b] = parseHexColor(outlineColor);
    }
    update(dt) {
      this.elapsed += dt;
      if (this.elapsed >= this.lifetime) {
        this.done = true;
        return;
      }
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vy += this.gravity * dt;
    }
    draw(ctx2, camera2) {
      const alpha = 1 - this.elapsed / this.lifetime;
      const screen = camera2.worldToScreen(this.x, this.y);
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, this.particleRadius, 0, Math.PI * 2);
      ctx2.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
      ctx2.fill();
    }
  };
  var FlashParticle = class {
    constructor(x, y, maxRadius) {
      this.x = x;
      this.y = y;
      this.maxRadius = maxRadius;
      this.elapsed = 0;
      this.lifetime = 0.2;
      this.done = false;
    }
    update(dt) {
      this.elapsed += dt;
      if (this.elapsed >= this.lifetime) {
        this.done = true;
      }
    }
    draw(ctx2, camera2) {
      const t = this.elapsed / this.lifetime;
      const currentRadius = this.maxRadius * 2 * t;
      const alpha = 0.4 * (1 - t);
      const screen = camera2.worldToScreen(this.x, this.y);
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, currentRadius, 0, Math.PI * 2);
      ctx2.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx2.fill();
    }
  };
  var ParticleSystem = class {
    constructor() {
      this.particles = [];
    }
    spawnDeath(x, y, radius, outlineColor) {
      this.particles.push(new DeathParticle(x, y, radius, outlineColor));
      this.spawnExplosion(x, y, outlineColor);
      if (radius > 25) {
        this.spawnFlash(x, y, radius);
      }
    }
    spawnExplosion(x, y, outlineColor) {
      const count = 8 + Math.floor(Math.random() * 8);
      for (let i = 0; i < count; i++) {
        this.particles.push(new ExplosionParticle(x, y, outlineColor));
      }
    }
    spawnFlash(x, y, radius) {
      this.particles.push(new FlashParticle(x, y, radius));
    }
    update(dt) {
      for (const p of this.particles) p.update(dt);
      this.particles = this.particles.filter((p) => !p.done);
    }
    draw(ctx2, camera2) {
      for (const p of this.particles) p.draw(ctx2, camera2);
    }
  };

  // src/weapons.ts
  var LaserBeam = class {
    constructor() {
      this.name = "Laser Beam";
      this.level = 1;
      this.maxLevel = 10;
      this.cooldownTimer = 0;
      this.firingTimer = 0;
      this.isFiring = false;
      this.targetX = 0;
      this.targetY = 0;
      this.time = 0;
    }
    getStats() {
      const lvl = this.level;
      return {
        damage: 8 + lvl * 4,
        cooldown: Math.max(0.15, 0.8 - lvl * 0.065),
        duration: 0.1 + lvl * 0.01,
        range: 200 + lvl * 40,
        width: 1 + lvl * 0.8,
        glowAlpha: 0.1 + lvl * 0.06,
        particleCount: Math.floor(lvl / 3)
      };
    }
    update(dt, playerX, playerY, enemies) {
      const stats = this.getStats();
      this.time += dt;
      if (this.isFiring) {
        this.firingTimer -= dt;
        if (this.firingTimer <= 0) this.isFiring = false;
      }
      this.cooldownTimer -= dt;
      if (this.cooldownTimer <= 0 && !this.isFiring) {
        let nearest = null;
        let nearestDist = Infinity;
        for (const enemy of enemies) {
          if (enemy.dead) continue;
          const dist = wrappedDistance(playerX, playerY, enemy.x, enemy.y);
          if (dist < stats.range && dist < nearestDist) {
            nearestDist = dist;
            nearest = enemy;
          }
        }
        if (nearest) {
          this.isFiring = true;
          this.firingTimer = stats.duration;
          this.cooldownTimer = stats.cooldown;
          this.targetX = nearest.x;
          this.targetY = nearest.y;
          const angle = wrappedAngle(playerX, playerY, nearest.x, nearest.y);
          if (this.onFire) this.onFire(angle);
          for (const enemy of enemies) {
            if (enemy.dead) continue;
            const dist = wrappedDistance(playerX, playerY, enemy.x, enemy.y);
            if (dist > stats.range) continue;
            const eAngle = wrappedAngle(playerX, playerY, enemy.x, enemy.y);
            const diff = Math.abs(eAngle - angle);
            const normDiff = Math.min(diff, Math.PI * 2 - diff);
            if (dist * Math.sin(normDiff) < enemy.radius + stats.width) {
              enemy.takeDamage(stats.damage);
            }
          }
        }
      }
    }
    draw(ctx2, camera2, playerX, playerY, playerRadius) {
      if (!this.isFiring) return;
      const stats = this.getStats();
      const screen = camera2.worldToScreen(playerX, playerY);
      const delta = wrappedDelta(playerX, playerY, this.targetX, this.targetY);
      const endX = screen.x + delta.x;
      const endY = screen.y + delta.y;
      const beamAngle = Math.atan2(delta.y, delta.x);
      const originX = screen.x + Math.cos(beamAngle) * playerRadius;
      const originY = screen.y + Math.sin(beamAngle) * playerRadius;
      const beamLength = Math.sqrt(delta.x * delta.x + delta.y * delta.y) - playerRadius;
      const perpX = -Math.sin(beamAngle);
      const perpY = Math.cos(beamAngle);
      const amplitude = 0.5 + this.level * 0.6;
      const frequency = 3.5;
      const waveSpeed = 8;
      const segments = 20;
      const points = [];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const along = t * beamLength;
        const wave = Math.sin(t * frequency * Math.PI * 2 + this.time * waveSpeed) * amplitude;
        points.push({
          x: originX + Math.cos(beamAngle) * along + perpX * wave,
          y: originY + Math.sin(beamAngle) * along + perpY * wave
        });
      }
      const drawWavyPath = () => {
        ctx2.beginPath();
        ctx2.moveTo(points[0].x, points[0].y);
        for (let i = 1; i <= segments; i++) ctx2.lineTo(points[i].x, points[i].y);
      };
      if (this.level >= 3) {
        drawWavyPath();
        ctx2.strokeStyle = `rgba(80, 160, 255, ${stats.glowAlpha})`;
        ctx2.lineWidth = stats.width * 5;
        ctx2.lineJoin = "round";
        ctx2.lineCap = "round";
        ctx2.stroke();
      }
      for (let i = 0; i < segments; i++) {
        const t = i / segments;
        const taper = 1 - t * 0.5;
        const r = Math.round(100 + t * 155);
        const g = Math.round(180 + t * 20);
        const b = 255;
        ctx2.beginPath();
        ctx2.moveTo(points[i].x, points[i].y);
        ctx2.lineTo(points[i + 1].x, points[i + 1].y);
        ctx2.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.35 + stats.glowAlpha})`;
        ctx2.lineWidth = stats.width * 2.5 * taper;
        ctx2.lineJoin = "round";
        ctx2.lineCap = "round";
        ctx2.stroke();
      }
      for (let i = 0; i < segments; i++) {
        const t = i / segments;
        const taper = 1 - t * 0.6;
        const g = Math.round(220 + t * 35);
        const b = Math.round(240 + t * 15);
        ctx2.beginPath();
        ctx2.moveTo(points[i].x, points[i].y);
        ctx2.lineTo(points[i + 1].x, points[i + 1].y);
        ctx2.strokeStyle = `rgba(255, ${g}, ${b}, 0.95)`;
        ctx2.lineWidth = stats.width * taper;
        ctx2.lineJoin = "round";
        ctx2.lineCap = "round";
        ctx2.stroke();
      }
      const flashRadius = stats.width * 3 + 4;
      const flashGrad = ctx2.createRadialGradient(endX, endY, 0, endX, endY, flashRadius * 2.5);
      flashGrad.addColorStop(0, "rgba(200, 240, 255, 0.9)");
      flashGrad.addColorStop(0.4, "rgba(100, 200, 255, 0.5)");
      flashGrad.addColorStop(1, "rgba(80, 160, 255, 0)");
      ctx2.beginPath();
      ctx2.arc(endX, endY, flashRadius * 2.5, 0, Math.PI * 2);
      ctx2.fillStyle = flashGrad;
      ctx2.fill();
      ctx2.beginPath();
      ctx2.arc(endX, endY, flashRadius * 0.5, 0, Math.PI * 2);
      ctx2.fillStyle = "rgba(220, 250, 255, 0.95)";
      ctx2.fill();
      if (this.level >= 5) {
        const orbPulse = 0.6 + 0.4 * Math.sin(this.time * 12);
        const orbRadius = stats.width * 2.5 * orbPulse;
        const orbGrad = ctx2.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, orbRadius * 3);
        orbGrad.addColorStop(0, `rgba(180, 220, 255, ${0.8 * orbPulse})`);
        orbGrad.addColorStop(0.5, `rgba(80, 150, 255, ${0.4 * orbPulse})`);
        orbGrad.addColorStop(1, "rgba(60, 120, 255, 0)");
        ctx2.beginPath();
        ctx2.arc(screen.x, screen.y, orbRadius * 3, 0, Math.PI * 2);
        ctx2.fillStyle = orbGrad;
        ctx2.fill();
        ctx2.beginPath();
        ctx2.arc(screen.x, screen.y, orbRadius, 0, Math.PI * 2);
        ctx2.fillStyle = `rgba(210, 235, 255, ${0.9 * orbPulse})`;
        ctx2.fill();
      }
      for (let i = 0; i < stats.particleCount; i++) {
        const t = Math.random();
        const segIdx = Math.floor(t * segments);
        const px = points[segIdx].x + (Math.random() - 0.5) * stats.width * 3;
        const py = points[segIdx].y + (Math.random() - 0.5) * stats.width * 3;
        ctx2.fillStyle = `rgba(200, 230, 255, ${0.5 + Math.random() * 0.5})`;
        ctx2.beginPath();
        ctx2.arc(px, py, Math.random() * 2, 0, Math.PI * 2);
        ctx2.fill();
      }
    }
  };
  var OrbitShield = class {
    constructor() {
      this.name = "Orbit Shield";
      this.level = 1;
      this.maxLevel = 10;
      this.angle = 0;
    }
    getStats() {
      const lvl = this.level;
      return {
        damage: 5 + lvl * 3,
        orbitRadius: 50 + lvl * 12,
        projectileCount: 2 + Math.floor(lvl / 2),
        projectileRadius: 3 + lvl * 0.5,
        rotationSpeed: 2 + lvl * 0.3,
        trailLength: Math.floor(lvl / 2),
        glowAlpha: 0.1 + lvl * 0.05
      };
    }
    update(dt, playerX, playerY, enemies) {
      const stats = this.getStats();
      this.angle += stats.rotationSpeed * dt;
      for (let i = 0; i < stats.projectileCount; i++) {
        const a = this.angle + Math.PI * 2 / stats.projectileCount * i;
        const px = playerX + Math.cos(a) * stats.orbitRadius;
        const py = playerY + Math.sin(a) * stats.orbitRadius;
        for (const enemy of enemies) {
          if (enemy.dead) continue;
          if (wrappedDistance(px, py, enemy.x, enemy.y) < stats.projectileRadius + enemy.radius) {
            enemy.takeDamage(stats.damage * dt * 10);
          }
        }
      }
    }
    draw(ctx2, camera2, playerX, playerY, _playerRadius) {
      const stats = this.getStats();
      const screen = camera2.worldToScreen(playerX, playerY);
      for (let i = 0; i < stats.projectileCount; i++) {
        const a = this.angle + Math.PI * 2 / stats.projectileCount * i;
        const px = screen.x + Math.cos(a) * stats.orbitRadius;
        const py = screen.y + Math.sin(a) * stats.orbitRadius;
        for (let t = 1; t <= stats.trailLength; t++) {
          const ta = a - t * 0.15;
          const tx = screen.x + Math.cos(ta) * stats.orbitRadius;
          const ty = screen.y + Math.sin(ta) * stats.orbitRadius;
          ctx2.beginPath();
          ctx2.arc(tx, ty, stats.projectileRadius * 0.7, 0, Math.PI * 2);
          ctx2.fillStyle = `rgba(100, 200, 255, ${(1 - t / (stats.trailLength + 1)) * 0.4})`;
          ctx2.fill();
        }
        ctx2.beginPath();
        ctx2.arc(px, py, stats.projectileRadius * 2.5, 0, Math.PI * 2);
        ctx2.fillStyle = `rgba(80, 160, 255, ${stats.glowAlpha})`;
        ctx2.fill();
        ctx2.beginPath();
        ctx2.arc(px, py, stats.projectileRadius, 0, Math.PI * 2);
        ctx2.fillStyle = "rgba(180, 220, 255, 0.9)";
        ctx2.fill();
        ctx2.beginPath();
        ctx2.arc(px, py, stats.projectileRadius * 0.4, 0, Math.PI * 2);
        ctx2.fillStyle = "#ffffff";
        ctx2.fill();
      }
      if (this.level >= 5) {
        ctx2.beginPath();
        ctx2.arc(screen.x, screen.y, stats.orbitRadius, 0, Math.PI * 2);
        ctx2.strokeStyle = "rgba(80, 160, 255, 0.08)";
        ctx2.lineWidth = 1;
        ctx2.stroke();
      }
    }
  };
  var NovaBlast = class {
    constructor() {
      this.name = "Nova Blast";
      this.level = 1;
      this.maxLevel = 10;
      this.cooldownTimer = 0;
      this.blastRadius = 0;
      this.isBlasting = false;
      this.hasDealtDamage = false;
    }
    getStats() {
      const lvl = this.level;
      return {
        damage: 15 + lvl * 8,
        cooldown: Math.max(1.5, 4 - lvl * 0.25),
        maxRadius: 80 + lvl * 25,
        expandSpeed: 300 + lvl * 50,
        ringWidth: 2 + lvl * 0.8,
        debrisCount: Math.floor(lvl / 2),
        innerGlow: lvl >= 4,
        shockwave: lvl >= 7
      };
    }
    update(dt, playerX, playerY, enemies) {
      const stats = this.getStats();
      if (this.isBlasting) {
        this.blastRadius += stats.expandSpeed * dt;
        if (!this.hasDealtDamage) {
          for (const enemy of enemies) {
            if (enemy.dead) continue;
            if (wrappedDistance(playerX, playerY, enemy.x, enemy.y) < stats.maxRadius) {
              enemy.takeDamage(stats.damage);
            }
          }
          this.hasDealtDamage = true;
        }
        if (this.blastRadius >= stats.maxRadius) {
          this.isBlasting = false;
          this.blastRadius = 0;
        }
      }
      this.cooldownTimer -= dt;
      if (this.cooldownTimer <= 0 && !this.isBlasting) {
        this.isBlasting = true;
        this.cooldownTimer = stats.cooldown;
        this.blastRadius = 0;
        this.hasDealtDamage = false;
      }
    }
    draw(ctx2, camera2, playerX, playerY, _playerRadius) {
      if (!this.isBlasting) return;
      const stats = this.getStats();
      const screen = camera2.worldToScreen(playerX, playerY);
      const progress = this.blastRadius / stats.maxRadius;
      const alpha = 1 - progress;
      if (stats.innerGlow) {
        const gradient = ctx2.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, this.blastRadius);
        gradient.addColorStop(0, `rgba(255, 200, 100, ${alpha * 0.15})`);
        gradient.addColorStop(1, "rgba(255, 200, 100, 0)");
        ctx2.fillStyle = gradient;
        ctx2.beginPath();
        ctx2.arc(screen.x, screen.y, this.blastRadius, 0, Math.PI * 2);
        ctx2.fill();
      }
      if (stats.shockwave) {
        ctx2.beginPath();
        ctx2.arc(screen.x, screen.y, this.blastRadius * 1.05, 0, Math.PI * 2);
        ctx2.strokeStyle = `rgba(255, 220, 150, ${alpha * 0.3})`;
        ctx2.lineWidth = stats.ringWidth * 0.5;
        ctx2.stroke();
      }
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, this.blastRadius, 0, Math.PI * 2);
      ctx2.strokeStyle = `rgba(255, 180, 80, ${alpha})`;
      ctx2.lineWidth = stats.ringWidth;
      ctx2.stroke();
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, this.blastRadius, 0, Math.PI * 2);
      ctx2.strokeStyle = `rgba(255, 150, 50, ${alpha * 0.3})`;
      ctx2.lineWidth = stats.ringWidth * 3;
      ctx2.stroke();
      for (let i = 0; i < stats.debrisCount; i++) {
        const angle = Math.PI * 2 / stats.debrisCount * i + progress * 2;
        const dx = screen.x + Math.cos(angle) * this.blastRadius;
        const dy = screen.y + Math.sin(angle) * this.blastRadius;
        ctx2.fillStyle = `rgba(255, 200, 100, ${alpha})`;
        ctx2.beginPath();
        ctx2.arc(dx, dy, 2 + this.level * 0.3, 0, Math.PI * 2);
        ctx2.fill();
      }
    }
  };
  var WeaponManager = class {
    constructor() {
      this.weapons = [];
      this.laser = new LaserBeam();
      this.weapons.push(this.laser);
    }
    setOnLaserFire(cb) {
      this.laser.onFire = cb;
    }
    addWeapon(type) {
      if (type === "orbit" && !this.hasWeapon("Orbit Shield")) {
        this.weapons.push(new OrbitShield());
      } else if (type === "nova" && !this.hasWeapon("Nova Blast")) {
        this.weapons.push(new NovaBlast());
      }
    }
    hasWeapon(name) {
      return this.weapons.some((w) => w.name === name);
    }
    getWeapon(name) {
      return this.weapons.find((w) => w.name === name);
    }
    allMaxed() {
      return this.weapons.length === 3 && this.weapons.every((w) => w.level >= w.maxLevel);
    }
    update(dt, playerX, playerY, enemies) {
      for (const weapon of this.weapons) weapon.update(dt, playerX, playerY, enemies);
    }
    draw(ctx2, camera2, playerX, playerY, playerRadius) {
      for (const weapon of this.weapons) weapon.draw(ctx2, camera2, playerX, playerY, playerRadius);
    }
  };

  // src/game.ts
  var Game = class {
    constructor() {
      this.state = "title" /* TITLE */;
      this.elapsedTime = 0;
      this.gameDuration = 300;
      this.notifications = [];
    }
    get timeRemaining() {
      return Math.max(0, this.gameDuration - this.elapsedTime);
    }
    get timeRemainingFormatted() {
      return formatTime(this.timeRemaining);
    }
    applyRandomUpgrade(wm) {
      const choices = [];
      if (!wm.hasWeapon("Orbit Shield")) {
        choices.push({ type: "new", weapon: "orbit", label: "New weapon: Orbit Shield" });
      }
      if (!wm.hasWeapon("Nova Blast")) {
        choices.push({ type: "new", weapon: "nova", label: "New weapon: Nova Blast" });
      }
      for (const w of wm.weapons) {
        if (w.level < w.maxLevel) {
          choices.push({ type: "upgrade", weapon: w.name, label: `${w.name} \u2192 Lv.${w.level + 1}` });
        }
      }
      if (choices.length === 0) return;
      const choice = choices[Math.floor(Math.random() * choices.length)];
      if (choice.type === "new") {
        wm.addWeapon(choice.weapon);
      } else {
        const weapon = wm.getWeapon(choice.weapon);
        if (weapon) weapon.level++;
      }
      this.notifications.push({ text: choice.label, timer: 2.5, alpha: 1 });
    }
    updateNotifications(dt) {
      for (const n of this.notifications) {
        n.timer -= dt;
        if (n.timer < 0.5) {
          n.alpha = Math.max(0, n.timer / 0.5);
        }
      }
      this.notifications = this.notifications.filter((n) => n.timer > 0);
    }
  };

  // src/ui.ts
  var UI = class {
    drawHUD(ctx2, canvas2, game2, player2, wm) {
      ctx2.fillStyle = "#ffffff";
      ctx2.font = "bold 28px monospace";
      ctx2.textAlign = "center";
      ctx2.fillText(game2.timeRemainingFormatted, canvas2.width / 2, 40);
      ctx2.font = "18px monospace";
      ctx2.textAlign = "right";
      ctx2.fillText(`Kills: ${player2.kills}`, canvas2.width - 20, 35);
      const barW = canvas2.width * 0.6;
      const barH = 8;
      const barX = (canvas2.width - barW) / 2;
      const barY = canvas2.height - 30;
      const xpRatio = player2.xp / player2.getXpForNextLevel();
      ctx2.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx2.fillRect(barX, barY, barW, barH);
      ctx2.fillStyle = "rgba(100, 200, 255, 0.7)";
      ctx2.fillRect(barX, barY, barW * xpRatio, barH);
      ctx2.fillStyle = "#aaa";
      ctx2.font = "12px monospace";
      ctx2.textAlign = "center";
      ctx2.fillText(`Level ${player2.level}`, canvas2.width / 2, barY - 5);
      ctx2.textAlign = "left";
      ctx2.font = "14px monospace";
      let wy = canvas2.height - 80;
      for (const w of wm.weapons) {
        ctx2.fillStyle = "#ccc";
        ctx2.fillText(`${w.name} Lv.${w.level}`, 20, wy);
        wy -= 22;
      }
    }
    drawTitleScreen(ctx2, canvas2) {
      ctx2.fillStyle = "#ffffff";
      ctx2.font = "bold 48px monospace";
      ctx2.textAlign = "center";
      ctx2.fillText("UNIVERSE EATER", canvas2.width / 2, canvas2.height / 2 - 30);
      ctx2.font = "18px monospace";
      ctx2.fillStyle = "#888";
      ctx2.fillText("Press any key to start", canvas2.width / 2, canvas2.height / 2 + 30);
    }
    drawNotifications(ctx2, canvas2, game2) {
      const notifications = game2.notifications;
      if (notifications.length === 0) return;
      ctx2.textAlign = "center";
      for (let i = 0; i < notifications.length; i++) {
        const n = notifications[i];
        const y = 80 + i * 40;
        ctx2.font = "bold 18px monospace";
        const textWidth = ctx2.measureText(n.text).width;
        const pillW = textWidth + 30;
        const pillH = 30;
        const pillX = (canvas2.width - pillW) / 2;
        ctx2.fillStyle = `rgba(100, 200, 255, ${0.2 * n.alpha})`;
        ctx2.strokeStyle = `rgba(100, 200, 255, ${0.5 * n.alpha})`;
        ctx2.lineWidth = 1;
        ctx2.beginPath();
        ctx2.roundRect(pillX, y - pillH / 2 - 4, pillW, pillH, 6);
        ctx2.fill();
        ctx2.stroke();
        ctx2.fillStyle = `rgba(255, 255, 255, ${n.alpha})`;
        ctx2.fillText(n.text, canvas2.width / 2, y);
      }
    }
    drawGameOver(ctx2, canvas2, player2, game2) {
      ctx2.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx2.fillRect(0, 0, canvas2.width, canvas2.height);
      ctx2.fillStyle = "#ff4444";
      ctx2.font = "bold 48px monospace";
      ctx2.textAlign = "center";
      ctx2.fillText("GAME OVER", canvas2.width / 2, canvas2.height / 2 - 50);
      ctx2.fillStyle = "#fff";
      ctx2.font = "20px monospace";
      ctx2.fillText(`Survived: ${formatTime(game2.elapsedTime)}`, canvas2.width / 2, canvas2.height / 2 + 10);
      ctx2.fillText(`Kills: ${player2.kills}`, canvas2.width / 2, canvas2.height / 2 + 40);
      ctx2.fillStyle = "#888";
      ctx2.font = "16px monospace";
      ctx2.fillText("Press any key to restart", canvas2.width / 2, canvas2.height / 2 + 90);
    }
    drawVictory(ctx2, canvas2, player2) {
      ctx2.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx2.fillRect(0, 0, canvas2.width, canvas2.height);
      ctx2.fillStyle = "#44ff88";
      ctx2.font = "bold 48px monospace";
      ctx2.textAlign = "center";
      ctx2.fillText("VICTORY!", canvas2.width / 2, canvas2.height / 2 - 50);
      ctx2.fillStyle = "#fff";
      ctx2.font = "20px monospace";
      ctx2.fillText(`Total Kills: ${player2.kills}`, canvas2.width / 2, canvas2.height / 2 + 10);
      ctx2.fillText(`Level Reached: ${player2.level}`, canvas2.width / 2, canvas2.height / 2 + 40);
      ctx2.fillStyle = "#888";
      ctx2.font = "16px monospace";
      ctx2.fillText("Press any key to restart", canvas2.width / 2, canvas2.height / 2 + 90);
    }
  };

  // src/main.ts
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  var camera;
  var player;
  var background;
  var spawner;
  var particles;
  var weaponManager;
  var game;
  var ui = new UI();
  function init() {
    camera = new Camera(canvas.width, canvas.height);
    player = new Player();
    background = new Background();
    spawner = new EnemySpawner();
    particles = new ParticleSystem();
    weaponManager = new WeaponManager();
    weaponManager.setOnLaserFire((angle) => player.addRipple(angle));
    game = new Game();
  }
  var lastTime = 0;
  var prevPlayerX = 0;
  var prevPlayerY = 0;
  var playerSpeed = 0;
  var playerVx = 0;
  var playerVy = 0;
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (camera) camera.resize(canvas.width, canvas.height);
  }
  window.addEventListener("resize", resize);
  resize();
  init();
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && game.state === "playing" /* PLAYING */) {
      game.state = "paused" /* PAUSED */;
      return;
    }
    if (e.key === "Escape" && game.state === "paused" /* PAUSED */) {
      game.state = "playing" /* PLAYING */;
      return;
    }
    if (game.state === "title" /* TITLE */) {
      game.state = "playing" /* PLAYING */;
    } else if (game.state === "gameOver" /* GAME_OVER */ || game.state === "victory" /* VICTORY */) {
      init();
      game.state = "playing" /* PLAYING */;
    }
  });
  function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1e3, 0.05);
    lastTime = timestamp;
    if (dt > 0) {
      const dx = player.x - prevPlayerX;
      const dy = player.y - prevPlayerY;
      playerVx = dx / dt;
      playerVy = dy / dt;
      playerSpeed = Math.sqrt(playerVx * playerVx + playerVy * playerVy);
    }
    prevPlayerX = player.x;
    prevPlayerY = player.y;
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (game.state === "title" /* TITLE */) {
      background.update(dt, playerSpeed, playerVx, playerVy);
      background.draw(ctx, camera, timestamp / 1e3);
      ui.drawTitleScreen(ctx, canvas);
    } else if (game.state === "playing" /* PLAYING */) {
      game.elapsedTime += dt;
      if (game.timeRemaining <= 0) {
        game.state = "victory" /* VICTORY */;
      }
      if (player.isDead()) {
        game.state = "gameOver" /* GAME_OVER */;
      }
      player.update(dt);
      player.regenerate(dt);
      camera.follow(player.x, player.y);
      background.update(dt, playerSpeed, playerVx, playerVy);
      spawner.update(dt, game.elapsedTime, player.x, player.y, camera);
      const baseDmg = 10;
      for (const enemy of spawner.enemies) {
        if (wrappedDistance(player.x, player.y, enemy.x, enemy.y) < player.radius + enemy.radius) {
          player.takeDamage(baseDmg * enemy.damageMultiplier * dt);
        }
        for (const p of enemy.projectiles) {
          if (wrappedDistance(player.x, player.y, p.x, p.y) < player.radius + p.radius) {
            player.takeDamage(8);
            p.lifetime = 0;
          }
        }
      }
      weaponManager.update(dt, player.x, player.y, spawner.enemies);
      player.updateRipples(dt);
      for (const enemy of spawner.enemies) {
        if (enemy.dead) {
          particles.spawnDeath(enemy.x, enemy.y, enemy.radius, enemy.outlineColor);
          player.kills++;
          const leveledUp = player.addXp(enemy.xpDrop);
          if (leveledUp && !weaponManager.allMaxed()) {
            game.applyRandomUpgrade(weaponManager);
          }
        }
      }
      spawner.removeDead();
      particles.update(dt);
      game.updateNotifications(dt);
      background.draw(ctx, camera, timestamp / 1e3);
      spawner.draw(ctx, camera, timestamp / 1e3);
      particles.draw(ctx, camera);
      weaponManager.draw(ctx, camera, player.x, player.y, player.radius);
      player.draw(ctx, camera);
      background.drawWrapZone(ctx, camera);
      ui.drawHUD(ctx, canvas, game, player, weaponManager);
      ui.drawNotifications(ctx, canvas, game);
    } else if (game.state === "paused" /* PAUSED */) {
      background.draw(ctx, camera, timestamp / 1e3);
      spawner.draw(ctx, camera, timestamp / 1e3);
      weaponManager.draw(ctx, camera, player.x, player.y, player.radius);
      player.draw(ctx, camera);
      background.drawWrapZone(ctx, camera);
      ui.drawHUD(ctx, canvas, game, player, weaponManager);
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 48px monospace";
      ctx.textAlign = "center";
      ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = "18px monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fillText("Press ESC to resume", canvas.width / 2, canvas.height / 2 + 30);
    } else if (game.state === "gameOver" /* GAME_OVER */) {
      background.draw(ctx, camera, timestamp / 1e3);
      ui.drawGameOver(ctx, canvas, player, game);
    } else if (game.state === "victory" /* VICTORY */) {
      background.draw(ctx, camera, timestamp / 1e3);
      ui.drawVictory(ctx, canvas, player);
    }
    requestAnimationFrame(gameLoop);
  }
  requestAnimationFrame((t) => {
    lastTime = t;
    gameLoop(t);
  });
})();
//# sourceMappingURL=bundle.js.map
