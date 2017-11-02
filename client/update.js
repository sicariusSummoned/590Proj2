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

    console.dir(player.hullRotation);
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
  updatePlayers()

};
