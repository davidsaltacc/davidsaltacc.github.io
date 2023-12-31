var canvas = document.getElementById("canvas"),
    context = canvas.getContext("2d"),
    width = canvas.width = window.innerWidth,
    height = canvas.height = window.innerHeight;
	
	

var offsetX = 5;
var offsetY = 5;
var speed = 0.01;
var spacing = 30;
var fillcolor = "#f5f1ed";

var points = [];
for (x = 0; x < width; x += spacing) {
	for (y = 0; y < height; y += spacing) {
		points.push({x: x, y: y});
	}
}
noise.seed(Math.random());
var z = 0;

context.fillStyle = fillcolor;

function render() {
	context.clearRect(0, 0, width, height)
    for (var i = 0; i < points.length; i++) {
		var p = points[i];
		var xoffset = getValue(p.x * -1, p.y) * spacing;
		var yoffset = getValue(p.x, p.y * -1) * spacing;
		context.fillRect(p.x + xoffset * offsetX - spacing / 4, p.y + yoffset * offsetY - spacing / 4, spacing / 4, spacing / 4);
	}
	z += 0.01;
    requestAnimationFrame(render);
}
function getValue(x, y) {
	var scale = 0.001;
    var v = noise.simplex3d(x * scale, y * scale, z);
	return v;
}

render();