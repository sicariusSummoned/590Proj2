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

const updateExplosions = () => {
  let keys = Object.keys(explosions);

  for (let i = 0; i < keys.length; i++) {
    let explosion = explosions[keys[i]];
    if (explosion.lifeFrames > 0) {
      explosion.lifeFrames--;
    } else {
      delete explosions[keys[i]];
    }
  }
}

const syncBullets = (data) => {
  const keys = Object.keys(data);

  console.dir(data);
  
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
  explosions = data;
}

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
  interpolatePlayers();
  interpolateBullets();
  updateExplosions();

};
