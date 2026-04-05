window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const playerImage = new Image();
  playerImage.src = "shadow_dog.png";
  const spriteWidth = 575;
  const spriteHeight = 523;
  const runRow = 3;
  const runFrames = 7;
  const staggerFrames = 5;
  const characterCount = 3;
  const respawnDelayMin = 2000;
  const respawnDelayMax = 4500;
  const baseSpeed = 5;
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
      c.x = Math.min(Math.max(c.x, -c.w - 20), canvas.width + 20);
      c.y = Math.min(Math.max(c.y, -c.h - 20), canvas.height + 20);
    }
  }

  window.addEventListener("resize", resizeCanvas);

  function updateCharacter(c) {
    if (!c.alive) return;
    c.x += c.vx;
    c.y += c.vy;
    if (c.x <= 0) {
      c.x = 0;
      c.vx = Math.abs(c.vx);
    } else if (c.x + c.w >= canvas.width) {
      c.x = canvas.width - c.w;
      c.vx = -Math.abs(c.vx);
    }
    if (c.y <= 0) {
      c.y = 0;
      c.vy = Math.abs(c.vy);
    } else if (c.y + c.h >= canvas.height) {
      c.y = canvas.height - c.h;
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

  function onPointerDown(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    for (let i = characters.length - 1; i >= 0; i--) {
      const c = characters[i];
      if (hitTest(px, py, c)) {
        c.alive = false;
        scheduleRespawn(i);
        break;
      }
    }
  }

  canvas.addEventListener("pointerdown", onPointerDown);

  function animate() {
    window.requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const c of characters) {
      updateCharacter(c);
      drawCharacter(c);
    }
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
