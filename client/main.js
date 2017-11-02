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
let mousePosition = {
  x: 0,
  y: 0
};


const angleDegBetweenPoints = (x1, y1, x2, y2) => {
  return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
};

const getMousePosition = (canvas, evt) => {
  let rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
};

const keyDownHandler = (e) => {
  var keyPressed = e.which;

  const player = players[hash];


  // A OR LEFT
  if (keyPressed === 65 || keyPressed === 37) {
    console.log('turning left');
    player.turningLeft = true;
    player.turningRight = false;
    const packet = {
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
    const packet = {
      turningLeft: player.turningLeft,
      turningRight: player.turningRight,
      hash: player.hash
    };

    socket.emit('turning', packet);
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



  }
  // S OR DOWN
  else if (keyPressed === 83 || keyPressed === 40) {
    socket.emit('throttleDown', player.hash);

  }
  // D OR RIGHT
  else if (keyPressed === 68 || keyPressed === 39) {
    player.turningRight = false;


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
  window.addEventListener('mousemove', function (evt) {

    if (players[hash]) {
      mousePosition = getMousePosition(canvas, evt);
      let player = players[hash];
      player.turretRotation = angleDegBetweenPoints(player.x, player.y, mousePosition.x, mousePosition.y);

      let packet = {
        turretRotation: player.turretRotation,
        hash: player.hash
      };

      socket.emit('turretUpdate', packet);
    }

  }, false);



}

window.onload = init;
