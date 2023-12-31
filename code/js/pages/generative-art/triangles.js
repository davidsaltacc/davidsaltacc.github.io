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
ctx.lineJoin = "bevel";
ctx.fillStyle = "#fff";
ctx.strokeStyle = "#fff";
var line, dot, odd = false, lines = [], gap = size / 15;
for (var y = gap / 2; y <= size; y += gap) {
    line = [];
    for (var x = gap / 2; x <= size; x += gap) {
        line.push({
            x: x + (Math.random() * 0.8 - 0.4) * gap + (odd ? gap / 2 : 0),
            y: y + (Math.random() * 0.8 - 0.4) * gap
        });
    }
    lines.push(line);
    odd = !odd;
}
function triangle(a, b, c) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.lineTo(a.x, a.y);
    ctx.closePath();
    var avgX = (a.x + b.x + c.x) / 3;
    var avgY = (a.y + b.y + c.y) / 3;
    ctx.strokeStyle = getColor(avgX, avgY);
    ctx.stroke();
}
function getColor(x, y) {
    var x0 = x / size * 4 - 2;
    var y0 = y / size * 4 - 2;
    var r = Math.abs(x0);
    var g = Math.abs(y0)
    var b = Math.abs(x0 - y0)
    var z = 1.5 * (r ** 2 + g ** 2 + b ** 2);
    z = Math.floor(255 * (z - Math.floor(z)))
    r = r * z / 2 + 127;
    g = g * z / 2 + 127;
    b = b * z / 2 + 127;
    return "rgb(" + r + ", " + g + ", " + b + ")";
}
var dline;
odd = true;
for (var y = 0; y < lines.length; y++) {
    odd = !odd;
    dline = [];
    for (var i = 0; i < lines[y].length; i++) {
        dline.push(odd ? lines[y][i] : lines[y + 1][i]);
        dline.push(odd ? lines[y+1][i] : lines[y][i]);
    }
    for(var i = 0; i < dline.length - 2; i++) {
        triangle(dline[i], dline[i+1], dline[i+2]);
    }
}