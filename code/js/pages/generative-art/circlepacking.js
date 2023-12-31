var canvas = document.createElement("canvas"),
    width = (canvas.width = window.innerWidth),
    height = (canvas.height = window.innerHeight),
    ctx = canvas.getContext("2d");
document.body.appendChild(canvas);
var width = window.innerWidth;
var height = window.innerHeight;
canvas.width = width;
canvas.height = height;
ctx.lineWidth = 2;
var circles = [];
var minRadius = 2;
var maxRadius = 150;
var createCircleAttempts = 500;
function createAndDrawCircle() {
    var newCircle;
    var circleSafeToDraw = false;
    for (var tries = 0; tries < createCircleAttempts; tries++) {
        newCircle = {
            x: Math.floor(Math.random() * width),
            y: Math.floor(Math.random() * height),
            radius: minRadius,
            color: ""
        }
        newCircle.color = getColor(newCircle.x, newCircle.y);
        if (doesCircleHaveACollision(newCircle)) {
            continue;
        } else {
            circleSafeToDraw = true;
            break;
        }
    }
    if (!circleSafeToDraw) {
        return;
    }
    for (var radiusSize = minRadius; radiusSize < maxRadius; radiusSize++) {
        newCircle.radius = radiusSize;
        if (doesCircleHaveACollision(newCircle)) {
            newCircle.radius--;
            break;
        }
    }
    circles.push(newCircle);
    ctx.beginPath();
    ctx.arc(newCircle.x, newCircle.y, newCircle.radius, 0, 2 * Math.PI);
    ctx.strokeStyle = newCircle.color;
    ctx.stroke();
}
function doesCircleHaveACollision(circle) {
    for (var i = 0; i < circles.length; i++) {
        var otherCircle = circles[i];
        var a = circle.radius + otherCircle.radius + 1;
        var x = circle.x - otherCircle.x;
        var y = circle.y - otherCircle.y;
        if (a >= Math.sqrt((x * x) + (y * y))) {
            return true;
        }
    }
    if (circle.x + circle.radius >= width ||
        circle.x - circle.radius <= 0) {
        return true;
    }
    if (circle.y + circle.radius >= height ||
        circle.y - circle.radius <= 0) {
        return true;
    }
}
function* draw() {
    while (true) {
        createAndDrawCircle();
        yield;
    }
}
const loopGenerator = draw();
function updateCanvas() {
	loopGenerator.next();
	requestAnimationFrame(updateCanvas);
}
requestAnimationFrame(updateCanvas);
function getColor(x, y) {
    var cx = width / 2;
    var cy = height / 2;
    var size = Math.min(width, height);
    var radius = size / 2 - size / 8;
    var distance = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
    if (distance > radius) {
        return "white";
    }
    var angle = Math.atan2(y - cy, x - cx);
    var red = Math.floor(127 * Math.sin(angle) + 128);
    var green = Math.floor(127 * Math.sin(angle + Math.PI / 3) + 128);
    var blue = Math.floor(127 * Math.sin(angle + 2 * Math.PI / 3) + 128);
    return "rgb(" + red + ", " + green + ", " + blue + ")";
}