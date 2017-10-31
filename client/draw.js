const screenHeight = 600;
const screenWidth = 600;

const hullSize = {
  WIDTH: 155,
  HEIGHT: 164
};

const turretSize = {
  WIDTH: 78,
  HEIGHT: 151
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
    ctx.fillStyle = 'yellow';
    ctx.fillRect(player.x,player.y,20,20);

    ctx.save();

    ctx.translate(player.x, player.y);
    ctx.rotate(player.hullRotation * 0.01745329252);
    ctx.drawImage(
      tankHullImg,
      0,
      0,
      hullSize.WIDTH * player.frame,
      hullSize.HEIGHT,
      player.x - 25,
      player.y - 27,
      50,
      54,
    );

    ctx.strokeRect(player.x - 25, player.y - 27, 50, 54);
    ctx.restore();


    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.turretRotation * 0.01745329252);
    ctx.drawImage(
      tankTurretImg,
      0,
      0,
      turretSize.WIDTH,
      turretSize.HEIGHT,
      player.x - 10, //add half of hull width
      player.y - 15, //add half of hull height
      20,
      30,
    );
    ctx.strokeRect(player.x - 10, player.y - 15, 20, 30);

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
