const screenHeight = 600;
const screenWidth = 600;

const hullSize = {
  WIDTH: 155,
  HEIGHT: 164
};

const turretSize = {
  WIDTH: 151,
  HEIGHT: 78
};

const bulletSize = {
  WIDTH: 94,
  HEIGHT: 20
};

const explosionSize = {
  WIDTH: 200,
  HEIGHT: 200
};

const redraw = (time) => {
  update();

  ctx.filter = "none";
  ctx.clearRect(0, 0, screenWidth, screenHeight);
  ctx.drawImage(bgImg, 0, 0, screenWidth, screenHeight);

  const playerKeys = Object.keys(players);
  const bulletKeys = Object.keys(bullets);
  const explosionKeys = Object.keys(explosions);

  for (let i = 0; i < playerKeys.length; i++) {
    const player = players[playerKeys[i]];

    if (player.hash === hash) {
      ctx.filter = "none";
    } else {
      ctx.filter = "hue-Rotate(90deg)";
    }

    if (player.frame > 0) {
      if (player.frameCount % 2 === 0) {
        if (player.frame < 2) {
          player.frame++;
        } else {
          player.frame = 0;
        }
      }
    }

    ctx.save();


    ctx.translate(player.x, player.y);
    ctx.rotate(player.hullRotation * (Math.PI / 180));
    ctx.drawImage(
      tankHullImg,
      0,
      hullSize.HEIGHT * player.frame,
      hullSize.WIDTH,
      hullSize.HEIGHT,
      -25,
      -27,
      50,
      54,
    );

    ctx.restore();


    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.turretRotation * (Math.PI / 180));
    ctx.drawImage(
      tankTurretImg,
      0,
      0,
      turretSize.WIDTH,
      turretSize.HEIGHT,
      -7, //add half of hull width
      -10, //add half of hull height
      30,
      20,
    );

    ctx.restore();




  }

  for (let i = 0; i < bulletKeys.length; i++) {
    const bullet = bullets[bulletKeys[i]];

    if (bullet.hash === hash) {
      ctx.filter = "none"
    } else {
      ctx.filter = "hue-Rotate(90deg)";
    }

    ctx.save();
    
    console.log(`X:${bullet.x}`);
    console.log(`Y:${bullet.y}`);
    
    ctx.translate(bullet.x,bullet.y);
    ctx.rotate(bullet.rotation * (Math.PI/180));
    ctx.drawImage(
      bulletImg,
      0,
      0,
      bulletSize.WIDTH,
      bulletSize.HEIGHT,
      -bulletSize.WIDTH/2,
      -bulletSize.HEIGHT/2,
      bulletSize.WIDTH,
      bulletSize.HEIGHT
    );
    ctx.restore();
  }

  for (let i = 0; i < explosionKeys.length; i++) {
    const explosion = explosions[explosionKeys[i]];

    ctx.drawImage(
      explosionImg,
      0,
      0,
      explosionSize.WIDTH,
      explosionSize.HEIGHT,
      explosion.x,
      explosion.y,
      explosionSize.WIDTH,
      explosionSize.HEIGHT
    );
  }

  animationFrame = requestAnimationFrame(redraw);
};
