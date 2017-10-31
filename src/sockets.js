let io;

const xxh = require('xxhashjs');

const utility = require('./gameUtilities.js');

let numOnline = 0;

let runOnce = false;

const sendPlayers = () => {
  io.sockets.in('room1').emit('syncPlayers', utility.getPlayers());
};

/**
const sendBullets = () => {
  io.sockets.in('room1').emit('syncBullets', utility.getBullets());
};
* */

const onThrottleUp = (sock) => {
  const socket = sock;

  socket.on('throttleUp', (data) => {
    const tempPlayer = utility.getPlayer(data);
    if (tempPlayer.speed < 1) {
      tempPlayer.speed++;
      utility.setPlayer(tempPlayer);
      console.log(`Speed:${tempPlayer.speed}`);
    }
    sendPlayers();
  });
};

const onThrottleDown = (sock) => {
  const socket = sock;

  socket.on('throttleDown', (data) => {
    const tempPlayer = utility.getPlayer(data);
    if (tempPlayer.speed > -1) {
      tempPlayer.speed--;
      utility.setPlayer(tempPlayer);
      console.log(`Speed:${tempPlayer.speed}`);
    }
    sendPlayers();
  });
};


const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    console.log('a user disconnected');

    // remove user data from users
    utility.removePlayer(socket.hash);
    console.dir(utility.getPlayers());
    // Decrement number of players online
    numOnline--;
    socket.leave();
    sendPlayers();
  });
};

const serverUpdate = () => {
  const bullets = utility.getBullets();
  const bulletKeys = Object.keys(bullets);

  const players = utility.getPlayers();
  const keys = Object.keys(players);


  for (let i = 0; i < keys.length; i++) {
    const player = players[keys[i]];

    player.x += player.speed * player.fX;
    player.y += player.speed * player.fY;

    utility.setPlayer(player);
  }

  for (let i = 0; i < bulletKeys; i++) {
    const bullet = bullets[bulletKeys[i]];

    bullet.x += bullet.speed * bullet.fX;
    bullet.y += bullet.speed * bullet.fY;

    utility.setBullet(bullet);
  }
};

const onReceiveTurning = (sock) => {
  const socket = sock;

  socket.on('turning', (data) => {
    const player = utility.getPlayer(data);

    if (player.turningLeft) {
      player.hullRotation -= 10;
    }

    if (player.turningRight) {
      player.hullRotation += 10;
    }


    const asRad = player.hullRotation * (Math.PI / 180);

    player.fX = Math.cos(asRad);
    player.fY = Math.sin(asRad);

    utility.setPlayer(player);
  });
};

const onTurretUpdate = (sock) => {
  const socket = sock;

  socket.on('turretUpdate', (data) => {
    console.log('turretUPDATE');

    const player = utility.getPlayer(data.hash);
    player.turretRotation = data.turretRotation;

    utility.setPlayer(player);
  });
};

const configure = (ioServer) => {
  io = ioServer;

  io.on('connection', (sock) => {
    const socket = sock;
    console.log('connection started');

    socket.join('room1');
    console.log('creating User');

    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABB).toString(16);

    socket.hash = hash;
    // fX = cos(theta)
    // fY = sin(theta)

    const Player = {
      x: 100,
      y: 100,
      fX: 1,
      fY: 0,
      speed: 0,
      turningLeft: false,
      turningRight: false,
      hullRotation: 0,
      turretRotation: 0,
      hash,
      frame: 1,
    };
    // Add new player data to players
    utility.setPlayer(Player);
    // Increment number of players online
    numOnline++;
    // send this back to the client
    socket.emit('playerCreated', utility.getPlayer(Player.hash));
    // If the number of active players is
    // greater than two let the game begin
    if (numOnline > 2) {
      console.log('2+ players online');
      // start game
    }


    onDisconnect(socket);
    onThrottleDown(socket);
    onThrottleUp(socket);
    onTurretUpdate(socket);
    onReceiveTurning(socket);


    if (runOnce === false) {
      setInterval(serverUpdate, 30);
      setInterval(sendPlayers, 30);
      runOnce = true;
    }

    console.dir(utility.getPlayers());
  });
};

module.exports.configure = configure;
