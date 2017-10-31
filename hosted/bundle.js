"use strict";

var screenHeight = 600;
var screenWidth = 600;

var hullSize = {
  WIDTH: 155,
  HEIGHT: 164
};

var turretSize = {
  WIDTH: 78,
  HEIGHT: 151
};

var bulletSize = {
  WIDTH: 94,
  HEIGHT: 20
};

var redraw = function redraw(time) {
  //console.dir(players);

  ctx.filter = "none";
  ctx.clearRect(0, 0, screenWidth, screenHeight);
  ctx.drawImage(bgImg, 0, 0, screenWidth, screenHeight);

  var playerKeys = Object.keys(players);
  var bulletKeys = Object.keys(bullets);

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
    ctx.fillStyle = 'yellow';
    ctx.fillRect(player.x, player.y, 20, 20);

    ctx.save();

    ctx.translate(player.x, player.y);
    ctx.rotate(player.hullRotation * 0.01745329252);
    ctx.drawImage(tankHullImg, 0, 0, hullSize.WIDTH * player.frame, hullSize.HEIGHT, player.x - 25, player.y - 27, 50, 54);

    ctx.strokeRect(player.x - 25, player.y - 27, 50, 54);
    ctx.restore();

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.turretRotation * 0.01745329252);
    ctx.drawImage(tankTurretImg, 0, 0, turretSize.WIDTH, turretSize.HEIGHT, player.x - 10, //add half of hull width
    player.y - 15, //add half of hull height
    20, 30);
    ctx.strokeRect(player.x - 10, player.y - 15, 20, 30);

    ctx.restore();

    for (var _i = 0; _i < bulletKeys.length; _i++) {
      var bullet = bullets[bulletKeys[_i]];

      if (bullet.hash === hash) {
        ctx.filter = "none";
      } else {
        ctx.filter = "hue-Rotate(90deg)";
      }

      ctx.drawImage(bulletImg, bulletSize.WIDTH, bulletSize.HEIGHT, bulletSize.WIDTH, bulletSize.HEIGHT, bullet.x, bullet.y, bulletSize.WIDTH, bulletSize.HEIGHT);
    }

    animationFrame = requestAnimationFrame(redraw);
  }
};
'use strict';

var canvas = void 0;
var ctx = void 0;
var tankHullImg = void 0;
var tankTurretImg = void 0;
var bulletImg = void 0;
var bgImg = void 0;

var socket = void 0;
var hash = void 0;
var animationFrame = void 0;

var players = {};
var bullets = {};

var keyDownHandler = function keyDownHandler(e) {
  var keyPressed = e.which;

  var player = players[hash];

  // A OR LEFT
  if (keyPressed === 65 || keyPressed === 37) {
    console.log('turning left');
    player.turningLeft = true;
    player.turningRight = false;
    socket.emit('turning', player);
  }
  // D OR RIGHT
  else if (keyPressed === 68 || keyPressed === 39) {
      player.turningRight = true;
      player.turningLeft = false;
      console.log('turning right');
      socket.emit('turning', player);
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
      socket.emit('turning', player);
    }
    // S OR DOWN
    else if (keyPressed === 83 || keyPressed === 40) {
        socket.emit('throttleDown', player.hash);
      }
      // D OR RIGHT
      else if (keyPressed === 68 || keyPressed === 39) {
          player.turningRight = false;
          socket.emit('turning', player);
        }
        // SPACE
        else if (keyPressed === 32) {

            //Fire cannon
          }
};

var init = function init() {
  tankHullImg = document.querySelector('#hull');
  tankTurretImg = document.querySelector('#turret');
  bulletImg = document.querySelector('#bullet');
  bgImg = document.querySelector('#bg');

  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  socket = io.connect();

  socket.on('playerCreated', setPlayer);
  socket.on('syncPlayers', syncPlayers);
  socket.on('syncBullets', syncBullets);

  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);

  console.dir(tankHullImg);
  console.dir(tankTurretImg);
  console.dir(bgImg);

  setInterval(update, 30);
};

window.onload = init;
'use strict';

var updatePlayers = function updatePlayers() {
  var keys = Object.keys(players);
  for (var i = 0; i < keys.length; i++) {
    var player = players[keys[i]];
    player.x += player.speed * player.fX;
    player.y += player.speed * player.fY;
  }
};

var updateBullets = function updateBullets() {
  var keys = Object.keys(bullets);
  for (var i = 0; i < keys.length; i++) {
    var bullet = bullets[keys[i]];
    bullet.x += bullet.speed * bullet.fX;
    bullet.y += bullet.speed * bullet.fY;
  }
};

var syncBullets = function syncBullets(data) {
  bullets = data;
};

var syncPlayers = function syncPlayers(data) {
  players = data;
};

var setPlayer = function setPlayer(data) {
  console.log('calling setUser');
  //console.dir(data);
  hash = data.hash;
  players[hash] = data;
  requestAnimationFrame(redraw);
};

var update = function update() {
  var pKeys = Object.keys(players);
  if (pKeys.length > 0) {
    updatePlayers();
  }

  var bKeys = Object.keys(bullets);
  if (bKeys.length > 0) {
    updateBullets();
  }
  socket.emit('playerUpdate', players[hash]);
};
