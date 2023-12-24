
var gameClock = 800;

var vmin = Math.min(window.innerWidth, window.innerHeight);
var ivw = vmin == window.innerWidth;
vmin -= vmin / 8;

var rows = 20;
var cols = 10;

var blockSideLength = vmin / (ivw ? cols : rows);

var shapes = [
    [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]
    ],
    [
        [2,0,0],
        [2,2,2],
        [0,0,0]
    ],
    [
        [0,0,3],
        [3,3,3],
        [0,0,0]
    ],
    [
        [4,4],
        [4,4]
    ],
    [
        [0,5,5],
        [5,5,0],
        [0,0,0]
    ],
    [
        [6,6,0],
        [0,6,6],
        [0,0,0]
    ],
    [
        [0,7,0],
        [7,7,7],
        [0,0,0]
    ]
];

var colors = [
    "#000000",
    "#00ffff",
    "#0000ff",
    "#ff8800",
    "#ffff00",
    "#00ff00",
    "#ff0000",
    "#8800ff"
];

var colors2 = [
    "#202020",
    "#30ffff",
    "#3023ff",
    "#ffb830",
    "#ffff30",
    "#30ff30",
    "#ff3030",
    "#b830ff"
];

function Game(ctx) {
    this.ctx = ctx;
    this.fallingPiece = null;

    this.makeStartGrid = function() {
        var grid = [];
        for (var i = 0; i < rows; i++) {
            grid.push([]);
            for (var j = 0; j < cols; j++) {
                grid[grid.length - 1].push(0);
            }
        }
        document.getElementById("score").innerHTML = "Score: 0";
        return grid;
    } 

    this.grid = this.makeStartGrid();

    this.collisionS = function(x, y, shape) {
        var n = shape.length;
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                if (shape[i][j] > 0) {
                    var p = x + j;
                    var q = y + i;
                    if (p >= 0 && p < cols && q < rows) {
                        if (this.grid[q][p] > 0) {
                            return true;
                        }
                    } else {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    this.collision = function(x, y) {
        var shape = this.fallingPiece.shape;
        return this.collisionS(x, y, shape);
    }

    this.renderGame = function() {
        for (var i = 0; i < this.grid.length; i++) {
            for (var j = 0; j < this.grid[i].length; j++) {
                var cell = this.grid[i][j];
                this.ctx.fillStyle = colors[cell];
                this.ctx.strokeStyle = colors2[cell];
                this.ctx.fillRect(j * blockSideLength, i * blockSideLength, blockSideLength, blockSideLength);
                this.ctx.strokeRect(j * blockSideLength, i * blockSideLength, blockSideLength, blockSideLength);
            }
        }
        
        if (this.fallingPiece != null) {
            this.fallingPiece.renderPiece();
        }
    }

    this.moveDown = function() {
        if (this.fallingPiece == null) {
            this.renderGame();
            return true;
        } else if (
            this.collision(this.fallingPiece.x, this.fallingPiece.y + 1)
        ) {
            var shape = this.fallingPiece.shape;
            var x = this.fallingPiece.x;
            var y = this.fallingPiece.y;
            shape.map((row, i) => {
                row.map((cell, j) => {
                    var p = x + j;
                    var q = y + i;
                    if (p >= 0 && p < cols && q < rows && cell > 0) {
                        this.grid[q][p] = shape[i][j];
                    }
                });
            });

            if (this.fallingPiece.y == 0) {
                document.getElementById("score").innerHTML = "Game over";
                this.grid = this.makeStartGrid();
            }

            this.fallingPiece = null;
            this.renderGame();
            return true;
        } else {
            this.fallingPiece.y += 1;
            this.renderGame();
            return false;
        }
    }

    this.move = function(right) {
        if (this.fallingPiece == null) {
            return;
        }
        var x = this.fallingPiece.x;
        var y = this.fallingPiece.y;
        if (right) {
            if (!this.collision(x + 1, y)) {
                this.fallingPiece.x += 1;
            }
        } else {
            if (!this.collision(x - 1, y)) {
                this.fallingPiece.x -= 1;
            }
        }
        this.renderGame();
    }

    this.rotate = function() {
        if (this.fallingPiece != null) {
            var shape = this.fallingPiece.shape.map(a => a.slice());
            for (var y = 0; y < shape.length; ++y) {
                for (var x = 0; x < y; ++x) {
                    [shape[x][y], shape[y][x]] = [shape[y][x], shape[x][y]];
                }
            }
            shape.forEach(row => {
                row.reverse();
            });
            var outOfBounds = false;
            for (var i = 0; i < shape.length; i++) {
                for (var j = 0; j < shape[i].length; j++) {
                    var p = this.fallingPiece.x + j;
                    var q = this.fallingPiece.y + i;
                    if (p < 0 || p >= cols || q < 0 || q >= rows || this.grid[q][p] > 0) {
                        outOfBounds = true;
                    } 
                }
            }
            if (!outOfBounds) {
                this.fallingPiece.shape = shape;
            }
            this.renderGame();
        }
    }
}

function randNum(min, max){
    return (Math.floor(Math.pow(10, 14) * Math.random() * Math.random()) % (max - min + 1)) + min;
}

function Piece(shape, ctx) {
    this.shape = shape;
    this.ctx = ctx;
    this.y = 0;
    this.x = Math.floor(cols / 2) - Math.floor(shape[0].length / 2);

    this.renderPiece = function() {
        this.shape.map((row, i) => {
            row.map((cell, j) => {
                if (cell > 0) {
                    this.ctx.fillStyle = colors[cell];
                    this.ctx.strokeStyle = colors2[cell];
                    this.ctx.fillRect((this.x + j) * blockSideLength, (this.y + i) * blockSideLength, blockSideLength, blockSideLength);
                    this.ctx.strokeRect((this.x + j) * blockSideLength, (this.y + i) * blockSideLength, blockSideLength, blockSideLength);
                }
            });
        });
    }
}

var canvas = document.getElementById("canvas");
var scoreText = document.getElementById("score");
var ctx = canvas.getContext("2d");
var game = new Game(ctx); 
var score = 0;

canvas.width = cols * blockSideLength;
canvas.height = rows * blockSideLength;

setInterval(() => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    newGameState();
}, gameClock);

function newGameState() {
    checkFull(true);
    if (game.fallingPiece == null) {
        var rand = randNum(0, shapes.length - 1);
        var newPiece = new Piece(shapes[rand], ctx);
        game.fallingPiece = newPiece;
        game.moveDown();
    } else {
        game.moveDown();
    }
}

function allFilled(row) {
    for (var x of row) {
        if (x == 0) {
            return false;
        }
    }
    return true;
}

var lastClearAmount = 0;

function checkFull(increaseScore) {
    var amount = 0;
    for (var i = 0; i < game.grid.length; i++) {
        if (allFilled(game.grid[i])) {
            game.grid.splice(i, 1);
            game.grid.unshift(new Array(cols).fill(0));
            amount += 1;
        } 
    }
    if (increaseScore) {
        switch (amount) {
            case 1:
                score += 800;
                break;
            case 2:
                score += 1200;
                break;
            case 3:
                score += 1800;
                break;
            case 4: 
                score += (lastClearAmount == 4 ? 3200 : 2000);
                break;
            default:
                break;
        }
        lastClearAmount = amount;
        scoreText.innerHTML = "Score: " + score;
    }
}

function hardDrop() {
    while (!game.moveDown()) {}
    game.renderGame();
}

document.addEventListener("keydown", e => {
    switch (e.key) {
        case "w":
            game.rotate();
            e.preventDefault();
            break;
        case "d":
            game.move(true);
            e.preventDefault();
            break;
        case "a":
            game.move(false);
            e.preventDefault();
            break;
        case "s":
            game.moveDown();
            checkFull();
            e.preventDefault();
            break;
        case " ":
            hardDrop();
    }
});

var moved = false;
canvas.addEventListener("touchmove", e => {
    e.preventDefault();
    if (game.fallingPiece == null) {
        return;
    }
    moved = true;
    var x = e.changedTouches[0].clientX;
    x = Math.round(x / blockSideLength);
    var diff = game.fallingPiece.x - x + Math.floor(game.fallingPiece.shape.length / 2);
    for (var i = 0; i < Math.abs(diff); i++) {
        game.move(Math.abs(diff) != diff);
    }
});

canvas.addEventListener("touchend", e => {
    e.preventDefault();
    if (game.fallingPiece == null) {
        return;
    }
    if (!moved) {
        game.rotate();
    }
    moved = false;
});