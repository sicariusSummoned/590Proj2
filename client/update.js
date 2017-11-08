const interpolatePlayers = () => {
  let keys = Object.keys(players);
  for (let i = 0; i < keys.length; i++) {
    let player = players[keys[i]];
    player.x += player.speed * player.fX;
    player.y += player.speed * player.fY;
  }

};

const interpolateBullets = () => {
  let keys = Object.keys(bullets);
  for (let i = 0; i < keys.length; i++) {
    let bullet = bullets[keys[i]];
    if (bullet.x < 0 || bullet.x > 600 || bullet.y < 0 || bullet.y > 600 || bullet.collided === false) {
      bullet.x += bullet.speed * bullet.fX;
      bullet.y += bullet.speed * bullet.fY;
    }
  }
};

const cullExplosions = () => {

  for (let i = 0; i < explosions.length; i++) {
    let explosion = explosions[i];
    if (explosion.lifeFrames < 0) {
      explosions.splice(i, 1);
      console.log('cullingExplosion');
    }
  }
};

const syncBullets = (data) => {
  const keys = Object.keys(data);


  bullets = data;

  /**
  for (let i = 0; i < keys.length; i++) {
    let dataBullet = data[keys[i]];

    if (!bullets[dataBullet.hash]) {
      bullets[dataBullet.hash] = dataBullet;
      return;
    }

    let bullet = bullets[dataBullet.hash];
    bullet.x = dataBullet.x;
    bullet.y = dataBullet.y;
    bullet.fX = dataBullet.fX;
    bullet.fY = dataBullet.fY;
    bullet.speed = dataBullet.speed;
  }
  **/

};

const receiveExplosions = (data) => {
  console.dir(data[0]);
  explosions = data;
};

const fireCannon = () => {
  console.log('cannon fired clientside');

  let packet = {
    hash: hash,
    turretRotation: players[hash].turretRotation
  };

  console.dir(packet);

  if (!bullets[hash]) {
    socket.emit('firingCannon', packet);
  } else {
    console.log('bullet still in the air');
  }
}

const syncPlayers = (data) => {
  const keys = Object.keys(data);

  players = data;

  /**
  for (let i = 0; i < keys.length; i++) {
    let dataPlayer = data[keys[i]];

    if (!players[dataPlayer.hash]) {
      players[dataPlayer.hash] = dataPlayer;
      return;
    }

    let player = players[dataPlayer.hash];
    player.x = dataPlayer.x;
    player.y = dataPlayer.y;
    player.fX = dataPlayer.fX;
    player.fY = dataPlayer.fY;
    player.speed = dataPlayer.speed;
    player.hullRotation = dataPlayer.hullRotation;
    player.turretRotation = dataPlayer.turretRotation;
  }
  **/

  //Update Display on page

  let percentHp;
  let gearText;
  let shotText;



  percentHp = players[hash].hp / 10;
  percentHp *= 100;


  switch (players[hash].speed) {
    case -1:
      gearText = "R";
      break;
    case 0:
      gearText = "N";
      break;
    case 1:
      gearText = "1";
      break;
    case 2:
      gearText = "2"
      break;
    case 3:
      gearText = "3"
      break;
    default:
      gearText = "???"
      break;
  }


  if (!bullets[hash]) {
    shotText = "READY       ";
  } else {
    shotText = "RELOADING...";
  }





  playerHealthDisplay.innerText = percentHp.toString();
  playerSpeedDisplay.innerText = gearText;
  playerShotDisplay.innerText = shotText;
};

const setPlayer = (data) => {
  console.log('calling setUser');
  console.log('I am:');
  console.dir(data);
  hash = data.hash;
  players[hash] = data;
  requestAnimationFrame(redraw);


}

const update = () => {
  //interpolatePlayers();
  //interpolateBullets();
  cullExplosions();

};
