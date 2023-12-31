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
ctx.lineCap = "square";
ctx.lineWidth = 2;
ctx.strokeStyle = "#fff";
var step = 65;
function draw(x, y, width, height) {
    ctx.beginPath();
    var l2r = Math.random() >= 0.5;
    if (l2r) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y + height);
    } else {
        ctx.moveTo(x + width, y);
        ctx.lineTo(x, y + height);
    }
    ctx.strokeStyle = getColor((x * 2 + width) / 2, (y * 2 + height) / 2);
    ctx.closePath();
    ctx.stroke();
}
function getColor(x, y) {
    var cx = width / 2;
    var cy = height / 2;
    var dx = Math.abs(cx - x);
    var dy = Math.abs(cy - y);
    var dx_norm = dx / cx;
    var dy_norm = dy / cy;
    var v = Math.atan(Math.sqrt(dx_norm ** 2 + dy_norm ** 2)) * 255;
    var r = v * dy_norm / 2;
    var g = v * dx_norm;
    var b = v * (dx_norm + dy_norm);
    return "rgb(" + r + ", " + g + ", " + b + ")";
}
function* loop() {
    for (var x = 0; x < width; x += step) {
        for (var y = 0; y < height; y += step) {
            draw(x, y, step, step);
            yield;
        }
    }
}
const loopGenerator = loop();
function updateCanvas() {
	loopGenerator.next();
	requestAnimationFrame(updateCanvas);
}
requestAnimationFrame(updateCanvas);