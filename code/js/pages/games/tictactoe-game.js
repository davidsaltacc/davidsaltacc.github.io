
function el(e) {
    return document.getElementById(e);
};

var em = " ";
var p1 = "X";
var p2 = "O";

var player = p1;

var won = false;
var pwinner = null;

var params = (new URL(window.location.href)).searchParams;
var difficulty = parseInt(params.get("d") ?? 5);

var aistart = false;

var board = [
    [em, em, em],
    [em, em, em],
    [em, em, em],
];

var htmlboard = [
    [el("00"), el("10"), el("20")],
    [el("01"), el("11"), el("21")],
    [el("02"), el("12"), el("22")]
];

function getempty() {
    var empty = [];
    [   [0, 0],
        [0, 1],
        [0, 2],
        [1, 0],
        [1, 1],
        [1, 2],
        [2, 0],
        [2, 1],
        [2, 2]
    ].forEach(function(p) {
        if (board[p[1]][p[0]] == em) {
            empty.push(p);
        }
    });
    return empty;
}

function winner(dont_highlight) {
    var winning_positions = [
        [[0,0], [1,0], [2,0]],
        [[0,1], [1,1], [2,1]],
        [[0,2], [1,2], [2,2]],

        [[0,0], [0,1], [0,2]],
        [[1,0], [1,1], [1,2]],
        [[2,0], [2,1], [2,2]],

        [[0,0], [1,1], [2,2]],
        [[0,2], [1,1], [2,0]]
    ];

    var winner = null;

    winning_positions.forEach(function(pos) {
        var pl0 = board[pos[0][0]][pos[0][1]];
        if (board[pos[1][0]][pos[1][1]] == pl0 && board[pos[2][0]][pos[2][1]] == pl0 && pl0 != em) {
            winner = pl0;
            if (!dont_highlight) {
                htmlboard[pos[0][0]][pos[0][1]].className = "highlighted";
                htmlboard[pos[1][0]][pos[1][1]].className = "highlighted";
                htmlboard[pos[2][0]][pos[2][1]].className = "highlighted";
            }
        }
    });
    return winner;
}

function minimax(board, depth, ismax) {
    var result = winner(true);
    var empty = getempty();
    if (result != null) {
        return result == p1 ? 1 : -1;
    } else if (empty.length == 0) {
        return 0;
    }
    if (ismax) {
        var bestscore = -Infinity;
        empty.forEach(function(e) {
            board[e[1]][e[0]] = player;
            var score = minimax(board, depth + 1, false);
            board[e[1]][e[0]] = em;
            bestscore = Math.max(score, bestscore);
        });
        return bestscore;
    } else {
        var bestscore = Infinity;
        empty.forEach(function(e) {
            if (player == p1) {
                board[e[1]][e[0]] = p2;
            } else {
                board[e[1]][e[0]] = p1;
            }
            var score = minimax(board, depth + 1, true);
            board[e[1]][e[0]] = em;
            bestscore = Math.min(score, bestscore);
        });
        return bestscore;
    }
}

function getaismove() { // TODO instead of difficulty being a chance of random moves, play a move with a little less score on lower difficulties
    var empty = getempty();
    var bestscore = -Infinity;
    var move = null;

    empty.forEach(function(e) {
        board[e[1]][e[0]] = player;
        var score = minimax(board, 0, false);
        board[e[1]][e[0]] = em;
        console.log("Move " + e[1] + "/" + e[0] + " Score " + score);
        if (Math.random() > 0.5 && bestscore != 0) { // 0.5 chance for >= instead of > for more random moves, bestscore != null because it doesnt work else
            if (score > bestscore) {
                bestscore = score;
                move = e;
            }
        } else {
            if (score >= bestscore) {
                bestscore = score;
                move = e;
            }
        }
    });
    return move;
}

function aimove() {

    var empty = getempty();
    var randmove = empty[Math.floor(Math.random() * empty.length)];

    var aismove = getaismove();

    if (difficulty == 1) {
        if (Math.random() > 0.2) {
            return randmove;
        }
        return aismove;
    }
    if (difficulty == 2) {
        if (Math.random() > 0.4) {
            return randmove;
        }
        return aismove;
    }
    if (difficulty == 3) {
        if (Math.random() > 0.65) {
            return randmove;
        }
        return aismove;
    }
    if (difficulty == 4) {
        if (Math.random() > 0.85) {
            return randmove;
        }
        return aismove;
    }
    if (difficulty == 5) {
        return aismove;
    }

    return randmove;
}

function onwon() {
    el("status").innerHTML = pwinner + " won! <a onclick=\"reset();\">[reset]</a>";
}

function ondraw() {
    el("status").innerHTML = "No one won. <a onclick=\"reset();\">[reset]</a>";
}

function clicked(y, x) {

    if (won) {
        return;
    }

    if (board[y][x] != em) {
        return;
    }

    board[y][x] = player;
    htmlboard[y][x].innerHTML = player;

    pwinner = winner(false);
    if (pwinner != null) {
        won = true;
        onwon();
        return;
    }
    if (getempty().length == 0) {
        won = true;
        ondraw();
        return;
    }

    if (player == p1) {
        player = p2;
    } else {
        player = p1;
    }

    var [aix, aiy] = aimove();

    board[aiy][aix] = player;
    htmlboard[aiy][aix].innerHTML = player;
    
    pwinner = winner(false);
    if (pwinner != null) {
        won = true;
        onwon();
        return;
    }
    if (getempty().length == 0) {
        won = true;
        ondraw();
        return;
    }
    
    if (player == p1) {
        player = p2;
    } else {
        player = p1;
    }
}

[   [0, 0],
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2]
].forEach(function(p) {
    htmlboard[p[0]][p[1]].addEventListener("click", function() {clicked(p[0], p[1])});
});



function reset() {

    won = false;
    pwinner = null;

    board = [
        [em, em, em],
        [em, em, em],
        [em, em, em],
    ];

    [   [0, 0],
        [0, 1],
        [0, 2],
        [1, 0],
        [1, 1],
        [1, 2],
        [2, 0],
        [2, 1],
        [2, 2]
    ].forEach(function(p) {
        htmlboard[p[0]][p[1]].innerHTML = em;
        htmlboard[p[0]][p[1]].className = "";
    });
    
    if (aistart) {
        p1 = "X";
        p2 = "O";
        player = p1;
        var [aix, aiy] = aimove();
        board[aiy][aix] = player;
        htmlboard[aiy][aix].innerHTML = player;
        player = p2;
    } else {
        p1 = "O";
        p2 = "X";
        player = p2;
    }

    el("status").innerHTML = "Tic-Tac-Toe game in progress... " + p2 + "'s turn.";
}

function upddifftxt() {
    el("difficultytext").innerHTML = (aistart ? "AI" : "Player") + " begins, game difficulty " + difficulty + " out of 5";
}

reset();
upddifftxt();