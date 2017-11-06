const screenWidth = 600;
const screenHeight = 600;

let players = {};
let bullets = {};

const getPlayers = () => players;
const getBullets = () => bullets;

// send hash receive player
const getPlayer = data => players[data];

// send hash receive bullet
const getBullet = data => bullets[data];

const setPlayers = (data) => {
  players = data;
};

const setBullets = (data) => {
  bullets = data;
};

const setPlayer = (data) => {
  players[data.hash] = data;
};

const setBullet = (data) => {
  bullets[data.hash] = data;
};
// send hash delete player
const removePlayer = (data) => {
  delete players[data];
};
// send hash delete bullet
const removeBullet = (data) => {
  delete bullets[data];
};

// pass in position and radius of both colliders
// Will return true on a hit
const checkHit = (x1, y1, r1, x2, y2, r2) => {
  const thickness = r1 + r2;
  if (x1 < x2 + thickness && x1 > x2 - thickness) {
    if (y1 < y2 + thickness && y1 > y2 - thickness) {
      return true;
    }
  }
  return false;
};

// Calculate all bullet hits this frame
const checkBulletCollisions = () => {
  const bKeys = Object.keys(bullets);
  const pKeys = Object.keys(players);

  const collisions = {};

  for (let i = 0; i < bKeys.length; i++) {
    const bullet = bullets[bKeys[i]];
    for (let j = 0; j < pKeys.length; j++) {
      const player = players[pKeys[i]];
      // Ignore your own bullets

      if (player !== null || player !== undefined || bullet !== null || bullet !== undefined) {
        if (bullet.hash !== player.hash) {
          if (checkHit(bullet.x, bullet.y, 5, player.x, player.y, 25)) {
            bullet.collided = true;
            console.log('Hit Detected');
            const explosion = {
              x: bullet.x,
              y: bullet.y,
              lifeFrames: 10,
            };

            setBullets(bullet);

            // populate list with all hits
            collisions[explosion] = explosion;
          }
        }
      }
    }
  }

  return collisions;
};


const cullBullets = () => {
  const bKeys = Object.keys(bullets);

  for (let i = 0; i < bKeys.length; i++) {
    const bullet = bullets[bKeys[i]];
    if (bullet.collided === true) {
      if (bullet.x < 0 || bullet.x > 600 || bullet.y < 0 || bullet.y > 600) {
        console.log(`culling:${bullet}`);
        delete bullets[bullet.hash];
      }
    }
  }
};


module.exports = {
  screenHeight,
  screenWidth,
  getPlayers,
  setPlayers,
  getBullets,
  setBullets,
  setPlayer,
  removePlayer,
  setBullet,
  removeBullet,
  getBullet,
  getPlayer,
  checkHit,
  cullBullets,
  checkBulletCollisions,
};
