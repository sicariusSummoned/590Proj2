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

const redraw = (time) => {
  //console.dir(players);

  ctx.filter = "none";
  ctx.clearRect(0, 0, screenWidth, screenHeight);
  ctx.drawImage(bgImg, 0, 0, screenWidth, screenHeight);

  const playerKeys = Object.keys(players);
  const bulletKeys = Object.keys(bullets);

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
      0,
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

    for (let i = 0; i < bulletKeys.length; i++) {
      const bullet = bullets[bulletKeys[i]];

      if (bullet.hash === hash) {
        ctx.filter = "none"
      } else {
        ctx.filter = "hue-Rotate(90deg)";
      }

      ctx.drawImage(
        bulletImg,
        bulletSize.WIDTH,
        bulletSize.HEIGHT,
        bulletSize.WIDTH,
        bulletSize.HEIGHT,
        bullet.x,
        bullet.y,
        bulletSize.WIDTH,
        bulletSize.HEIGHT
      );
    }

    animationFrame = requestAnimationFrame(redraw);
  }
};
