const updatePlayers = () => {
  let keys = Object.keys(players);
  for (let i = 0; i < keys.length; i++) {
    let player = players[keys[i]];
    player.x += player.speed * player.fX;
    player.y += player.speed * player.fY;
  }

};

const updateBullets = () => {
  let keys = Object.keys(bullets);
  for (let i = 0; i < keys.length; i++) {
    let bullet = bullets[keys[i]];
    bullet.x += bullet.speed * bullet.fX;
    bullet.y += bullet.speed * bullet.fY;
  }
};

const syncBullets = (data) => {
  //bullets = data;
};

const syncPlayers = (data) => {

  if (!players[data.hash]) {
    players[data.hash] = data;
    return;
  }


  const player = players[data.hash];
  player.x = data.x;
  player.y = data.y;
  player.fX = data.fX;
  player.fY = data.fY;
  player.speed = data.speed;
  player.hullRotation = data.hullRotation;
  player.turretRotation = data.turretRotation;
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
  updatePlayers()

};
