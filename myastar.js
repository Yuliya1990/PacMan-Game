ROW = 11;
COL = 15;

function isValid(row, col) {
    return (row >= 0) && (row < ROW) && 
    (col >= 0) && (col < COL);  
}

function isUnblocked(grid, row, col) {
    if (row == 4 && col == 2) {
        console.log("inblocked", grid[row][col] == 1)
    }
    return grid[row][col] === 1;
}

function isDestination(row, col, dest) {
    return (row == dest.row) && (col == dest.col);
}  

function heuristic(row, col, dest, isDijkstra) {
    if (isDijkstra) {
        return 0;
    }

    return Math.sqrt( (row - dest.row) * (row - dest.row) +
    (col - dest.col) * (col-dest.col));
}

function tracePath(cellDetails, dest) {
    console.log("We trace path")
    let row = dest.row;
    let col = dest.col;

    path = [];
    // console.log(cellDetails)
    while (!(cellDetails[row][col].parent_i == row && 
    cellDetails[row][col].parent_j == col)) {
        path.push({row: row, col: col});
        tempRow = cellDetails[row][col].parent_i;
        tempCol = cellDetails[row][col].parent_j;
        row = tempRow;
        col = tempCol;
    }

    path.push({row: row, col: col});
    console.log("PATH in trace", path)
    return path.reverse();
}

function search(grid, src, dest, isDijkstra) {
    if (!isValid(src.row, src.col)) {
        console.log("source is out of bounds");
        return;
    }

    if (!isValid(dest.row, dest.col)) {
        console.log("destination is out of bounds");
        return;
    }

    if (!isUnblocked(grid, src.row, src.col) ||
     !isUnblocked(grid, dest.row, dest.col)) {
        console.log("src or destination are blocked");
        return;
    }

    if (isDestination(src.row, src.col, dest)) {
        console.log ("src == destination")
        return;
    }

    let closedList = [];
    let cellDetails = [];
    let i,j;

    for (let i = 0; i < ROW; i++) {
        cellDetails[i] = new Array();
    }
    
    for (let i = 0; i < ROW; i++) {
        closedList[i] = new Array(COL);
        for (let j = 0; j < COL; j++) {
            closedList[i][j] = false;
        }
    }

    for (let i = 0; i < ROW; i++) {
        for (let j = 0; j < COL; j++) {
            cellDetails[i][j] = {f: Number.MAX_VALUE, g: Number.MAX_VALUE, 
            h: Number.MAX_VALUE, parent_i: -1, parent_j: -1};
        }
    }

    i = src.row; j = src.col;
    cellDetails[i][j] = {f: 0.0, g: 0.0, h: 0.0, parent_i: i, parent_j: j};
    const openList = new Set();  
    openList.add({f: 0, i: i, j: j});
    let foundDest = false;
    path = new Array();

    while(openList.size > 0) {
         p = Array.from(openList).reverse().pop();
        openList.delete(p);
        // console.log(p);
        i = p.i;
        j = p.j;
        closedList[i][j] = true;

        let gNew, hNew, fNew;
        if (isValid(i - 1, j)) {
            if (isDestination(i - 1, j, dest)) {
                cellDetails[i-1][j].parent_i = i;
                cellDetails[i-1][j].parent_j = j;
                path = tracePath(cellDetails, dest);
                foundDest = true;
                return path;
            }

            else if (closedList[i-1][j] == false  && isUnblocked(grid, i-1, j)) {
;                   gNew = cellDetails[i][j].g + 1.0;
                    hNew = heuristic(i-1, j ,dest, isDijkstra);
                    fNew = gNew + hNew;
                    
                    if (cellDetails[i-1][j].f == Number.MAX_VALUE || 
                        cellDetails[i-1][j].f > fNew) {
                            openList.add({f: fNew, i: i-1, j:j});
                            cellDetails[i - 1][j].f = fNew;
                            cellDetails[i - 1][j].g = gNew;
                            cellDetails[i - 1][j].h = hNew;
                            cellDetails[i - 1][j].parent_i = i;
                            cellDetails[i - 1][j].parent_j = j;
                    }
                }

        }
        if (isValid(i + 1, j)) {
            if (isDestination(i + 1, j, dest)) {
                cellDetails[i+1][j].parent_i = i;
                cellDetails[i+1][j].parent_j = j;
                path = tracePath(cellDetails, dest);
                foundDest = true;
                return path;
            }

            else if (closedList[i+1][j] == false 
                && isUnblocked(grid, i+1, j)) {
                    gNew = cellDetails[i][j].g + 1.0;
                    hNew = heuristic(i+1, j ,dest, isDijkstra);
                    fNew = gNew + hNew;

                    if (cellDetails[i+1][j].f == Number.MAX_VALUE || 
                        cellDetails[i+1][j].f > fNew) {
                            openList.add({f: fNew, i: i+1, j:j});
                            cellDetails[i + 1][j].f = fNew;
                            cellDetails[i + 1][j].g = gNew;
                            cellDetails[i + 1][j].h = hNew;
                            cellDetails[i + 1][j].parent_i = i;
                            cellDetails[i + 1][j].parent_j = j;
                    }
                }
        }

        if (isValid(i, j + 1)) {
			if (isDestination(i, j + 1, dest)) {
				cellDetails[i][j + 1].parent_i = i;
				cellDetails[i][j + 1].parent_j = j;
				path = tracePath(cellDetails, dest);
				foundDest = true;
				return path;
			}

			// Else do the following
			else if (closedList[i][j + 1] == false
					&& isUnblocked(grid, i, j + 1)
							== true) {
				gNew = cellDetails[i][j].g + 1.0;
				hNew = heuristic(i, j + 1, dest, isDijkstra);
				fNew = gNew + hNew;

				if (cellDetails[i][j + 1].f == Number.MAX_VALUE
					|| cellDetails[i][j + 1].f > fNew) {
                        openList.add({f: fNew, i: i, j:j+1});

					cellDetails[i][j + 1].f = fNew;
					cellDetails[i][j + 1].g = gNew;
					cellDetails[i][j + 1].h = hNew;
					cellDetails[i][j + 1].parent_i = i;
					cellDetails[i][j + 1].parent_j = j;
				}
			}
		}

        if (isValid(i, j - 1)) {
			if (isDestination(i, j - 1, dest)) {
				cellDetails[i][j - 1].parent_i = i;
				cellDetails[i][j - 1].parent_j = j;
				path = tracePath(cellDetails, dest);
				foundDest = true;
				return path;
			}

			else if (closedList[i][j - 1] == false
					&& isUnblocked(grid, i, j - 1)
							== true) {
				gNew = cellDetails[i][j].g + 1.0;
				hNew = heuristic(i, j - 1, dest, isDijkstra);
				fNew = gNew + hNew;
				if (cellDetails[i][j - 1].f == Number.MAX_VALUE
					|| cellDetails[i][j - 1].f > fNew) {
                        openList.add({f: fNew, i: i, j:j-1});

					// Update the details of this cell
					cellDetails[i][j - 1].f = fNew;
					cellDetails[i][j - 1].g = gNew;
					cellDetails[i][j - 1].h = hNew;
					cellDetails[i][j - 1].parent_i = i;
					cellDetails[i][j - 1].parent_j = j;
				}
			}
		}

    }
    if (!foundDest){
        console.log("AAAAA");
    }

    return path
}

// grid = [ [ 1, 0, 1, 1, 1, 1, 0, 1, 1, 1 ],
// [ 1, 1, 1, 0, 1, 1, 1, 0, 1, 1 ],
// [ 1, 1, 1, 0, 1, 1, 0, 1, 0, 1 ],
// [ 0, 0, 1, 0, 1, 0, 0, 0, 0, 1 ],
// [ 1, 1, 1, 0, 1, 1, 1, 0, 1, 0 ],
// [ 1, 0, 1, 1, 1, 1, 0, 1, 0, 0 ],
// [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 1 ],
// [ 1, 0, 1, 1, 1, 1, 0, 1, 1, 1 ],
// [ 1, 1, 1, 0, 0, 0, 1, 0, 0, 1 ] ]

// src = {row: 0, col: 8};
// dest = {row: 0, col: 0};
// console.log(src)
// console.log(dest)
// path = []
// path = search(grid, src, dest);
// console.log(path);