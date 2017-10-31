let io;

const xxh = require('xxhashjs');

const utility = require('./gameUtilities.js');

let numOnline = 0;

let runOnce = false;


const onThrottleUp = (sock) => {
  const socket = sock;

  socket.on('throttleUp', (data) => {
    console.log('throttling up');
    let tempPlayer = utility.getPlayer(data);
    tempPlayer.speed++;
    utility.setPlayer(tempPlayer);
  });
};

const onThrottleDown = (sock) => {
  const socket = sock;

  socket.on('throttleDown', (data) => {
    console.log('throttling down');
    let tempPlayer = utility.getPlayer(data);
    tempPlayer.speed--;
    utility.setPlayer(tempPlayer);
  });
};

const sendPlayers = () =>{
  io.sockets.in('room1').emit('syncPlayers', utility.getPlayers());
};

const sendBullets = () =>{
  io.sockets.in('room1').emit('syncBullets', utility.getBullets());
};

const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    console.log('a user disconnected');

    //remove user data from users
    utility.removePlayer(socket.hash);
    //Decrement number of players online
    numOnline--;
  })
};

const serverUpdate = () => {
  let bullets = utility.getBullets();
  let bulletKeys = Object.keys(bullets);

  let players = utility.getPlayers();
  let keys = Object.keys(players);


  for (let i = 0; i < keys.length; i++) {
    let player = players[keys[i]];

    if (player.turningLeft) {
      player.hullRotation -= 1;
    } else if (player.turningRight) {
      player.hullRotation += 1;
    }

    player.fX = Math.cos(player.hullRotation);
    player.fY = Math.sin(player.hullRotation);

    player.x += player.speed * player.fX;
    player.y += player.speed * player.fY;

    utility.setPlayer(player);
  }

  for (let i = 0; i < bulletKeys; i++) {
    let bullet = bullets[bulletKeys[i]];

    bullet.x += bullet.speed * bullet.fX;
    bullet.y += bullet.speed * bullet.fY;

    utility.setBullet(bullet);
  }
  
  sendPlayers();
  sendBullets();
};



const onReceiveUpdate = (sock) => {
  const socket = sock;

  socket.on('playerUpdate', (data) => {
    if (data != null && data != undefined) {
      utility.setPlayer(data);
    }
  });
}

const configure = (ioServer) => {
  let io = ioServer;

  io.on('connection', (socket) => {
    console.log('connection started');

    socket.join('room1');
    console.log('creating User');

    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABB).toString(16);

    //fX = cos(theta)
    //fY = sin(theta)

    let Player = {
      x: 250,
      y: 250,
      rotation: 0,
      fX: 1,
      fY: 0,
      speed: 0,
      turningLeft: false,
      turningRight: false,
      hullRotation: 0,
      turretRotation: 0,
      hash: hash,
      frame: 1,
    };
    //Add new player data to players
    utility.setPlayer(Player);
    //Increment number of players online
    numOnline++;
    //send this back to the client
    socket.emit('playerCreated', utility.getPlayer(Player.hash));
    //If the number of active players is 
    //greater than two let the game begin
    if (numOnline > 2) {
      console.log('2+ players online');
      //start game
    }



    onDisconnect(socket);
    onThrottleDown(socket);
    onThrottleUp(socket);
    onReceiveUpdate(socket);

    if (!runOnce) {
      setInterval(serverUpdate, 30);
      runOnce = true;
    }

  });
};

module.exports.configure = configure;
