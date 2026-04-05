window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  const playerImage = new Image();
  playerImage.src = "shadow_dog.png";
  const spriteWidth = 575;
  const spriteHeight = 523;
  let frameX = 0;
  let frameY = 0;
  let gameFrame = 0;
  const staggerFrames = 5;

  function animate() {
    window.requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(playerImage, frameX * spriteWidth, frameY * spriteHeight, spriteWidth, spriteHeight, 0, 0, canvas.width, canvas.height);

    if (gameFrame % staggerFrames === 0) {
      if (frameX < 6) frameX++;
      else frameX = 0;
    }
    gameFrame++;
  }

  animate();
});
