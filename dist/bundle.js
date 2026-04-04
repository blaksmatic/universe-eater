"use strict";
(() => {
  // src/camera.ts
  var Camera = class {
    constructor(canvasWidth, canvasHeight) {
      this.x = 0;
      this.y = 0;
      // Shake state
      this.shakeIntensity = 0;
      this.shakeDuration = 0;
      this.shakeTimer = 0;
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
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
    shake(intensity, duration) {
      if (intensity > this.shakeIntensity) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeTimer = duration;
      }
    }
    updateShake(dt) {
      if (this.shakeTimer > 0) {
        this.shakeTimer -= dt;
        const t = Math.max(0, this.shakeTimer / this.shakeDuration);
        const mag = this.shakeIntensity * t;
        this.shakeOffsetX = (Math.random() * 2 - 1) * mag;
        this.shakeOffsetY = (Math.random() * 2 - 1) * mag;
        if (this.shakeTimer <= 0) {
          this.shakeIntensity = 0;
          this.shakeOffsetX = 0;
          this.shakeOffsetY = 0;
        }
      }
    }
    worldToScreen(wx, wy) {
      return {
        x: wx - this.x + this.shakeOffsetX,
        y: wy - this.y + this.shakeOffsetY
      };
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
  var touch = {
    active: false,
    dx: 0,
    dy: 0,
    // Joystick state
    touchId: -1,
    centerX: 0,
    centerY: 0,
    // Pause button tap
    pauseTapped: false,
    // Any tap (for starting/restarting)
    anyTap: false
  };
  var JOYSTICK_RADIUS = 60;
  var DEAD_ZONE = 10;
  function isMobile() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }
  function isTouchDevice() {
    return isMobile();
  }
  function isPauseButton(x, y) {
    return x > window.innerWidth - 70 && y < 70;
  }
  function handleTouchStart(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (isPauseButton(t.clientX, t.clientY)) {
        touch.pauseTapped = true;
        continue;
      }
      if (touch.touchId === -1) {
        touch.touchId = t.identifier;
        touch.centerX = t.clientX;
        touch.centerY = t.clientY;
        touch.active = true;
        touch.dx = 0;
        touch.dy = 0;
      }
      touch.anyTap = true;
    }
  }
  function handleTouchMove(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === touch.touchId) {
        const rawDx = t.clientX - touch.centerX;
        const rawDy = t.clientY - touch.centerY;
        const dist = Math.sqrt(rawDx * rawDx + rawDy * rawDy);
        if (dist < DEAD_ZONE) {
          touch.dx = 0;
          touch.dy = 0;
        } else {
          const clamped = Math.min(dist, JOYSTICK_RADIUS);
          touch.dx = rawDx / dist * (clamped / JOYSTICK_RADIUS);
          touch.dy = rawDy / dist * (clamped / JOYSTICK_RADIUS);
        }
      }
    }
  }
  function handleTouchEnd(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === touch.touchId) {
        touch.touchId = -1;
        touch.active = false;
        touch.dx = 0;
        touch.dy = 0;
      }
    }
  }
  if (isMobile()) {
    document.addEventListener("touchstart", handleTouchStart, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: false });
    document.addEventListener("touchcancel", handleTouchEnd, { passive: false });
  }
  function consumePauseTap() {
    if (touch.pauseTapped) {
      touch.pauseTapped = false;
      return true;
    }
    return false;
  }
  function consumeAnyTap() {
    if (touch.anyTap) {
      touch.anyTap = false;
      return true;
    }
    return false;
  }
  var JOYSTICK_DISPLAY_RADIUS = JOYSTICK_RADIUS;

  // src/utils.ts
  var MAP_WIDTH = 5e4;
  var MAP_HEIGHT = 5e4;
  var TWO_PI = Math.PI * 2;
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
    ctx2.arc(cx, cy, radius - 1, 0, TWO_PI);
    ctx2.fillStyle = grad;
    ctx2.fill();
  }
  function tracePoly(ctx2, cx, cy, r, sides, rot) {
    ctx2.beginPath();
    for (let i = 0; i <= sides; i++) {
      const angle = rot + i / sides * TWO_PI;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      if (i === 0) ctx2.moveTo(px, py);
      else ctx2.lineTo(px, py);
    }
    ctx2.closePath();
  }
  function easeOutBack(t) {
    const c = 1.4;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  }
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
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
      if (touch.active) {
        dx = touch.dx;
        dy = touch.dy;
      } else {
        if (isKeyDown("w") || isKeyDown("arrowup")) dy -= 1;
        if (isKeyDown("s") || isKeyDown("arrowdown")) dy += 1;
        if (isKeyDown("a") || isKeyDown("arrowleft")) dx -= 1;
        if (isKeyDown("d") || isKeyDown("arrowright")) dx += 1;
        if (dx !== 0 && dy !== 0) {
          const len = Math.sqrt(dx * dx + dy * dy);
          dx /= len;
          dy /= len;
        }
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
      ctx2.arc(screen.x, screen.y, this.radius - 1, 0, TWO_PI);
      ctx2.fillStyle = `rgba(20, 50, 100, ${0.3 + hpRatio * 0.4})`;
      ctx2.fill();
      drawSphereShading(ctx2, screen.x, screen.y, this.radius, 60, 120, 255);
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, this.radius, 0, TWO_PI);
      ctx2.strokeStyle = "#4488ff";
      ctx2.lineWidth = 2;
      ctx2.stroke();
      if (hpRatio > 0) {
        const arcRadius = this.radius + 5;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + TWO_PI * hpRatio;
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
      ctx2.arc(screen.x, screen.y, this.radius + 4, 0, TWO_PI);
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
      twinkleOffset: Math.random() * TWO_PI
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
          ctx2.arc(screenX, screenY, glowR, 0, TWO_PI);
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
          ctx2.arc(screenX, screenY, drawSize, 0, TWO_PI);
          ctx2.fill();
        }
      }
      for (const d of this.dust) {
        const screen = camera2.worldToScreen(d.x, d.y);
        if (screen.x < -10 || screen.x > camera2.width + 10 || screen.y < -10 || screen.y > camera2.height + 10) continue;
        ctx2.fillStyle = `rgba(180, 200, 255, ${d.alpha})`;
        ctx2.beginPath();
        ctx2.arc(screen.x, screen.y, d.size, 0, TWO_PI);
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

  // src/geometry.ts
  var NEON = [
    [0, 255, 255],
    // cyan
    [255, 0, 128],
    // hot pink
    [128, 0, 255],
    // purple
    [0, 128, 255],
    // electric blue
    [0, 255, 160]
    // neon green
  ];
  var RING_DEFS = [
    { sides: 6, radius: 180, speed: 0.15, color: 0, alpha: 0.045 },
    { sides: 4, radius: 300, speed: -0.1, color: 1, alpha: 0.035 },
    { sides: 8, radius: 420, speed: 0.07, color: 3, alpha: 0.028 },
    { sides: 3, radius: 550, speed: -0.18, color: 2, alpha: 0.022 },
    { sides: 5, radius: 700, speed: 0.12, color: 4, alpha: 0.02 },
    { sides: 10, radius: 900, speed: -0.04, color: 0, alpha: 0.016 }
  ];
  var NUM_RADIALS = 24;
  var RADIAL_MAX_LEN = 1200;
  var GRID_SPACING = 250;
  var GRID_PARALLAX = 0.12;
  var GRID_WAVE_SEGMENTS = 10;
  var GRID_WAVE_AMP = 6;
  var BackgroundGeometry = class {
    constructor() {
      this.shapes = [];
      for (let i = 0; i < 30; i++) {
        this.shapes.push({
          x: randomRange(-3e3, 3e3),
          y: randomRange(-3e3, 3e3),
          sides: [3, 4, 5, 6, 8][Math.floor(Math.random() * 5)],
          radius: randomRange(40, 180),
          rotation: Math.random() * TWO_PI,
          rotSpeed: randomRange(-0.2, 0.2),
          color: Math.floor(Math.random() * NEON.length),
          alpha: randomRange(0.015, 0.04),
          pulsePhase: Math.random() * TWO_PI,
          parallax: randomRange(0.05, 0.25)
        });
      }
    }
    update(dt) {
      for (const s of this.shapes) {
        s.rotation += s.rotSpeed * dt;
      }
    }
    draw(ctx2, camera2, time, playerX, playerY) {
      this.drawGrid(ctx2, camera2, time);
      this.drawRadials(ctx2, camera2, time, playerX, playerY);
      this.drawFloatingShapes(ctx2, camera2, time);
      this.drawRings(ctx2, camera2, time, playerX, playerY);
    }
    // ── Grid: wavy neon lines with glow ───────────────────────────
    drawGrid(ctx2, camera2, time) {
      const sp = GRID_SPACING;
      const offX = camera2.x * GRID_PARALLAX % sp;
      const offY = camera2.y * GRID_PARALLAX % sp;
      const pulse = 0.6 + 0.4 * Math.sin(time * 0.3);
      const baseAlpha = 0.024 * pulse;
      const [r, g, b] = NEON[3];
      ctx2.lineWidth = 5;
      ctx2.strokeStyle = `rgba(${r}, ${g}, ${b}, ${baseAlpha * 0.3})`;
      this.traceGridPaths(ctx2, camera2, sp, offX, offY, time);
      ctx2.stroke();
      ctx2.lineWidth = 1;
      ctx2.strokeStyle = `rgba(${r}, ${g}, ${b}, ${baseAlpha})`;
      this.traceGridPaths(ctx2, camera2, sp, offX, offY, time);
      ctx2.stroke();
      ctx2.fillStyle = `rgba(${r + 50}, ${g + 70}, ${b}, ${baseAlpha * 1.8})`;
      for (let gx = -offX - sp; gx <= camera2.width + sp; gx += sp) {
        for (let gy = -offY - sp; gy <= camera2.height + sp; gy += sp) {
          const wx = gx + Math.sin(gy * 8e-3 + time * 0.4) * GRID_WAVE_AMP;
          const wy = gy + Math.sin(gx * 8e-3 + time * 0.35) * GRID_WAVE_AMP;
          ctx2.beginPath();
          ctx2.arc(wx, wy, 1.8, 0, TWO_PI);
          ctx2.fill();
        }
      }
    }
    traceGridPaths(ctx2, camera2, sp, offX, offY, time) {
      const segs = GRID_WAVE_SEGMENTS;
      const amp = GRID_WAVE_AMP;
      ctx2.beginPath();
      for (let gx = -offX - sp; gx <= camera2.width + sp; gx += sp) {
        for (let s = 0; s <= segs; s++) {
          const t = s / segs;
          const y = t * camera2.height;
          const wx = gx + Math.sin(y * 8e-3 + time * 0.4) * amp;
          if (s === 0) ctx2.moveTo(wx, y);
          else ctx2.lineTo(wx, y);
        }
      }
      for (let gy = -offY - sp; gy <= camera2.height + sp; gy += sp) {
        for (let s = 0; s <= segs; s++) {
          const t = s / segs;
          const x = t * camera2.width;
          const wy = gy + Math.sin(x * 8e-3 + time * 0.35) * amp;
          if (s === 0) ctx2.moveTo(x, wy);
          else ctx2.lineTo(x, wy);
        }
      }
    }
    // ── Radial light rays from player ─────────────────────────────
    drawRadials(ctx2, camera2, time, px, py) {
      const screen = camera2.worldToScreen(px, py);
      const cx = screen.x;
      const cy = screen.y;
      const baseRot = time * 0.05;
      ctx2.lineWidth = 1.5;
      ctx2.lineCap = "round";
      for (let i = 0; i < NUM_RADIALS; i++) {
        const angle = baseRot + i / NUM_RADIALS * TWO_PI;
        const pulse = 0.5 + 0.5 * Math.sin(time * 0.8 + i * 0.5);
        const len = RADIAL_MAX_LEN * (0.5 + 0.5 * pulse);
        const alpha = 0.015 * pulse;
        const ex = cx + Math.cos(angle) * len;
        const ey = cy + Math.sin(angle) * len;
        ctx2.beginPath();
        ctx2.moveTo(cx, cy);
        ctx2.lineTo(ex, ey);
        ctx2.strokeStyle = `rgba(0, 180, 255, ${alpha})`;
        ctx2.stroke();
      }
    }
    // ── Floating wireframe shapes with parallax ───────────────────
    drawFloatingShapes(ctx2, camera2, time) {
      for (const s of this.shapes) {
        const sx = s.x - camera2.x * s.parallax;
        const sy = s.y - camera2.y * s.parallax;
        const padW = camera2.width + 400;
        const padH = camera2.height + 400;
        const screenX = (sx % padW + padW) % padW - 200;
        const screenY = (sy % padH + padH) % padH - 200;
        const pulse = 1 + 0.15 * Math.sin(time * 0.8 + s.pulsePhase);
        const r = s.radius * pulse;
        const [cr, cg, cb] = NEON[s.color];
        const alpha = s.alpha * (0.7 + 0.3 * Math.sin(time * 0.5 + s.pulsePhase));
        this.drawNeonPoly(ctx2, screenX, screenY, r, s.sides, s.rotation, cr, cg, cb, alpha, 4);
      }
    }
    // ── Concentric rotating polygon rings around player ───────────
    drawRings(ctx2, camera2, time, px, py) {
      const screen = camera2.worldToScreen(px, py);
      const cx = screen.x;
      const cy = screen.y;
      for (const ring of RING_DEFS) {
        const breathe = 1 + 0.08 * Math.sin(time * 0.6 + ring.radius * 0.01);
        const r = ring.radius * breathe;
        const rot = time * ring.speed;
        const [cr, cg, cb] = NEON[ring.color];
        const a = ring.alpha * (0.7 + 0.3 * Math.sin(time * 0.4 + ring.radius * 5e-3));
        this.drawNeonPoly(ctx2, cx, cy, r, ring.sides, rot, cr, cg, cb, a, 3);
      }
    }
    // ── Helpers ───────────────────────────────────────────────────
    drawNeonPoly(ctx2, cx, cy, r, sides, rot, cr, cg, cb, alpha, glowWidth) {
      ctx2.lineWidth = glowWidth;
      ctx2.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.35})`;
      tracePoly(ctx2, cx, cy, r, sides, rot);
      ctx2.stroke();
      ctx2.lineWidth = 1;
      ctx2.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
      tracePoly(ctx2, cx, cy, r, sides, rot);
      ctx2.stroke();
      ctx2.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha * 1.8})`;
      for (let i = 0; i < sides; i++) {
        const a = rot + i / sides * TWO_PI;
        ctx2.beginPath();
        ctx2.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2, 0, TWO_PI);
        ctx2.fill();
      }
    }
  };

  // src/enemies.ts
  var CHARGE_SPEED = 500;
  var SPAWN_DURATION = 0.3;
  var HIT_FLASH_DURATION = 0.08;
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
      // Visual state
      this.spawnAge = 0;
      this.hitFlash = 0;
      this.innerRotation = 0;
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
      this.spikeCount = type === "swarmer" ? Math.floor(randomRange(5, 8)) : 6;
      this.wobblePhase = Math.random() * TWO_PI;
      if (type === "overlord") {
        this.summonTimer = 3;
        this.shootTimer = 2;
      }
      if (type === "drifter") {
        this.chargeTimer = randomRange(3, 6);
      }
    }
    update(dt, playerX, playerY) {
      this.spawnAge += dt;
      if (this.hitFlash > 0) this.hitFlash -= dt;
      this.innerRotation += dt * (this.type === "titan" ? 0.4 : 1.2);
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
      this.hitFlash = HIT_FLASH_DURATION;
      if (this.hp <= 0) {
        this.hp = 0;
        this.dead = true;
      }
    }
    consumeSummon() {
      if (this.canSummon) {
        this.canSummon = false;
        return true;
      }
      return false;
    }
    draw(ctx2, camera2, time) {
      const screen = camera2.worldToScreen(this.x, this.y);
      const spawnT = Math.min(1, this.spawnAge / SPAWN_DURATION);
      const scale = easeOutBack(spawnT);
      const drawRadius = this.radius * scale;
      if (drawRadius < 0.5) return;
      this.drawProjectiles(ctx2, camera2);
      ctx2.save();
      ctx2.translate(screen.x, screen.y);
      ctx2.scale(scale, scale);
      if (this.type === "drifter" && this.isCharging) {
        this.drawChargeTrail(ctx2);
      }
      switch (this.type) {
        case "swarmer":
          this.drawSwarmer(ctx2, time);
          break;
        case "drifter":
          this.drawDrifter(ctx2, time);
          break;
        case "titan":
          this.drawTitan(ctx2, time);
          break;
        case "overlord":
          this.drawOverlord(ctx2, time);
          break;
      }
      if (this.hitFlash > 0) {
        const flashAlpha = 0.35 * (this.hitFlash / HIT_FLASH_DURATION);
        ctx2.beginPath();
        ctx2.arc(0, 0, this.radius * 0.9, 0, TWO_PI);
        ctx2.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
        ctx2.fill();
      }
      if (spawnT < 1) {
        const ringAlpha = 0.25 * (1 - spawnT);
        const ringR = this.radius * (1 + spawnT * 0.5);
        ctx2.beginPath();
        ctx2.arc(0, 0, ringR, 0, TWO_PI);
        ctx2.strokeStyle = `rgba(255, 255, 255, ${ringAlpha})`;
        ctx2.lineWidth = 1.5;
        ctx2.stroke();
      }
      ctx2.restore();
    }
    // ── Swarmer: jagged spiky star with pulsing core ──────────────
    drawSwarmer(ctx2, time) {
      const r = this.radius;
      const [cr, cg, cb] = this.color;
      const wobble = Math.sin(time * 2.5 + this.wobblePhase) * 0.08;
      const rot = time * 1.5 + this.wobblePhase;
      const pulse = 0.5 + 0.5 * Math.sin(time * 1.8 + this.wobblePhase);
      ctx2.beginPath();
      ctx2.arc(0, 0, r * 0.5 * (0.9 + pulse * 0.2), 0, TWO_PI);
      ctx2.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.1 + pulse * 0.06})`;
      ctx2.fill();
      ctx2.beginPath();
      for (let i = 0; i < this.spikeCount * 2; i++) {
        const angle = rot + i / (this.spikeCount * 2) * TWO_PI;
        const isOuter = i % 2 === 0;
        const spikeR = isOuter ? r * (1 + wobble) : r * 0.55;
        const px = Math.cos(angle) * spikeR;
        const py = Math.sin(angle) * spikeR;
        if (i === 0) ctx2.moveTo(px, py);
        else ctx2.lineTo(px, py);
      }
      ctx2.closePath();
      ctx2.strokeStyle = this.outlineColor;
      ctx2.lineWidth = 2;
      ctx2.stroke();
      this.drawHpFill(ctx2, r, cr, cg, cb);
    }
    // ── Drifter: hexagon with inner rotating ring ─────────────────
    drawDrifter(ctx2, time) {
      const r = this.radius;
      const [cr, cg, cb] = this.color;
      if (!this.isCharging && this.chargeTimer < 1) {
        const urgency = 1 - this.chargeTimer;
        ctx2.beginPath();
        ctx2.arc(0, 0, r * 1.3, 0, TWO_PI);
        ctx2.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${urgency * 0.15})`;
        ctx2.fill();
      }
      tracePoly(ctx2, 0, 0, r, 6, 0);
      ctx2.strokeStyle = this.outlineColor;
      ctx2.lineWidth = 2;
      ctx2.stroke();
      this.drawHpFill(ctx2, r, cr, cg, cb);
      const innerR = r * 0.5;
      const innerPulse = 0.8 + 0.2 * Math.sin(time * 2);
      tracePoly(ctx2, 0, 0, innerR * innerPulse, 6, this.innerRotation);
      ctx2.strokeStyle = `rgba(255, 255, 255, 0.3)`;
      ctx2.lineWidth = 1;
      ctx2.stroke();
      drawSphereShading(ctx2, 0, 0, r, cr, cg, cb);
    }
    // ── Titan: concentric rotating rings ──────────────────────────
    drawTitan(ctx2, time) {
      const r = this.radius;
      const [cr, cg, cb] = this.color;
      ctx2.globalAlpha = 0.06;
      for (let i = 0; i < 8; i++) {
        const angle = this.innerRotation * 0.3 + i / 8 * TWO_PI;
        const lineR = r * 2.2;
        ctx2.beginPath();
        ctx2.moveTo(Math.cos(angle) * r * 1.1, Math.sin(angle) * r * 1.1);
        ctx2.lineTo(Math.cos(angle) * lineR, Math.sin(angle) * lineR);
        ctx2.strokeStyle = `rgb(${cr}, ${cg}, ${cb})`;
        ctx2.lineWidth = 1.5;
        ctx2.stroke();
      }
      ctx2.globalAlpha = 1;
      ctx2.beginPath();
      ctx2.arc(0, 0, r * 1.25, 0, TWO_PI);
      ctx2.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.12)`;
      ctx2.lineWidth = 1;
      ctx2.stroke();
      ctx2.beginPath();
      ctx2.arc(0, 0, r * 1.1, 0, TWO_PI);
      ctx2.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.2)`;
      ctx2.lineWidth = 1;
      ctx2.stroke();
      ctx2.beginPath();
      ctx2.arc(0, 0, r, 0, TWO_PI);
      ctx2.strokeStyle = this.outlineColor;
      ctx2.lineWidth = 2.5;
      ctx2.stroke();
      ctx2.beginPath();
      ctx2.arc(0, 0, r - 1, 0, TWO_PI);
      this.drawHpFill(ctx2, r, cr, cg, cb);
      const innerR = r * 0.55;
      const segments = 5;
      const segGap = 0.2;
      const segArc = TWO_PI / segments - segGap;
      ctx2.lineWidth = 2;
      ctx2.strokeStyle = `rgba(255, 255, 255, 0.25)`;
      for (let i = 0; i < segments; i++) {
        const startAngle = this.innerRotation + i / segments * TWO_PI;
        ctx2.beginPath();
        ctx2.arc(0, 0, innerR, startAngle, startAngle + segArc);
        ctx2.stroke();
      }
      const eyePulse = 0.6 + 0.4 * Math.sin(time * 1.5);
      const eyeR = r * 0.15 * eyePulse;
      const eyeGrad = ctx2.createRadialGradient(0, 0, 0, 0, 0, eyeR * 3);
      eyeGrad.addColorStop(0, `rgba(255, 255, 255, ${0.4 * eyePulse})`);
      eyeGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx2.fillStyle = eyeGrad;
      ctx2.beginPath();
      ctx2.arc(0, 0, eyeR * 3, 0, TWO_PI);
      ctx2.fill();
      drawSphereShading(ctx2, 0, 0, r, cr, cg, cb);
    }
    // ── Overlord: rotating square with glow (mostly preserved) ────
    drawOverlord(ctx2, time) {
      const side = this.radius * 2;
      const [cr, cg, cb] = this.color;
      const pulse = 0.5 + 0.5 * Math.sin(time * 2.5);
      const glowSize = this.radius + 10 + pulse * 8;
      ctx2.save();
      ctx2.rotate(this.rotation);
      const gradient = ctx2.createRadialGradient(0, 0, this.radius * 0.5, 0, 0, glowSize * 1.4);
      gradient.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${0.25 + pulse * 0.15})`);
      gradient.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
      ctx2.fillStyle = gradient;
      ctx2.fillRect(-glowSize * 1.4, -glowSize * 1.4, glowSize * 2.8, glowSize * 2.8);
      ctx2.strokeStyle = this.outlineColor;
      ctx2.lineWidth = 3;
      ctx2.strokeRect(-side / 2, -side / 2, side, side);
      const hpRatio = this.hp / this.maxHp;
      if (hpRatio > 0) {
        const innerSide = side - 2;
        ctx2.beginPath();
        ctx2.rect(-innerSide / 2, -innerSide / 2, innerSide, innerSide);
        ctx2.save();
        ctx2.clip();
        const fillTop = -this.radius + 1 + innerSide * (1 - hpRatio);
        ctx2.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
        ctx2.fillRect(-innerSide / 2, fillTop, innerSide, innerSide);
        ctx2.restore();
      }
      const innerSize = this.radius * 0.5;
      const innerPulse = 0.8 + 0.2 * Math.sin(time * 3);
      ctx2.beginPath();
      ctx2.moveTo(0, -innerSize * innerPulse);
      ctx2.lineTo(innerSize * innerPulse, 0);
      ctx2.lineTo(0, innerSize * innerPulse);
      ctx2.lineTo(-innerSize * innerPulse, 0);
      ctx2.closePath();
      ctx2.strokeStyle = `rgba(255, 200, 200, 0.25)`;
      ctx2.lineWidth = 1;
      ctx2.stroke();
      ctx2.restore();
    }
    // ── Shared helpers ────────────────────────────────────────────
    drawProjectiles(ctx2, camera2) {
      for (const p of this.projectiles) {
        const ps = camera2.worldToScreen(p.x, p.y);
        const glow = ctx2.createRadialGradient(ps.x, ps.y, 0, ps.x, ps.y, p.radius * 3);
        glow.addColorStop(0, "rgba(255, 255, 255, 0.8)");
        glow.addColorStop(0.4, "rgba(255, 200, 200, 0.3)");
        glow.addColorStop(1, "rgba(255, 100, 100, 0)");
        ctx2.beginPath();
        ctx2.arc(ps.x, ps.y, p.radius * 3, 0, TWO_PI);
        ctx2.fillStyle = glow;
        ctx2.fill();
        ctx2.beginPath();
        ctx2.arc(ps.x, ps.y, p.radius, 0, TWO_PI);
        ctx2.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx2.fill();
      }
    }
    drawChargeTrail(ctx2) {
      const trailLen = 20;
      const nx = -this.chargeVx / CHARGE_SPEED;
      const ny = -this.chargeVy / CHARGE_SPEED;
      for (let i = 1; i <= 4; i++) {
        const tx = nx * trailLen * i;
        const ty = ny * trailLen * i;
        ctx2.beginPath();
        ctx2.arc(tx, ty, this.radius * (1 - i * 0.15), 0, TWO_PI);
        ctx2.fillStyle = `rgba(255, 160, 40, ${0.15 - i * 0.03})`;
        ctx2.fill();
      }
    }
    drawHpFill(ctx2, r, cr, cg, cb) {
      const hpRatio = this.hp / this.maxHp;
      if (hpRatio > 0) {
        ctx2.save();
        ctx2.clip();
        const fillTop = r - r * 2 * hpRatio;
        ctx2.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
        ctx2.fillRect(-r * 1.2, fillTop, r * 2.4, r * 2.4);
        ctx2.restore();
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
        if (!overlord.consumeSummon()) continue;
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
  var MAX_PARTICLES = 500;
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
      this.wobbleOffset = Math.random() * TWO_PI;
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
      ctx2.arc(screen.x, screen.y, this.radius, 0, TWO_PI);
      ctx2.strokeStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
      ctx2.lineWidth = 2;
      ctx2.stroke();
    }
  };
  var SparkParticle = class {
    constructor(x, y, outlineColor, speed) {
      this.x = x;
      this.y = y;
      this.elapsed = 0;
      this.done = false;
      const angle = Math.random() * TWO_PI;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.size = 1 + Math.random() * 2;
      this.lifetime = 0.4 + Math.random() * 0.5;
      this.prevX = x;
      this.prevY = y;
      [this.r, this.g, this.b] = parseHexColor(outlineColor);
    }
    update(dt) {
      this.elapsed += dt;
      if (this.elapsed >= this.lifetime) {
        this.done = true;
        return;
      }
      this.prevX = this.x;
      this.prevY = this.y;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vx *= 0.96;
      this.vy *= 0.96;
    }
    draw(ctx2, camera2) {
      const t = this.elapsed / this.lifetime;
      const alpha = 1 - t;
      const s1 = camera2.worldToScreen(this.prevX, this.prevY);
      const s2 = camera2.worldToScreen(this.x, this.y);
      ctx2.beginPath();
      ctx2.moveTo(s1.x, s1.y);
      ctx2.lineTo(s2.x, s2.y);
      ctx2.strokeStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha * 0.6})`;
      ctx2.lineWidth = this.size;
      ctx2.lineCap = "round";
      ctx2.stroke();
      ctx2.beginPath();
      ctx2.arc(s2.x, s2.y, this.size * 0.8, 0, TWO_PI);
      ctx2.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
      ctx2.fill();
    }
  };
  var DebrisParticle = class {
    constructor(x, y, outlineColor, enemyRadius) {
      this.x = x;
      this.y = y;
      this.elapsed = 0;
      this.done = false;
      const angle = Math.random() * TWO_PI;
      const speed = 60 + Math.random() * 120;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.size = 2 + Math.random() * (enemyRadius * 0.15);
      this.lifetime = 0.6 + Math.random() * 0.6;
      this.rotation = Math.random() * TWO_PI;
      this.rotSpeed = (Math.random() - 0.5) * 12;
      this.sides = Math.random() < 0.5 ? 3 : 4;
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
      this.rotation += this.rotSpeed * dt;
      this.vx *= 0.97;
      this.vy *= 0.97;
    }
    draw(ctx2, camera2) {
      const t = this.elapsed / this.lifetime;
      const alpha = 1 - t * t;
      const screen = camera2.worldToScreen(this.x, this.y);
      ctx2.save();
      ctx2.translate(screen.x, screen.y);
      ctx2.rotate(this.rotation);
      ctx2.beginPath();
      for (let i = 0; i <= this.sides; i++) {
        const a = i / this.sides * TWO_PI;
        const px = Math.cos(a) * this.size;
        const py = Math.sin(a) * this.size;
        if (i === 0) ctx2.moveTo(px, py);
        else ctx2.lineTo(px, py);
      }
      ctx2.closePath();
      ctx2.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha * 0.7})`;
      ctx2.fill();
      ctx2.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
      ctx2.lineWidth = 1;
      ctx2.stroke();
      ctx2.restore();
    }
  };
  var GlowPool = class {
    constructor(x, y, outlineColor, enemyRadius) {
      this.x = x;
      this.y = y;
      this.elapsed = 0;
      this.done = false;
      this.maxRadius = enemyRadius * 1.5;
      this.lifetime = 0.8 + Math.random() * 0.4;
      [this.r, this.g, this.b] = parseHexColor(outlineColor);
    }
    update(dt) {
      this.elapsed += dt;
      if (this.elapsed >= this.lifetime) {
        this.done = true;
      }
    }
    draw(ctx2, camera2) {
      const t = this.elapsed / this.lifetime;
      const r = this.maxRadius * Math.min(1, t * 3);
      const alpha = 0.15 * (1 - t);
      const screen = camera2.worldToScreen(this.x, this.y);
      const grad = ctx2.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, r);
      grad.addColorStop(0, `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`);
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx2.fillStyle = grad;
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, r, 0, TWO_PI);
      ctx2.fill();
    }
  };
  var XpOrb = class {
    constructor(x, y, targetX, targetY) {
      this.x = x;
      this.y = y;
      this.targetX = targetX;
      this.targetY = targetY;
      this.elapsed = 0;
      this.lifetime = 0.6;
      this.done = false;
      const angle = Math.random() * TWO_PI;
      this.vx = Math.cos(angle) * 80;
      this.vy = Math.sin(angle) * 80;
      this.size = 2 + Math.random() * 2;
    }
    update(dt) {
      this.elapsed += dt;
      if (this.elapsed >= this.lifetime) {
        this.done = true;
        return;
      }
      const t = this.elapsed / this.lifetime;
      const homingStrength = t * t * 800;
      const toTargetAngle = wrappedAngle(this.x, this.y, this.targetX, this.targetY);
      this.vx += Math.cos(toTargetAngle) * homingStrength * dt;
      this.vy += Math.sin(toTargetAngle) * homingStrength * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }
    draw(ctx2, camera2) {
      const t = this.elapsed / this.lifetime;
      const alpha = t < 0.8 ? 1 : (1 - t) * 5;
      const screen = camera2.worldToScreen(this.x, this.y);
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, this.size * 3, 0, TWO_PI);
      ctx2.fillStyle = `rgba(255, 220, 80, ${alpha * 0.2})`;
      ctx2.fill();
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, this.size, 0, TWO_PI);
      ctx2.fillStyle = `rgba(255, 240, 150, ${alpha * 0.9})`;
      ctx2.fill();
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, this.size * 0.4, 0, TWO_PI);
      ctx2.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx2.fill();
    }
  };
  var ExplosionParticle = class {
    constructor(x, y, outlineColor) {
      this.x = x;
      this.y = y;
      this.elapsed = 0;
      this.gravity = 60;
      this.done = false;
      const angle = Math.random() * TWO_PI;
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
      ctx2.arc(screen.x, screen.y, this.particleRadius, 0, TWO_PI);
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
      ctx2.arc(screen.x, screen.y, currentRadius, 0, TWO_PI);
      ctx2.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx2.fill();
    }
  };
  var ScreenFlash = class {
    constructor(r, g, b, maxAlpha, duration) {
      this.r = r;
      this.g = g;
      this.b = b;
      this.maxAlpha = maxAlpha;
      this.duration = duration;
      this.elapsed = 0;
      this.done = false;
    }
    update(dt) {
      this.elapsed += dt;
      if (this.elapsed >= this.duration) {
        this.done = true;
      }
    }
    draw(ctx2, width, height) {
      const t = this.elapsed / this.duration;
      const alpha = this.maxAlpha * (1 - t);
      ctx2.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
      ctx2.fillRect(0, 0, width, height);
    }
  };
  var DamageVignette = class {
    constructor(duration, intensity) {
      this.duration = duration;
      this.intensity = intensity;
      this.elapsed = 0;
      this.done = false;
    }
    update(dt) {
      this.elapsed += dt;
      if (this.elapsed >= this.duration) {
        this.done = true;
      }
    }
    draw(ctx2, width, height) {
      const t = this.elapsed / this.duration;
      const alpha = this.intensity * (1 - t);
      const cx = width / 2;
      const cy = height / 2;
      const r = Math.max(width, height) * 0.7;
      const grad = ctx2.createRadialGradient(cx, cy, r * 0.5, cx, cy, r);
      grad.addColorStop(0, "rgba(0, 0, 0, 0)");
      grad.addColorStop(1, `rgba(200, 0, 0, ${alpha})`);
      ctx2.fillStyle = grad;
      ctx2.fillRect(0, 0, width, height);
    }
  };
  var ParticleSystem = class {
    constructor() {
      this.particles = [];
      this.screenEffects = [];
    }
    spawnDeath(x, y, radius, outlineColor) {
      if (this.particles.length >= MAX_PARTICLES) return;
      this.particles.push(new DeathParticle(x, y, radius, outlineColor));
      const burstCount = 8 + Math.floor(Math.random() * 8);
      for (let i = 0; i < burstCount; i++) {
        this.particles.push(new ExplosionParticle(x, y, outlineColor));
      }
      const sparkCount = 6 + Math.floor(radius * 0.3);
      for (let i = 0; i < sparkCount; i++) {
        this.particles.push(new SparkParticle(x, y, outlineColor, 120 + Math.random() * 180));
      }
      const debrisCount = 4 + Math.floor(radius * 0.15);
      for (let i = 0; i < debrisCount; i++) {
        this.particles.push(new DebrisParticle(x, y, outlineColor, radius));
      }
      this.particles.push(new GlowPool(x, y, outlineColor, radius));
      if (radius > 25) {
        this.particles.push(new FlashParticle(x, y, radius));
      }
    }
    spawnXpOrbs(x, y, playerX, playerY, count) {
      if (this.particles.length >= MAX_PARTICLES) return;
      for (let i = 0; i < count; i++) {
        this.particles.push(new XpOrb(x, y, playerX, playerY));
      }
    }
    spawnFlash(x, y, radius) {
      if (this.particles.length >= MAX_PARTICLES) return;
      this.particles.push(new FlashParticle(x, y, radius));
    }
    addScreenFlash(r, g, b, alpha, duration) {
      this.screenEffects.push(new ScreenFlash(r, g, b, alpha, duration));
    }
    addDamageVignette(duration, intensity) {
      this.screenEffects.push(new DamageVignette(duration, intensity));
    }
    update(dt) {
      for (const p of this.particles) p.update(dt);
      this.particles = this.particles.filter((p) => !p.done);
      for (const e of this.screenEffects) e.update(dt);
      this.screenEffects = this.screenEffects.filter((e) => !e.done);
    }
    draw(ctx2, camera2) {
      for (const p of this.particles) p.draw(ctx2, camera2);
    }
    drawScreenEffects(ctx2, width, height) {
      for (const e of this.screenEffects) e.draw(ctx2, width, height);
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
      this.cachedStats = this.computeStats();
      this.cachedLevel = 1;
    }
    computeStats() {
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
    getStats() {
      if (this.level !== this.cachedLevel) {
        this.cachedStats = this.computeStats();
        this.cachedLevel = this.level;
      }
      return this.cachedStats;
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
            const normDiff = Math.min(diff, TWO_PI - diff);
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
        const wave = Math.sin(t * frequency * TWO_PI + this.time * waveSpeed) * amplitude;
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
      ctx2.lineJoin = "round";
      ctx2.lineCap = "round";
      if (this.level >= 3) {
        drawWavyPath();
        ctx2.strokeStyle = `rgba(80, 160, 255, ${stats.glowAlpha})`;
        ctx2.lineWidth = stats.width * 5;
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
        ctx2.stroke();
      }
      const flashRadius = stats.width * 3 + 4;
      const flashGrad = ctx2.createRadialGradient(endX, endY, 0, endX, endY, flashRadius * 2.5);
      flashGrad.addColorStop(0, "rgba(200, 240, 255, 0.9)");
      flashGrad.addColorStop(0.4, "rgba(100, 200, 255, 0.5)");
      flashGrad.addColorStop(1, "rgba(80, 160, 255, 0)");
      ctx2.beginPath();
      ctx2.arc(endX, endY, flashRadius * 2.5, 0, TWO_PI);
      ctx2.fillStyle = flashGrad;
      ctx2.fill();
      ctx2.beginPath();
      ctx2.arc(endX, endY, flashRadius * 0.5, 0, TWO_PI);
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
        ctx2.arc(screen.x, screen.y, orbRadius * 3, 0, TWO_PI);
        ctx2.fillStyle = orbGrad;
        ctx2.fill();
        ctx2.beginPath();
        ctx2.arc(screen.x, screen.y, orbRadius, 0, TWO_PI);
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
        ctx2.arc(px, py, Math.random() * 2, 0, TWO_PI);
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
      this.cachedStats = this.computeStats();
      this.cachedLevel = 1;
    }
    computeStats() {
      const lvl = this.level;
      return {
        damage: 8 + lvl * 5,
        orbitRadius: 70 + lvl * 18,
        projectileCount: 2 + Math.floor(lvl / 2),
        hitRadius: 12 + lvl * 3,
        drawRadius: 5 + lvl * 1,
        rotationSpeed: 2 + lvl * 0.3,
        trailLength: Math.floor(lvl / 2),
        glowAlpha: 0.1 + lvl * 0.05
      };
    }
    getStats() {
      if (this.level !== this.cachedLevel) {
        this.cachedStats = this.computeStats();
        this.cachedLevel = this.level;
      }
      return this.cachedStats;
    }
    update(dt, playerX, playerY, enemies) {
      const stats = this.getStats();
      this.angle += stats.rotationSpeed * dt;
      for (let i = 0; i < stats.projectileCount; i++) {
        const a = this.angle + TWO_PI / stats.projectileCount * i;
        const px = playerX + Math.cos(a) * stats.orbitRadius;
        const py = playerY + Math.sin(a) * stats.orbitRadius;
        for (const enemy of enemies) {
          if (enemy.dead) continue;
          if (wrappedDistance(px, py, enemy.x, enemy.y) < stats.hitRadius + enemy.radius) {
            enemy.takeDamage(stats.damage * dt * 10);
          }
        }
      }
    }
    draw(ctx2, camera2, playerX, playerY, _playerRadius) {
      const stats = this.getStats();
      const screen = camera2.worldToScreen(playerX, playerY);
      for (let i = 0; i < stats.projectileCount; i++) {
        const a = this.angle + TWO_PI / stats.projectileCount * i;
        const px = screen.x + Math.cos(a) * stats.orbitRadius;
        const py = screen.y + Math.sin(a) * stats.orbitRadius;
        for (let t = 1; t <= stats.trailLength; t++) {
          const ta = a - t * 0.15;
          const tx = screen.x + Math.cos(ta) * stats.orbitRadius;
          const ty = screen.y + Math.sin(ta) * stats.orbitRadius;
          ctx2.beginPath();
          ctx2.arc(tx, ty, stats.drawRadius * 0.7, 0, TWO_PI);
          ctx2.fillStyle = `rgba(100, 200, 255, ${(1 - t / (stats.trailLength + 1)) * 0.4})`;
          ctx2.fill();
        }
        ctx2.beginPath();
        ctx2.arc(px, py, stats.drawRadius * 2.5, 0, TWO_PI);
        ctx2.fillStyle = `rgba(80, 160, 255, ${stats.glowAlpha})`;
        ctx2.fill();
        ctx2.beginPath();
        ctx2.arc(px, py, stats.drawRadius, 0, TWO_PI);
        ctx2.fillStyle = "rgba(180, 220, 255, 0.9)";
        ctx2.fill();
        ctx2.beginPath();
        ctx2.arc(px, py, stats.drawRadius * 0.4, 0, TWO_PI);
        ctx2.fillStyle = "#ffffff";
        ctx2.fill();
      }
      if (this.level >= 5) {
        ctx2.beginPath();
        ctx2.arc(screen.x, screen.y, stats.orbitRadius, 0, TWO_PI);
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
      this.cachedStats = this.computeStats();
      this.cachedLevel = 1;
    }
    computeStats() {
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
    getStats() {
      if (this.level !== this.cachedLevel) {
        this.cachedStats = this.computeStats();
        this.cachedLevel = this.level;
      }
      return this.cachedStats;
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
        ctx2.arc(screen.x, screen.y, this.blastRadius, 0, TWO_PI);
        ctx2.fill();
      }
      if (stats.shockwave) {
        ctx2.beginPath();
        ctx2.arc(screen.x, screen.y, this.blastRadius * 1.05, 0, TWO_PI);
        ctx2.strokeStyle = `rgba(255, 220, 150, ${alpha * 0.3})`;
        ctx2.lineWidth = stats.ringWidth * 0.5;
        ctx2.stroke();
      }
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, this.blastRadius, 0, TWO_PI);
      ctx2.strokeStyle = `rgba(255, 180, 80, ${alpha})`;
      ctx2.lineWidth = stats.ringWidth;
      ctx2.stroke();
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, this.blastRadius, 0, TWO_PI);
      ctx2.strokeStyle = `rgba(255, 150, 50, ${alpha * 0.3})`;
      ctx2.lineWidth = stats.ringWidth * 3;
      ctx2.stroke();
      for (let i = 0; i < stats.debrisCount; i++) {
        const angle = TWO_PI / stats.debrisCount * i + progress * 2;
        const dx = screen.x + Math.cos(angle) * this.blastRadius;
        const dy = screen.y + Math.sin(angle) * this.blastRadius;
        ctx2.fillStyle = `rgba(255, 200, 100, ${alpha})`;
        ctx2.beginPath();
        ctx2.arc(dx, dy, 2 + this.level * 0.3, 0, TWO_PI);
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
  var WEAPON_SHAPES = {
    "Laser Beam": (ctx2, x, y, s) => {
      ctx2.beginPath();
      ctx2.moveTo(x - s, y);
      ctx2.lineTo(x + s, y);
      ctx2.strokeStyle = "rgba(100, 200, 255, 0.9)";
      ctx2.lineWidth = 2;
      ctx2.stroke();
      ctx2.beginPath();
      ctx2.arc(x + s, y, 2, 0, TWO_PI);
      ctx2.fillStyle = "rgba(100, 200, 255, 0.9)";
      ctx2.fill();
    },
    "Orbit Shield": (ctx2, x, y, s) => {
      ctx2.beginPath();
      ctx2.arc(x, y, s * 0.7, 0, TWO_PI);
      ctx2.strokeStyle = "rgba(100, 200, 255, 0.9)";
      ctx2.lineWidth = 1.5;
      ctx2.stroke();
      ctx2.beginPath();
      ctx2.arc(x + s * 0.5, y - s * 0.3, 2, 0, TWO_PI);
      ctx2.fillStyle = "rgba(180, 220, 255, 0.9)";
      ctx2.fill();
    },
    "Nova Blast": (ctx2, x, y, s) => {
      ctx2.beginPath();
      ctx2.arc(x, y, s * 0.6, 0, TWO_PI);
      ctx2.strokeStyle = "rgba(255, 160, 60, 0.9)";
      ctx2.lineWidth = 1.5;
      ctx2.stroke();
      ctx2.beginPath();
      ctx2.arc(x, y, s * 0.2, 0, TWO_PI);
      ctx2.fillStyle = "rgba(255, 200, 100, 0.9)";
      ctx2.fill();
    }
  };
  var UI = class {
    constructor() {
      // State for animated transitions
      this.stateAge = 0;
      this.lastState = "";
    }
    trackState(stateName, dt) {
      if (stateName !== this.lastState) {
        this.lastState = stateName;
        this.stateAge = 0;
      }
      this.stateAge += dt;
    }
    drawHUD(ctx2, canvas2, game2, player2, wm) {
      const w = canvas2.width;
      const h = canvas2.height;
      ctx2.save();
      ctx2.textAlign = "center";
      ctx2.font = "bold 28px monospace";
      const timerText = game2.timeRemainingFormatted;
      ctx2.fillStyle = "rgba(100, 200, 255, 0.15)";
      ctx2.fillText(timerText, w / 2, 40);
      ctx2.fillText(timerText, w / 2, 40);
      ctx2.fillStyle = "#ffffff";
      ctx2.fillText(timerText, w / 2, 40);
      ctx2.restore();
      ctx2.font = "16px monospace";
      ctx2.textAlign = "right";
      ctx2.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx2.fillText(`${player2.kills}`, w - 20, 35);
      ctx2.beginPath();
      ctx2.arc(w - 55 - ctx2.measureText(`${player2.kills}`).width * 0.5, 30, 5, 0, TWO_PI);
      ctx2.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx2.lineWidth = 1;
      ctx2.stroke();
      const barW = w * 0.5;
      const barH = 6;
      const barX = (w - barW) / 2;
      const barY = h - 28;
      const xpRatio = player2.xp / player2.getXpForNextLevel();
      const barRadius = barH / 2;
      ctx2.beginPath();
      ctx2.roundRect(barX, barY, barW, barH, barRadius);
      ctx2.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx2.fill();
      if (xpRatio > 0.01) {
        ctx2.save();
        ctx2.beginPath();
        ctx2.roundRect(barX, barY, barW, barH, barRadius);
        ctx2.clip();
        const fillW = barW * xpRatio;
        const grad = ctx2.createLinearGradient(barX, 0, barX + fillW, 0);
        grad.addColorStop(0, "rgba(80, 180, 255, 0.6)");
        grad.addColorStop(1, "rgba(120, 220, 255, 0.9)");
        ctx2.fillStyle = grad;
        ctx2.fillRect(barX, barY, fillW, barH);
        const edgeX = barX + fillW;
        const glowGrad = ctx2.createRadialGradient(edgeX, barY + barH / 2, 0, edgeX, barY + barH / 2, 15);
        glowGrad.addColorStop(0, "rgba(150, 230, 255, 0.4)");
        glowGrad.addColorStop(1, "rgba(150, 230, 255, 0)");
        ctx2.fillStyle = glowGrad;
        ctx2.fillRect(edgeX - 15, barY - 10, 30, barH + 20);
        ctx2.restore();
      }
      ctx2.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx2.font = "11px monospace";
      ctx2.textAlign = "center";
      ctx2.fillText(`LV ${player2.level}`, w / 2, barY - 6);
      ctx2.textAlign = "left";
      let wy = h - 65;
      for (const wp of wm.weapons) {
        const drawIcon = WEAPON_SHAPES[wp.name];
        if (drawIcon) {
          drawIcon(ctx2, 28, wy - 4, 8);
        }
        ctx2.font = "13px monospace";
        ctx2.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx2.fillText(`${wp.name}`, 44, wy);
        ctx2.fillStyle = "rgba(100, 200, 255, 0.8)";
        ctx2.fillText(`${wp.level}`, 44 + ctx2.measureText(`${wp.name} `).width, wy);
        wy -= 22;
      }
      if (isTouchDevice()) {
        this.drawPauseButton(ctx2, canvas2);
        this.drawJoystick(ctx2);
      }
    }
    drawPauseButton(ctx2, canvas2) {
      const x = canvas2.width - 45;
      const y = 45;
      const size = 20;
      ctx2.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx2.beginPath();
      ctx2.arc(x, y, size + 5, 0, TWO_PI);
      ctx2.fill();
      ctx2.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx2.lineWidth = 1;
      ctx2.stroke();
      ctx2.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx2.beginPath();
      ctx2.roundRect(x - 7, y - 8, 5, 16, 1);
      ctx2.roundRect(x + 2, y - 8, 5, 16, 1);
      ctx2.fill();
    }
    drawJoystick(ctx2) {
      if (!touch.active) return;
      const cx = touch.centerX;
      const cy = touch.centerY;
      const r = JOYSTICK_DISPLAY_RADIUS;
      ctx2.beginPath();
      ctx2.arc(cx, cy, r, 0, TWO_PI);
      ctx2.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx2.lineWidth = 2;
      ctx2.stroke();
      ctx2.fillStyle = "rgba(255, 255, 255, 0.03)";
      ctx2.fill();
      const thumbX = cx + touch.dx * r;
      const thumbY = cy + touch.dy * r;
      const thumbR = 20;
      ctx2.beginPath();
      ctx2.arc(thumbX, thumbY, thumbR, 0, TWO_PI);
      ctx2.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx2.fill();
      ctx2.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx2.lineWidth = 2;
      ctx2.stroke();
    }
    drawTitleScreen(ctx2, canvas2) {
      const w = canvas2.width;
      const h = canvas2.height;
      const cx = w / 2;
      const cy = h / 2;
      const t = this.stateAge;
      const titleAlpha = Math.min(1, t * 2);
      const glowPulse = 0.6 + 0.4 * Math.sin(t * 1.5);
      const titleGrad = ctx2.createRadialGradient(cx, cy - 40, 0, cx, cy - 40, 300);
      titleGrad.addColorStop(0, `rgba(80, 160, 255, ${0.06 * glowPulse * titleAlpha})`);
      titleGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx2.fillStyle = titleGrad;
      ctx2.fillRect(0, 0, w, h);
      ctx2.textAlign = "center";
      ctx2.font = "bold 52px monospace";
      ctx2.fillStyle = `rgba(80, 180, 255, ${0.12 * titleAlpha})`;
      ctx2.fillText("UNIVERSE EATER", cx, cy - 30);
      ctx2.fillStyle = `rgba(80, 180, 255, ${0.08 * titleAlpha})`;
      ctx2.fillText("UNIVERSE EATER", cx + 1, cy - 29);
      ctx2.fillStyle = `rgba(255, 255, 255, ${titleAlpha})`;
      ctx2.fillText("UNIVERSE EATER", cx, cy - 30);
      const subAlpha = Math.max(0, Math.min(1, (t - 0.5) * 2));
      ctx2.font = "14px monospace";
      ctx2.fillStyle = `rgba(100, 180, 255, ${subAlpha * 0.6})`;
      ctx2.fillText("SURVIVE 5 MINUTES", cx, cy + 10);
      const promptAlpha = Math.max(0, Math.min(1, (t - 1) * 2));
      const breathe = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 3));
      ctx2.font = "16px monospace";
      ctx2.fillStyle = `rgba(255, 255, 255, ${promptAlpha * breathe})`;
      const startMsg = isTouchDevice() ? "Tap to start" : "Press any key to start";
      ctx2.fillText(startMsg, cx, cy + 60);
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
        ctx2.fillStyle = `rgba(100, 200, 255, ${0.15 * n.alpha})`;
        ctx2.strokeStyle = `rgba(100, 200, 255, ${0.4 * n.alpha})`;
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
      this.drawEndScreen(ctx2, canvas2, "GAME OVER", [255, 68, 68], [80, 0, 0], [
        `Survived  ${formatTime(game2.elapsedTime)}`,
        `Kills  ${player2.kills}`
      ]);
    }
    drawVictory(ctx2, canvas2, player2) {
      this.drawEndScreen(ctx2, canvas2, "VICTORY!", [68, 255, 136], [80, 60, 0], [
        `Total Kills  ${player2.kills}`,
        `Level Reached  ${player2.level}`
      ]);
    }
    drawEndScreen(ctx2, canvas2, title, titleColor, vignetteColor, stats) {
      const w = canvas2.width;
      const h = canvas2.height;
      const cx = w / 2;
      const cy = h / 2;
      const t = this.stateAge;
      const [tr, tg, tb] = titleColor;
      const [vr, vg, vb] = vignetteColor;
      const dimAlpha = Math.min(0.85, t * 2);
      ctx2.fillStyle = `rgba(0, 0, 0, ${dimAlpha})`;
      ctx2.fillRect(0, 0, w, h);
      const vigGrad = ctx2.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);
      vigGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
      vigGrad.addColorStop(1, `rgba(${vr}, ${vg}, ${vb}, ${Math.min(0.3, t)})`);
      ctx2.fillStyle = vigGrad;
      ctx2.fillRect(0, 0, w, h);
      const titleScale = easeOutCubic(Math.min(1, t * 3));
      const titleAlpha = Math.min(1, t * 3);
      ctx2.save();
      ctx2.translate(cx, cy - 50);
      ctx2.scale(titleScale, titleScale);
      ctx2.font = "bold 52px monospace";
      ctx2.textAlign = "center";
      ctx2.fillStyle = `rgba(${tr}, ${tg}, ${tb}, ${titleAlpha * 0.15})`;
      ctx2.fillText(title, 0, 0);
      ctx2.fillStyle = `rgba(${tr}, ${tg}, ${tb}, ${titleAlpha})`;
      ctx2.fillText(title, 0, 0);
      ctx2.restore();
      ctx2.textAlign = "center";
      ctx2.font = "18px monospace";
      for (let i = 0; i < stats.length; i++) {
        const statAlpha = Math.max(0, Math.min(1, (t - 0.4 - i * 0.2) * 3));
        ctx2.fillStyle = `rgba(255, 255, 255, ${statAlpha * 0.7})`;
        ctx2.fillText(stats[i], cx, cy + 15 + i * 30);
      }
      const promptAlpha = Math.max(0, Math.min(1, (t - 1.2) * 2));
      const breathe = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 3));
      ctx2.font = "14px monospace";
      ctx2.fillStyle = `rgba(255, 255, 255, ${promptAlpha * breathe * 0.5})`;
      const restartMsg = isTouchDevice() ? "Tap to restart" : "Press any key to restart";
      ctx2.fillText(restartMsg, cx, cy + 95);
    }
    // Permanent vignette overlay
    drawVignette(ctx2, w, h, hpRatio) {
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.max(w, h) * 0.75;
      const baseAlpha = 0.3 + (1 - hpRatio) * 0.35;
      const grad = ctx2.createRadialGradient(cx, cy, r * 0.4, cx, cy, r);
      grad.addColorStop(0, "rgba(0, 0, 0, 0)");
      grad.addColorStop(1, `rgba(0, 0, 0, ${baseAlpha})`);
      ctx2.fillStyle = grad;
      ctx2.fillRect(0, 0, w, h);
      if (hpRatio < 0.35) {
        const redAlpha = (0.35 - hpRatio) * 0.4;
        const redGrad = ctx2.createRadialGradient(cx, cy, r * 0.3, cx, cy, r);
        redGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
        redGrad.addColorStop(1, `rgba(150, 0, 0, ${redAlpha})`);
        ctx2.fillStyle = redGrad;
        ctx2.fillRect(0, 0, w, h);
      }
    }
  };

  // src/main.ts
  var CONTACT_DPS = 10;
  var PROJECTILE_DAMAGE = 8;
  var SHARP_HIT_THRESHOLD = 3;
  var MAX_SHAKE = 5;
  var BIG_KILL_RADIUS = 35;
  var MAX_XP_ORBS = 6;
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  var camera;
  var player;
  var background;
  var geometry;
  var spawner;
  var particles;
  var weaponManager;
  var game;
  var ui = new UI();
  function init() {
    camera = new Camera(canvas.width, canvas.height);
    player = new Player();
    background = new Background();
    geometry = new BackgroundGeometry();
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
    if (consumePauseTap()) {
      if (game.state === "playing" /* PLAYING */) game.state = "paused" /* PAUSED */;
      else if (game.state === "paused" /* PAUSED */) game.state = "playing" /* PLAYING */;
    }
    if (consumeAnyTap()) {
      if (game.state === "title" /* TITLE */) game.state = "playing" /* PLAYING */;
      else if (game.state === "gameOver" /* GAME_OVER */ || game.state === "victory" /* VICTORY */) {
        init();
        game.state = "playing" /* PLAYING */;
      }
    }
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    camera.updateShake(dt);
    ui.trackState(game.state, dt);
    if (game.state === "title" /* TITLE */) {
      background.update(dt, playerSpeed, playerVx, playerVy);
      geometry.update(dt);
      background.draw(ctx, camera, timestamp / 1e3);
      geometry.draw(ctx, camera, timestamp / 1e3, camera.x + camera.width / 2, camera.y + camera.height / 2);
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
      geometry.update(dt);
      spawner.update(dt, game.elapsedTime, player.x, player.y, camera);
      const hpBefore = player.hp;
      for (const enemy of spawner.enemies) {
        if (enemy.dead) continue;
        if (wrappedDistance(player.x, player.y, enemy.x, enemy.y) < player.radius + enemy.radius) {
          player.takeDamage(CONTACT_DPS * enemy.damageMultiplier * dt);
        }
        for (const p of enemy.projectiles) {
          if (wrappedDistance(player.x, player.y, p.x, p.y) < player.radius + p.radius) {
            player.takeDamage(PROJECTILE_DAMAGE);
            p.lifetime = 0;
          }
        }
      }
      const dmgTaken = hpBefore - player.hp;
      if (dmgTaken > SHARP_HIT_THRESHOLD) {
        camera.shake(Math.min(MAX_SHAKE, dmgTaken * 0.2), 0.12);
        particles.addDamageVignette(0.2, Math.min(0.25, dmgTaken * 0.015));
      }
      weaponManager.update(dt, player.x, player.y, spawner.enemies);
      player.updateRipples(dt);
      for (const enemy of spawner.enemies) {
        if (!enemy.dead) continue;
        particles.spawnDeath(enemy.x, enemy.y, enemy.radius, enemy.outlineColor);
        particles.spawnXpOrbs(
          enemy.x,
          enemy.y,
          player.x,
          player.y,
          Math.min(MAX_XP_ORBS, Math.ceil(enemy.xpDrop * 0.7))
        );
        player.kills++;
        if (enemy.radius > BIG_KILL_RADIUS) {
          camera.shake(enemy.radius * 0.08, 0.15);
        }
        const leveledUp = player.addXp(enemy.xpDrop);
        if (leveledUp && !weaponManager.allMaxed()) {
          game.applyRandomUpgrade(weaponManager);
        }
      }
      spawner.removeDead();
      particles.update(dt);
      game.updateNotifications(dt);
      background.draw(ctx, camera, timestamp / 1e3);
      geometry.draw(ctx, camera, timestamp / 1e3, player.x, player.y);
      spawner.draw(ctx, camera, timestamp / 1e3);
      particles.draw(ctx, camera);
      weaponManager.draw(ctx, camera, player.x, player.y, player.radius);
      player.draw(ctx, camera);
      background.drawWrapZone(ctx, camera);
      ui.drawVignette(ctx, canvas.width, canvas.height, player.hp / player.maxHp);
      particles.drawScreenEffects(ctx, canvas.width, canvas.height);
      ui.drawHUD(ctx, canvas, game, player, weaponManager);
      ui.drawNotifications(ctx, canvas, game);
    } else if (game.state === "paused" /* PAUSED */) {
      background.draw(ctx, camera, timestamp / 1e3);
      geometry.draw(ctx, camera, timestamp / 1e3, player.x, player.y);
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
      ctx.fillText("Press ESC or tap II to resume", canvas.width / 2, canvas.height / 2 + 30);
    } else if (game.state === "gameOver" /* GAME_OVER */) {
      background.draw(ctx, camera, timestamp / 1e3);
      geometry.draw(ctx, camera, timestamp / 1e3, player.x, player.y);
      ui.drawGameOver(ctx, canvas, player, game);
    } else if (game.state === "victory" /* VICTORY */) {
      background.draw(ctx, camera, timestamp / 1e3);
      geometry.draw(ctx, camera, timestamp / 1e3, player.x, player.y);
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
