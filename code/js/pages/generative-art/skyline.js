// this is literally just wavylines.js but edited a little i have no idea how much of this is necessary but it works so i keep it lol

var canvas = document.createElement("canvas"),
    width = (canvas.width = window.innerWidth),
    height = (canvas.height = window.innerHeight),
    ctx = canvas.getContext("2d");
document.body.appendChild(canvas);
var width = window.innerWidth;
var height = window.innerHeight;
var size = Math.min(width, height);
canvas.width = width;
canvas.height = height;
ctx.lineWidth = 2;
ctx.strokeStyle = "#fff";
var step = 20;
var lines = [];
for (var i = step; i <= height - step; i += step) {
    var line = [];
    for (var j = step; j <= width - step; j += step) {
        var distanceToCenter = Math.abs(j - width / 2);
        var normY = (i - height / 2) / (height / 2) / 2;
        normY += Math.abs(normY) == normY ? -0.5 : 0.5;
        var variance = Math.max(width / 2 - 50 - distanceToCenter, 0);
        var random = Math.random() * variance / 4 * -1 * normY;
        var point = {x: j, y: i + random * ((Math.random() - 1) * 2) ** 50};
        line.push(point);
    } 
    lines.push(line);
}
for (var i = 0; i < lines.length; i++) {
    ctx.beginPath();
    ctx.moveTo(lines[i][0].x, lines[i][0].y);
    for (var j = 0; j < lines[i].length - 2; j++) {
        var xc = (lines[i][j].x + lines[i][j + 1].x) / 2;
        var yc = (lines[i][j].y + lines[i][j + 1].y) / 2;
        ctx.quadraticCurveTo(lines[i][j].x, lines[i][j].y, xc, yc);
    }
    ctx.strokeStyle = getColor(lines[i][j].x, lines[i][j].y); // TODO maybe fix idk
    ctx.quadraticCurveTo(lines[i][j].x, lines[i][j].y, lines[i][j + 1].x, lines[i][j + 1].y);
    ctx.stroke();
}
function getColor(x, y) {
    var r = 120 + Math.floor(50 * Math.cos(Math.random()));
    var g = 130 + Math.floor(50 * Math.cos(Math.random()));
    var b = 150 + Math.floor(50 * Math.sin(Math.random()));
    return "rgb(" + r + ", " + g + ", " + b + ")";
}