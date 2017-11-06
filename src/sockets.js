let io;


const xxh = require('xxhashjs');

const utility = require('./gameUtilities.js');

let numOnline = 0;

let runOnce = false;

const sendPlayers = () => {
  io.sockets.in('room1').emit('syncPlayers', utility.getPlayers());
};

const sendBullets = () => {
  io.sockets.in('room1').emit('syncBullets', utility.getBullets());
};

const onThrottleUp = (sock) => {
  const socket = sock;

  socket.on('throttleUp', (data) => {
    const tempPlayer = utility.getPlayer(data);
    if (tempPlayer !== null || tempPlayer !== undefined) {
      if (tempPlayer.speed < 2) {
        tempPlayer.speed++;
        utility.setPlayer(tempPlayer);
        // console.log(`Speed:${tempPlayer.speed}`);
      }
      sendPlayers();
    }
  });
};

const onThrottleDown = (sock) => {
  const socket = sock;

  socket.on('throttleDown', (data) => {
    const tempPlayer = utility.getPlayer(data);
    if (tempPlayer.speed > -1) {
      tempPlayer.speed--;
      utility.setPlayer(tempPlayer);
      // console.log(`Speed:${tempPlayer.speed}`);
    }
    sendPlayers();
  });
};

const onCannonFire = (sock) => {
  const socket = sock;

  socket.on('firingCannon', (data) => {
    console.log('firingCannon serverside');

    const tempPlayer = utility.getPlayer(data.hash);
    if (tempPlayer !== null && tempPlayer !== undefined) {
      const asRad = data.turretRotation * (Math.PI / 180);

      const newBullet = {
        rotation: tempPlayer.turretRotation,
        x: tempPlayer.x,
        y: tempPlayer.y,
        fX: Math.cos(asRad),
        fY: Math.sin(asRad),
        hash: data.hash,
        collided: false,
        speed: 5,
      };

      utility.setBullet(newBullet);
    }
  });
};

const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    console.log('a user disconnected');

    // remove user data from users
    utility.removePlayer(socket.hash);
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

    if (player !== null && player !== undefined) {
      player.x += player.speed * player.fX;
      player.y += player.speed * player.fY;

      utility.setPlayer(player);
    }
  }


  for (let i = 0; i < bulletKeys.length; i++) {
    const bullet = bullets[bulletKeys[i]];
    console.dir(bullet);
    if (bullet !== null && bullet !== undefined) {
      bullet.x += bullet.speed * bullet.fX;
      bullet.y += bullet.speed * bullet.fY;

      utility.setBullet(bullet);

      console.log(`X:${bullet.x}`);
      console.log(`Y:${bullet.y}`);
    } else {
      console.log('UNDEFINED OR NULL');
    }
  }

  utility.cullBullets(utility.getBullets());


  io.in('room1').emit('sentExplosions', utility.checkBulletCollisions());
};

const onReceiveTurning = (sock) => {
  const socket = sock;

  socket.on('turning', (data) => {
    const player = utility.getPlayer(data.hash);
    if (data.turningLeft) {
      player.hullRotation -= 10;
    }

    if (data.turningRight) {
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
    const player = utility.getPlayer(data.hash);
    if (player !== null && player !== undefined) {
      player.turretRotation = data.turretRotation;

      utility.setPlayer(player);
    }
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
    onCannonFire(socket);


    if (runOnce === false) {
      setInterval(serverUpdate, 30);
      setInterval(sendPlayers, 30);
      setInterval(sendBullets, 30);
      runOnce = true;
    }
  });
};

module.exports.configure = configure;
