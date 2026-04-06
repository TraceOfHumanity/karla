window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const playerImage = new Image();
  playerImage.src = "shadow_dog.png";
  const boomImage = new Image();
  boomImage.src = "boom.png";
  const groundImage = new Image();
  groundImage.src = "groung.jpeg";
  const boomFrames = 5;
  const boomStagger = 4;
  let explosions = [];
  const spriteWidth = 575;
  const spriteHeight = 523;
  const runRow = 3;
  const runFrames = 7;
  const staggerFrames = 5;
  const characterCount = 3;
  const respawnDelayMin = 2000;
  const respawnDelayMax = 4500;
  const baseSpeed = 1;
  const speedJitter = 2.5;

  let gameFrame = 0;
  let characters = [];
  let started = false;

  function charDrawSize() {
    const m = Math.min(canvas.width, canvas.height);
    const h = Math.max(120, Math.min(220, m * 0.22));
    const w = (spriteWidth / spriteHeight) * h;
    return { w, h };
  }

  function createCharacterFromEdge() {
    const { w, h } = charDrawSize();
    const margin = 40;
    const speed = baseSpeed + Math.random() * speedJitter;
    const edge = Math.floor(Math.random() * 4);
    let x;
    let y;
    let vx;
    let vy;
    const horizJitter = () => (Math.random() - 0.5) * speed * 0.9;
    if (edge === 0) {
      x = Math.random() * Math.max(0, canvas.width - w);
      y = -h - margin;
      vy = speed;
      vx = horizJitter();
    } else if (edge === 1) {
      x = canvas.width + margin;
      y = Math.random() * Math.max(0, canvas.height - h);
      vx = -speed;
      vy = horizJitter();
    } else if (edge === 2) {
      x = Math.random() * Math.max(0, canvas.width - w);
      y = canvas.height + margin;
      vy = -speed;
      vx = horizJitter();
    } else {
      x = -w - margin;
      y = Math.random() * Math.max(0, canvas.height - h);
      vx = speed;
      vy = horizJitter();
    }
    const mag = Math.hypot(vx, vy) || 1;
    const target = speed;
    vx = (vx / mag) * target;
    vy = (vy / mag) * target;
    return {
      x,
      y,
      w,
      h,
      vx,
      vy,
      frameX: 0,
      alive: true,
    };
  }

  function initCharacters() {
    characters = [];
    for (let i = 0; i < characterCount; i++) {
      characters.push(createCharacterFromEdge());
    }
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const { w, h } = charDrawSize();
    for (const c of characters) {
      if (!c.alive) continue;
      c.w = w;
      c.h = h;
      const padX = c.w * 2 + 20;
      const padY = c.h * 2 + 20;
      c.x = Math.min(Math.max(c.x, -padX), canvas.width + c.w + 20);
      c.y = Math.min(Math.max(c.y, -padY), canvas.height + c.h + 20);
    }
  }

  window.addEventListener("resize", resizeCanvas);

  const fullscreenBtn = document.getElementById("fullscreen-btn");

  function fullscreenActive() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );
  }

  function fullscreenSupported() {
    const el = document.documentElement;
    return !!(
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.msRequestFullscreen
    );
  }

  function syncFullscreenButton() {
    if (!fullscreenBtn) return;
    fullscreenBtn.textContent = fullscreenActive() ? "Exit" : "Fullscreen";
  }

  async function toggleFullscreen() {
    try {
      if (fullscreenActive()) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen)
          await document.webkitExitFullscreen();
        else if (document.msExitFullscreen) await document.msExitFullscreen();
      } else {
        const el = document.documentElement;
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen)
          await el.webkitRequestFullscreen();
        else if (el.msRequestFullscreen) await el.msRequestFullscreen();
      }
    } catch (err) {}
    syncFullscreenButton();
  }

  function onFullscreenChange() {
    requestAnimationFrame(() => {
      resizeCanvas();
      syncFullscreenButton();
    });
  }

  if (fullscreenBtn) {
    if (!fullscreenSupported()) {
      fullscreenBtn.hidden = true;
    } else {
      fullscreenBtn.addEventListener("click", toggleFullscreen);
      syncFullscreenButton();
    }
  }

  document.addEventListener("fullscreenchange", onFullscreenChange);
  document.addEventListener("webkitfullscreenchange", onFullscreenChange);
  document.addEventListener("MSFullscreenChange", onFullscreenChange);

  function updateCharacter(c) {
    if (!c.alive) return;
    c.x += c.vx;
    c.y += c.vy;
    const ox = c.w * 2;
    const oy = c.h * 2;
    if (c.x <= -ox) {
      c.x = -ox;
      c.vx = Math.abs(c.vx);
    } else if (c.x + c.w >= canvas.width + ox) {
      c.x = canvas.width + ox - c.w;
      c.vx = -Math.abs(c.vx);
    }
    if (c.y <= -oy) {
      c.y = -oy;
      c.vy = Math.abs(c.vy);
    } else if (c.y + c.h >= canvas.height + oy) {
      c.y = canvas.height + oy - c.h;
      c.vy = -Math.abs(c.vy);
    }
    if (gameFrame % staggerFrames === 0) {
      c.frameX = (c.frameX + 1) % runFrames;
    }
  }

  function drawCharacter(c) {
    if (!c.alive) return;
    const sx = c.frameX * spriteWidth;
    const sy = runRow * spriteHeight;
    const facingLeft = c.vx < 0;
    ctx.save();
    if (facingLeft) {
      ctx.translate(c.x + c.w, c.y);
      ctx.scale(-1, 1);
      ctx.drawImage(
        playerImage,
        sx,
        sy,
        spriteWidth,
        spriteHeight,
        0,
        0,
        c.w,
        c.h
      );
    } else {
      ctx.drawImage(
        playerImage,
        sx,
        sy,
        spriteWidth,
        spriteHeight,
        c.x,
        c.y,
        c.w,
        c.h
      );
    }
    ctx.restore();
  }

  function hitTest(px, py, c) {
    if (!c.alive) return false;
    return (
      px >= c.x &&
      px <= c.x + c.w &&
      py >= c.y &&
      py <= c.y + c.h
    );
  }

  function scheduleRespawn(index) {
    const delay =
      respawnDelayMin +
      Math.random() * (respawnDelayMax - respawnDelayMin);
    setTimeout(() => {
      characters[index] = createCharacterFromEdge();
    }, delay);
  }

  function spawnExplosion(c) {
    const destW = Math.max(c.w * 1.2, 90);
    const nw = boomImage.naturalWidth || 1000;
    const nh = boomImage.naturalHeight || 179;
    const srcFrameW = nw / boomFrames;
    const destH = (nh / srcFrameW) * destW;
    explosions.push({
      frame: 0,
      cx: c.x + c.w * 0.5,
      cy: c.y + c.h * 0.5,
      destW,
      destH,
      age: 0,
    });
  }

  function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
      const e = explosions[i];
      e.age++;
      if (e.age % boomStagger === 0) {
        e.frame++;
        if (e.frame >= boomFrames) {
          explosions.splice(i, 1);
        }
      }
    }
  }

  function drawExplosions() {
    if (!boomImage.complete || !boomImage.naturalWidth) return;
    const nw = boomImage.naturalWidth;
    const nh = boomImage.naturalHeight;
    const srcFrameW = nw / boomFrames;
    for (const e of explosions) {
      if (e.frame >= boomFrames) continue;
      const dx = e.cx - e.destW * 0.5;
      const dy = e.cy - e.destH * 0.5;
      ctx.drawImage(
        boomImage,
        e.frame * srcFrameW,
        0,
        srcFrameW,
        nh,
        dx,
        dy,
        e.destW,
        e.destH
      );
    }
  }

  function onPointerDown(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    for (let i = characters.length - 1; i >= 0; i--) {
      const c = characters[i];
      if (hitTest(px, py, c)) {
        spawnExplosion(c);
        c.alive = false;
        scheduleRespawn(i);
        break;
      }
    }
  }

  canvas.addEventListener("pointerdown", onPointerDown);

  function drawBackground() {
    if (!groundImage.complete || !groundImage.naturalWidth) return;
    ctx.drawImage(
      groundImage,
      0,
      0,
      groundImage.naturalWidth,
      groundImage.naturalHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  function animate() {
    window.requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    for (const c of characters) {
      updateCharacter(c);
      drawCharacter(c);
    }
    updateExplosions();
    drawExplosions();
    gameFrame++;
  }

  function start() {
    if (started) return;
    started = true;
    resizeCanvas();
    initCharacters();
    animate();
  }

  playerImage.addEventListener("load", start);
  if (playerImage.complete && playerImage.naturalWidth > 0) {
    start();
  }
});
