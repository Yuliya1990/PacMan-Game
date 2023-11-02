pacman = {
  x: 6,
  y: 5,
};
randomGhost1 = {
  x: 6,
  y: 9,
};

astarGhost = {
  x: 1,
  y: 5,
};

dijGhost = {
  x: 11,
  y: 5,
};

// maze generation block
const width = 6;
const height = 6;
const dirs = [
  [0, 2],
  [2, 0],
  [-2, 0],
  [0, -2],
];

let grid = [],
  b;
while (grid.push((b = [])) < height * 2 + 1) while (b.push(1) < width * 2 + 1);
grid[2 * height] = grid[0];

let next = [];

function addNext(x, y, xp, yp) {
  x += xp;
  y += yp;
  if (
    x >= 0 &&
    y >= 0 &&
    y < width * 2 + 1 &&
    x < height * 2 + 1 &&
    !next.includes([x, y]) &&
    grid[x][y] == 1
  ) {
    grid[x - xp / 2][y - yp / 2] = 0;
    grid[x][y] = 0;
    next.push([x, y]);
  }
}

function mark(x, y) {
  dirs.forEach((p) => {
    addNext(x, y, p[0], p[1]);
  });
}

function addHero(grid, x, y, tag) {
  let dirs = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  dirs.forEach((p) => {
    (i = p[0]), (j = p[1]);
    if (grid[x + i][y + j] == 2) {
      grid[x + i][y + j] = tag;
      dirs.length = 0;
    }
  });
  return grid;
}

function displayMaze(grid) {
  let x = Math.floor(grid.length / 2);
  let y = Math.floor(grid[0].length / 2);

  /* 1: the wall
	# 2: empty cell with coin 
	# 0: neighbor of empty cell, potential next cell (for generation algorithm)
	# 3: empty cell (ground)
	# 4: dijkstra ghost
	# 5: pacman
	# 6: random ghost
	# 7: astar ghost 
	#*/

  if (grid[x][y] == 2) {
    grid[x][y] = 5;
  } else {
    grid = addHero(grid, x, y, 5);
  }

  if (grid[1][y] == 2) {
    grid[1][y] = 4;
  } else {
    grid = addHero(grid, 1, y, 4);
  }

  if (grid[x][1] == 2) {
    grid[x][1] = 6;
  } else {
    grid = addHero(grid, x, 1, 6);
  }

  if (grid[x][grid[0].length - 2] == 2) {
    grid[x][grid[0].length - 2] = 7;
  } else {
    grid = addHero(grid, x, grid[0].length - 2, 7);
  }

  return grid;
}

function prepareObjects(grid) {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j] == 4) {
        dijGhost = {
          x: j,
          y: i,
        };
      } else if (grid[i][j] == 5) {
        pacman = {
          x: j,
          y: i,
        };
      } else if (grid[i][j] == 6) {
        randomGhost1 = {
          x: j,
          y: i,
        };
      } else if (grid[i][j] == 7) {
        astarGhost = {
          x: j,
          y: i,
        };
      }
    }
  }
}

function genMaze(grid) {
  let x = Math.floor(Math.random() * (2 * height + 1));
  x = x % 2 == 0 ? x - 1 : x;
  x = x < 0 ? 1 : x;

  let y = Math.floor(Math.random() * (2 * width + 1));
  y = y % 2 == 0 ? y - 1 : y;
  y = y < 0 ? 1 : y;

  grid[x][y] = 2;
  mark(x, y);

  while (next.length > 0) {
    ind = Math.floor(Math.random() * next.length);
    pair = next[ind];
    (x = pair[0]), (y = pair[1]);
    next.splice(ind, 1);

    grid[x][y] = 2;
    dirs.forEach((p) => {
      (i = p[0]), (j = p[1]);
      i /= 2;
      j /= 2;
      if (0 <= i && i < height && 0 <= j && j < width) {
        if (grid[x - i][y - j] == 0) {
          grid[x - i][y - j] = 2;
        }
      }
    });

    mark(x, y);
  }
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j] == 0) grid[i][j] = 2;
    }
  }
  return grid;
}

function combineMazes(map1, map2) {
  for (let i = 0; i < map1.length; i++) {
    for (let j = 0; j < map1[0].length; j++) {
      map1[i][j] = Math.max(map1[i][j], map2[i][j]);
    }
  }
  return map1;
}

// start
(grid = []), b;
while (grid.push((b = [])) < height * 2 + 1) while (b.push(1) < width * 2 + 1);
grid[2 * height] = grid[0];
map1 = genMaze(grid);

(grid = []), b;
while (grid.push((b = [])) < height * 2 + 1) while (b.push(1) < width * 2 + 1);
grid[2 * height] = grid[0];
map2 = genMaze(grid);

grid = combineMazes(map1, map2);

map = displayMaze(grid);
prepareObjects(map);

function prepareMapForSearch() {
  copy = map.slice();
  for (let i = 0; i < map.length; i++) {
    copy[i] = map[i].slice();
    for (let j = 0; j < map[0].length; j++) {
      if (map[i][j] != 1) {
        copy[i][j] = 1;
      } else {
        copy[i][j] = 0;
      }
    }
  }

  return copy;
}

prevMap = [];
for (var i = 0; i < map.length; i++) prevMap[i] = map[i].slice();

var el = document.getElementById('world');
function drawWorld() {
  el.innerHTML = '';
  var pacmanWins = true;
  for (var y = 0; y < map.length; y = y + 1) {
    for (var x = 0; x < map[y].length; x = x + 1) {
      if (map[y][x] === 1) {
        el.innerHTML += "<div class='wall'></div>";
      } else if (map[y][x] === 2) {
        pacmanWins = false;
        el.innerHTML += "<div class='coin'></div>";
      } else if (map[y][x] === 3) {
        el.innerHTML += "<div class='ground'></div>";
      } else if (map[y][x] === 4) {
        el.innerHTML += "<div class='ghostStatic'></div>";
      } else if (map[y][x] === 5) {
        el.innerHTML += "<div class='pacman'></div>";
      } else if (map[y][x] === 6) {
        el.innerHTML += "<div class='ghostRandom'></div>";
      } else if (map[y][x] === 7) {
        el.innerHTML += "<div class='ghostHunter'></div>";
      }
    }
    el.innerHTML += '<br>';
  }
  if (pacmanWins) {
    window.setInterval(100);
    alert('Pacman has won!');
    location.reload();
  }
}

drawWorld();

document.onkeydown = function (event) {
  // console.log(event);
  if (event.keyCode === 37) {
    // PACMAN MOVE LEFT
    if (map[pacman.y][pacman.x - 1] !== 1) {
      if (map[pacman.y][pacman.x - 1] === 4 || map[pacman.y][pacman.x - 1] === 6) {
        console.log('Hit!');
        alert('Game Over!');
        location.reload();
      }
      map[pacman.y][pacman.x] = 3;
      pacman.x = pacman.x - 1;
      map[pacman.y][pacman.x] = 5;
      drawWorld();
    }
  } else if (event.keyCode === 38) {
    // PACMAN MOVE UP
    if (map[pacman.y - 1][pacman.x] !== 1) {
      if (map[pacman.y - 1][pacman.x] === 4 || map[pacman.y - 1][pacman.x] === 6) {
        console.log('Hit!');
        alert('Game Over!');
        location.reload();
      }
      map[pacman.y][pacman.x] = 3;
      pacman.y = pacman.y - 1;
      map[pacman.y][pacman.x] = 5;
      drawWorld();
    }
  } else if (event.keyCode === 39) {
    // PACMAN MOVE RIGHT
    if (map[pacman.y][pacman.x + 1] !== 1) {
      if (map[pacman.y][pacman.x + 1] === 4 || map[pacman.y][pacman.x + 1] === 6) {
        console.log('Hit!');
        alert('Game Over!');
        location.reload();
      }
      map[pacman.y][pacman.x] = 3;
      pacman.x = pacman.x + 1;
      map[pacman.y][pacman.x] = 5;
      drawWorld();
    }
  } else if (event.keyCode === 40) {
    // PACMAN MOVE DOWN
    if (map[pacman.y + 1][pacman.x] !== 1) {
      if (map[pacman.y + 1][pacman.x] === 4 || map[pacman.y + 1][pacman.x] === 6) {
        console.log('Hit!');
        alert('Game Over!');
        location.reload();
      }
      map[pacman.y][pacman.x] = 3;
      pacman.y = pacman.y + 1;
      map[pacman.y][pacman.x] = 5;
      drawWorld();
    }
  }
  console.log(map);
};

(ghostCredit = []), (b = []);
while (ghostCredit.push((b = [])) < height * 2 + 1) while (b.push(0) < width * 2 + 1);
ghostCredit[2 * height] = ghostCredit[0];
console.log(map.length);
console.log(ghostCredit.length);

let pathDij;
let prevPathDij;
let prevPacmanLoc;
let prevPathLastIdxUsedDij;

var dijkstraGhostMoves = window.setInterval(function () {
  if (
    prevPathDij &&
    prevPacmanLoc &&
    prevPacmanLoc.row == pacman.y &&
    prevPacmanLoc.col == pacman.x
  ) {
    nextDij = prevPathDij[prevPathLastIdxUsedDij + 1];
    prevPathLastIdxUsedDij++;
  } else {
    grid = prepareMapForSearch(map);
    src = { row: dijGhost.y, col: dijGhost.x };
    dest = { row: pacman.y, col: pacman.x };
    console.log('src DIJ', src);
    console.log('dest DIJ', dest);
    pathDij = search(grid, src, dest, true);
    console.log('PATH DJ', pathDij);
    nextDij = pathDij[1];
    prevPathLastIdxUsedDij = 1;
    prevPathDij = path;
    prevPacmanLoc = { row: pacman.y, col: pacman.x };
  }

  console.log(map[nextDij.row][nextDij.col]);
  switch (map[nextDij.row][nextDij.col]) {
    case 5:
      drawWorld();
      console.log('Hit!');
      alert('Game Over!');
      location.reload();
      break;
    case 2:
      console.log('DIJ GHOST', dijGhost);
      ghostCredit[nextDij.row][nextDij.col] = 1;
      map[nextDij.row][nextDij.col] = 4;
      map[dijGhost.y][dijGhost.x] = 3;
      if (ghostCredit[dijGhost.y][dijGhost.x] === 1) {
        map[dijGhost.y][dijGhost.x] = 2;
        ghostCredit[dijGhost.y][dijGhost.x] = 0;
      }
      dijGhost.y = nextDij.row;
      dijGhost.x = nextDij.col;
      break;
    case 3:
      console.log('DIJ GHOST', dijGhost);
      map[nextDij.row][nextDij.col] = 4;
      map[dijGhost.y][dijGhost.x] = 3;
      if (ghostCredit[dijGhost.y][dijGhost.x] === 1) {
        map[dijGhost.y][dijGhost.x] = 2;
        ghostCredit[dijGhost.y][dijGhost.x] = 0;
      }
      dijGhost.y = nextDij.row;
      dijGhost.x = nextDij.col;
      break;
    default:
      break;
  }

  drawWorld();
}, 500);

let prevPath;
let prevPathLastIdxUsed;

var astarGhostMoves = window.setInterval(function () {
  if (prevPath && prevPacmanLoc && prevPacmanLoc.row == pacman.y && prevPacmanLoc.col == pacman.x) {
    next = prevPath[prevPathLastIdxUsed + 1];
    prevPathLastIdxUsed++;
  } else {
    grid = prepareMapForSearch(map);
    src = { row: astarGhost.y, col: astarGhost.x };
    dest = { row: pacman.y, col: pacman.x };
    console.log('src', src);
    console.log('dest', dest);
    path = search(grid, src, dest, false);
    next = path[1];
    console.log(next);
    prevPathLastIdxUsed = 1;
    prevPath = path;
    prevPacmanLoc = { row: pacman.y, col: pacman.x };
  }

  console.log(map[next.row][next.col]);
  switch (map[next.row][next.col]) {
    case 5:
      drawWorld();
      console.log('Hit!');
      alert('Game Over!');
      location.reload();
      break;
    case 2:
      console.log('ASTAR GHOST', astarGhost);
      ghostCredit[next.row][next.col] = 1;
      map[next.row][next.col] = 7;
      map[astarGhost.y][astarGhost.x] = 3;
      if (ghostCredit[astarGhost.y][astarGhost.x] === 1) {
        map[astarGhost.y][astarGhost.x] = 2;
        ghostCredit[astarGhost.y][astarGhost.x] = 0;
      }
      astarGhost.y = next.row;
      astarGhost.x = next.col;
      break;
    case 3:
      console.log('ASTAR GHOST', astarGhost);
      map[next.row][next.col] = 7;
      map[astarGhost.y][astarGhost.x] = 3;
      if (ghostCredit[astarGhost.y][astarGhost.x] === 1) {
        map[astarGhost.y][astarGhost.x] = 2;
        ghostCredit[astarGhost.y][astarGhost.x] = 0;
      }
      astarGhost.y = next.row;
      astarGhost.x = next.col;
      break;
    default:
      break;
  }

  drawWorld();
}, 500);

// var staticGhost2Moves = window.setInterval(function(){
//     if (directionUp2){
//         if (map[staticGhost2.y - 1][staticGhost2.x] == 5){
//             console.log("Hit!");
//             alert("Game Over!");
//             location.reload();
//         }
//         else if (map[staticGhost2.y - 1][staticGhost2.x] == 2){
//             ghostCredit[staticGhost2.y - 1][staticGhost2.x] = 1;
//             map[staticGhost2.y - 1][staticGhost2.x] = 4;
//             map[staticGhost2.y][staticGhost2.x] = 3;
//             if (ghostCredit[staticGhost2.y][staticGhost2.x] === 1){
//                 map[staticGhost2.y][staticGhost2.x] = 2;
//                 ghostCredit[staticGhost2.y][staticGhost2.x] = 0;
//             }
//             staticGhost2.y = staticGhost2.y - 1;
//         }
//         else if (map[staticGhost2.y - 1][staticGhost2.x] == 3){
//             map[staticGhost2.y - 1][staticGhost2.x] = 4;
//             map[staticGhost2.y][staticGhost2.x] = 3;
//             if (ghostCredit[staticGhost2.y][staticGhost2.x] === 1){
//                 map[staticGhost2.y][staticGhost2.x] = 2;
//                 ghostCredit[staticGhost2.y][staticGhost2.x] = 0;
//             }
//             staticGhost2.y = staticGhost2.y - 1;
//         }
//         else if (map[staticGhost2.y - 1][staticGhost2.x] == 1 ||
//             map[staticGhost2.y - 1][staticGhost2.x] == 6 ||
//             map[staticGhost2.y - 1][staticGhost2.x] == 7){
//             directionUp2 = false;
//         }
//     }
//     else{
//         if (map[staticGhost2.y + 1][staticGhost2.x] == 5){
//             console.log("Hit!");
//             alert("Game Over!");
//             location.reload();
//         }
//         else if (map[staticGhost2.y + 1][staticGhost2.x] == 2){
//             ghostCredit[staticGhost2.y + 1][staticGhost2.x] = 1;
//             map[staticGhost2.y + 1][staticGhost2.x] = 4;
//             map[staticGhost2.y][staticGhost2.x] = 3;
//             if (ghostCredit[staticGhost2.y][staticGhost2.x] === 1){
//                 map[staticGhost2.y][staticGhost2.x] = 2;
//                 ghostCredit[staticGhost2.y][staticGhost2.x] = 0;
//             }
//             staticGhost2.y = staticGhost2.y + 1;
//         }
//         else if (map[staticGhost2.y + 1][staticGhost2.x] == 3){
//             map[staticGhost2.y + 1][staticGhost2.x] = 4;
//             map[staticGhost2.y][staticGhost2.x] = 3;
//             if (ghostCredit[staticGhost2.y][staticGhost2.x] === 1){
//                 map[staticGhost2.y][staticGhost2.x] = 2;
//                 ghostCredit[staticGhost2.y][staticGhost2.x] = 0;
//             }
//             staticGhost2.y = staticGhost2.y + 1;
//         }
//         else if (map[staticGhost2.y + 1][staticGhost2.x] == 1 ||
//             map[staticGhost2.y + 1][staticGhost2.x] == 6 ||
//             map[staticGhost2.y + 1][staticGhost2.x] == 7){
//             directionUp2 = true;
//         }
//     }
//     drawWorld();
// }, 500);

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
/*randomMoves = [[-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]];*/
randomMoves = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];
var randomGhost1Moves = window.setInterval(function () {
  var RG1Moved = false;
  while (true) {
    var rm = randomMoves[getRandomInt(randomMoves.length)].slice();
    if (map[randomGhost1.y + rm[1]][randomGhost1.x + rm[0]] == 5) {
      console.log('Hit!');
      alert('Game Over!');
      location.reload();
    } else if (map[randomGhost1.y + rm[1]][randomGhost1.x + rm[0]] == 2) {
      ghostCredit[randomGhost1.y + rm[1]][randomGhost1.x + rm[0]] = 1;
      map[randomGhost1.y + rm[1]][randomGhost1.x + rm[0]] = 6;
      map[randomGhost1.y][randomGhost1.x] = 3;
      if (ghostCredit[randomGhost1.y][randomGhost1.x] === 1) {
        map[randomGhost1.y][randomGhost1.x] = 2;
        ghostCredit[randomGhost1.y][randomGhost1.x] = 0;
      }
      randomGhost1.y = randomGhost1.y + rm[1];
      randomGhost1.x = randomGhost1.x + rm[0];
      break;
    } else if (map[randomGhost1.y + rm[1]][randomGhost1.x + rm[0]] == 3) {
      map[randomGhost1.y + rm[1]][randomGhost1.x + rm[0]] = 6;
      map[randomGhost1.y][randomGhost1.x] = 3;
      if (ghostCredit[randomGhost1.y][randomGhost1.x] === 1) {
        map[randomGhost1.y][randomGhost1.x] = 2;
        ghostCredit[randomGhost1.y][randomGhost1.x] = 0;
      }
      randomGhost1.y = randomGhost1.y + rm[1];
      randomGhost1.x = randomGhost1.x + rm[0];
      break;
    }
  }
}, 500);
