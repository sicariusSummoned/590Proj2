"use strict";

var screenHeight = 600;
var screenWidth = 600;

var hullSize = {
  WIDTH: 155,
  HEIGHT: 164
};

var turretSize = {
  WIDTH: 151,
  HEIGHT: 78
};

var bulletSize = {
  WIDTH: 94,
  HEIGHT: 20
};

var explosionSize = {
  WIDTH: 200,
  HEIGHT: 200
};

var redraw = function redraw(time) {
  update();

  ctx.filter = "none";
  ctx.clearRect(0, 0, screenWidth, screenHeight);
  ctx.drawImage(bgImg, 0, 0, screenWidth, screenHeight);

  var playerKeys = Object.keys(players);
  var bulletKeys = Object.keys(bullets);
  var explosionKeys = Object.keys(explosions);

  for (var i = 0; i < playerKeys.length; i++) {
    var player = players[playerKeys[i]];

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
    ctx.drawImage(tankHullImg, 0, hullSize.HEIGHT * player.frame, hullSize.WIDTH, hullSize.HEIGHT, -25, -27, 50, 54);

    ctx.restore();

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.turretRotation * (Math.PI / 180));
    ctx.drawImage(tankTurretImg, 0, 0, turretSize.WIDTH, turretSize.HEIGHT, -7, //add half of hull width
    -10, //add half of hull height
    30, 20);

    ctx.restore();
  }

  console.log("#of bullets:" + bulletKeys.length);

  for (var _i = 0; _i < bulletKeys.length; _i++) {
    var bullet = bullets[bulletKeys[_i]];

    if (bullet.hash === hash) {
      ctx.filter = "none";
    } else {
      ctx.filter = "hue-Rotate(90deg)";
    }

    ctx.save();

    console.log("X:" + bullet.x);
    console.log("Y:" + bullet.y);

    ctx.translate(bullet.x, bullet.y);
    ctx.rotate(bullet.rotation * (Math.PI / 180));
    ctx.drawImage(bulletImg, 0, 0, bulletSize.WIDTH, bulletSize.HEIGHT, -bulletSize.WIDTH / 2, -bulletSize.HEIGHT / 2, bulletSize.WIDTH, bulletSize.HEIGHT);
    ctx.restore();
  }

  for (var _i2 = 0; _i2 < explosionKeys.length; _i2++) {
    var explosion = explosions[explosionKeys[_i2]];

    ctx.drawImage(explosionImg, 0, 0, explosionSize.WIDTH, explosionSize.HEIGHT, explosion.x, explosion.y, explosionSize.WIDTH, explosionSize.HEIGHT);
  }

  animationFrame = requestAnimationFrame(redraw);
};
'use strict';

var canvas = void 0;
var ctx = void 0;
var tankHullImg = void 0;
var tankTurretImg = void 0;
var bulletImg = void 0;
var explosionImg = void 0;
var bgImg = void 0;

var socket = void 0;
var hash = void 0;
var animationFrame = void 0;

var players = {};
var bullets = {};
var explosions = {};

var mousePosition = {
  x: 0,
  y: 0
};

var angleDegBetweenPoints = function angleDegBetweenPoints(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
};

var getMousePosition = function getMousePosition(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
};

var keyDownHandler = function keyDownHandler(e) {
  var keyPressed = e.which;

  var player = players[hash];

  // A OR LEFT
  if (keyPressed === 65 || keyPressed === 37) {
    console.log('turning left');
    player.turningLeft = true;
    player.turningRight = false;
    var packet = {
      turningLeft: player.turningLeft,
      turningRight: player.turningRight,
      hash: player.hash
    };

    socket.emit('turning', packet);
  }
  // D OR RIGHT
  else if (keyPressed === 68 || keyPressed === 39) {
      player.turningRight = true;
      player.turningLeft = false;
      console.log('turning right');
      var _packet = {
        turningLeft: player.turningLeft,
        turningRight: player.turningRight,
        hash: player.hash
      };

      socket.emit('turning', _packet);
    }
};

var keyUpHandler = function keyUpHandler(e) {
  var keyPressed = e.which;
  var player = players[hash];

  // W OR UP
  if (keyPressed === 87 || keyPressed === 38) {
    socket.emit('throttleUp', player.hash);
  }
  // A OR LEFT
  else if (keyPressed === 65 || keyPressed === 37) {
      player.turningLeft = false;
    }
    // S OR DOWN
    else if (keyPressed === 83 || keyPressed === 40) {
        socket.emit('throttleDown', player.hash);
      }
      // D OR RIGHT
      else if (keyPressed === 68 || keyPressed === 39) {
          player.turningRight = false;
        }
};

var init = function init() {
  tankHullImg = document.querySelector('#hull');
  tankTurretImg = document.querySelector('#turret');
  bulletImg = document.querySelector('#bullet');
  explosionImg = document.querySelector('#explosion');
  bgImg = document.querySelector('#bg');

  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  socket = io.connect();

  socket.on('playerCreated', setPlayer);
  socket.on('syncPlayers', syncPlayers);
  socket.on('syncBullets', syncBullets);
  socket.on('sentExplosions', receiveExplosions);

  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);
  window.addEventListener('mousemove', function (evt) {

    if (players[hash]) {
      mousePosition = getMousePosition(canvas, evt);
      var player = players[hash];
      player.turretRotation = angleDegBetweenPoints(player.x, player.y, mousePosition.x, mousePosition.y);

      var packet = {
        turretRotation: player.turretRotation,
        hash: player.hash
      };

      socket.emit('turretUpdate', packet);
    }
  }, false);

  window.addEventListener('click', fireCannon);
};

window.onload = init;
'use strict';

var interpolatePlayers = function interpolatePlayers() {
  var keys = Object.keys(players);
  for (var i = 0; i < keys.length; i++) {
    var player = players[keys[i]];
    player.x += player.speed * player.fX;
    player.y += player.speed * player.fY;
  }
};

var interpolateBullets = function interpolateBullets() {
  var keys = Object.keys(bullets);
  for (var i = 0; i < keys.length; i++) {
    var bullet = bullets[keys[i]];
    if (bullet.x < 0 || bullet.x > 600 || bullet.y < 0 || bullet.y > 600 || bullet.collided === false) {
      bullet.x += bullet.speed * bullet.fX;
      bullet.y += bullet.speed * bullet.fY;
    }
  }
};

var updateExplosions = function updateExplosions() {
  var keys = Object.keys(explosions);

  for (var i = 0; i < keys.length; i++) {
    var explosion = explosions[keys[i]];
    if (explosion.lifeFrames > 0) {
      explosion.lifeFrames--;
    } else {
      delete explosions[keys[i]];
    }
  }
};

var syncBullets = function syncBullets(data) {
  var keys = Object.keys(data);

  console.dir(data);

  for (var i = 0; i < keys.length; i++) {
    var dataBullet = data[keys[i]];

    if (!bullets[dataBullet.hash]) {
      bullets[dataBullet.hash] = dataBullet;
      return;
    }

    var bullet = bullets[dataBullet.hash];
    bullet.x = dataBullet.x;
    bullet.y = dataBullet.y;
    bullet.fX = dataBullet.fX;
    bullet.fY = dataBullet.fY;
    bullet.speed = dataBullet.speed;
  }
};

var receiveExplosions = function receiveExplosions(data) {
  explosions = data;
};

var fireCannon = function fireCannon() {
  console.log('cannon fired clientside');

  var packet = {
    hash: hash,
    turretRotation: players[hash].turretRotation
  };

  console.dir(packet);

  if (!bullets[hash]) {
    socket.emit('firingCannon', packet);
  } else {
    console.log('bullet still in the air');
  }
};

var syncPlayers = function syncPlayers(data) {
  var keys = Object.keys(data);

  for (var i = 0; i < keys.length; i++) {
    var dataPlayer = data[keys[i]];

    if (!players[dataPlayer.hash]) {
      players[dataPlayer.hash] = dataPlayer;
      return;
    }

    var player = players[dataPlayer.hash];
    player.x = dataPlayer.x;
    player.y = dataPlayer.y;
    player.fX = dataPlayer.fX;
    player.fY = dataPlayer.fY;
    player.speed = dataPlayer.speed;
    player.hullRotation = dataPlayer.hullRotation;
    player.turretRotation = dataPlayer.turretRotation;
  }
};

var setPlayer = function setPlayer(data) {
  console.log('calling setUser');
  console.log('I am:');
  console.dir(data);
  hash = data.hash;
  players[hash] = data;
  requestAnimationFrame(redraw);
};

var update = function update() {
  //interpolatePlayers();
  //interpolateBullets();
  updateExplosions();
};
