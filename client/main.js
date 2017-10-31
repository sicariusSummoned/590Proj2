let canvas;
let ctx;
let tankHullImg;
let tankTurretImg;
let bulletImg;
let bgImg;

let socket;
let hash;
let animationFrame;

let players = {};
let bullets = {};

const keyDownHandler = (e) => {
  var keyPressed = e.which;

  const player = players[hash];


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

const keyUpHandler = (e) => {
  var keyPressed = e.which;
  const player = players[hash];

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

const init = () => {
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

}

window.onload = init;
