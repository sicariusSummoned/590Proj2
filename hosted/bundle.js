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

var redraw = function redraw(time) {
  update();

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

    ctx.translate(player.x, player.y);
    ctx.rotate(player.hullRotation * (Math.PI / 180));
    ctx.drawImage(tankHullImg, 0, 0, hullSize.WIDTH, hullSize.HEIGHT, -25, -27, 50, 54);

    ctx.restore();

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.turretRotation * (Math.PI / 180));
    ctx.drawImage(tankTurretImg, 0, 0, turretSize.WIDTH, turretSize.HEIGHT, -7, //add half of hull width
    -10, //add half of hull height
    30, 20);

    ctx.restore();
  }

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
    socket.emit('turning', player.hash);
  }
  // D OR RIGHT
  else if (keyPressed === 68 || keyPressed === 39) {
      player.turningRight = true;
      player.turningLeft = false;
      console.log('turning right');
      socket.emit('turning', player.hash);
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
      socket.emit('turning', player.hash);
    }
    // S OR DOWN
    else if (keyPressed === 83 || keyPressed === 40) {
        socket.emit('throttleDown', player.hash);
      }
      // D OR RIGHT
      else if (keyPressed === 68 || keyPressed === 39) {
          player.turningRight = false;
          socket.emit('turning', player.hash);
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
  //bullets = data;
};

var syncPlayers = function syncPlayers(data) {

  if (!players[data.hash]) {
    players[data.hash] = data;
    return;
  }

  var player = players[data.hash];
  player.x = data.x;
  player.y = data.y;
  player.fX = data.fX;
  player.fY = data.fY;
  player.speed = data.speed;
  player.hullRotation = data.hullRotation;
  player.turretRotation = data.turretRotation;
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
  updatePlayers();
};
