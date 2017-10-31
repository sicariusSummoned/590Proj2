let io;

const xxh = require('xxhashjs');

const utility = require('./gameUtilities.js');

let numOnline = 0;

let runOnce = false;


const onThrottleUp = (sock) => {
  const socket = sock;

  socket.on('throttleUp', (data) => {
    let tempPlayer = utility.getPlayer(data);
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

  socket.on('throttleDown', (data) => {;


    let tempPlayer = utility.getPlayer(data);
    if (tempPlayer.speed > -1) {
      tempPlayer.speed--;
      utility.setPlayer(tempPlayer);
      console.log(`Speed:${tempPlayer.speed}`);

    }
    sendPlayers();
  });
};

const sendPlayers = () => {
  io.sockets.in('room1').emit('syncPlayers', utility.getPlayers());
};

const sendBullets = () => {
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
    sendPlayers();
    socket.leave();
  })
};

const serverUpdate = () => {
  let bullets = utility.getBullets();
  let bulletKeys = Object.keys(bullets);

  let players = utility.getPlayers();
  let keys = Object.keys(players);


  for (let i = 0; i < keys.length; i++) {
    let player = players[keys[i]];

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
};

const onReceiveTurning = (sock) => {
  const socket = sock;

  socket.on('turning', (data) => {
    console.log('turning on server');
    let player = data;

    if (player.turningLeft) {
      player.hullRotation -= 10;
    }

    if (player.turningRight) {
      player.hullRotation += 10;
    }

    utility.setPlayer(player);

    console.dir(player.hullRotation);
    let asRad = player.hullRotation * (Math.PI/180);

    player.fX = Math.cos(asRad);
    player.fY = Math.sin(asRad);

  });
}

const onReceiveUpdate = (sock) => {
  const socket = sock;

  socket.on('playerUpdate', (data) => {
    if (data != null && data != undefined) {
      utility.setPlayer(data);

      sendPlayers();
    }
  });
}

const configure = (ioServer) => {
  io = ioServer;

  io.on('connection', (socket) => {
    console.log('connection started');

    socket.join('room1');
    console.log('creating User');

    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABB).toString(16);

    //fX = cos(theta)
    //fY = sin(theta)

    let Player = {
      x: 100,
      y: 100,
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
    onReceiveTurning(socket);
    if (!runOnce) {
      setInterval(serverUpdate, 30);
      runOnce = true;
    }

  });
};

module.exports.configure = configure;
