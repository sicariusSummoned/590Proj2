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


const cullBullets = (data) => {
  if (data !== null && data !== undefined) {
    bullets = data;
    const keys = Object.keys(bullets);

    for (let i = 0; i < keys.length; i++) {
      const bullet = bullets[keys[i]];

      if (bullet.collided === false) {
        if (bullet.x > screenWidth || bullet.x < 0 || bullet.y > screenHeight || bullet.y < 0) {
          delete bullets[keys[i]];
        }
      }
    }
  }
  return null;
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
};
