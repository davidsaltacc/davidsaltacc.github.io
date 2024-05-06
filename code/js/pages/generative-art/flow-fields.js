
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

canvas.width = canvas.style.width = window.innerWidth; 
canvas.height = canvas.style.height = window.innerHeight;

noise.seed(Math.random());

var noiseGrid = [];
var noiseGridX = Math.ceil(canvas.width / 16) + 1;
var noiseGridY = Math.ceil(canvas.height / 16) + 1;

var noiseScale = 0.015;
var particlesAmount = 0.005 * canvas.width * canvas.height;

context.fillStyle = "#000000ff";
context.fillRect(0, 0, canvas.width, canvas.height);

context.lineWidth = 1;
context.strokeStyle = "#ffffff10";

noiseGrid = [];
for (var x = 0; x < noiseGridX; x++) {
    noiseGrid.push([]);
    for (var y = 0; y < noiseGridY; y++) {
        noiseGrid[x][y] = (noise.simplex2d(x * noiseScale + 100, y * noiseScale + 150) + 1) * 2 * Math.PI;
    }
}

var particles = [];

for (var i = 0; i <= particlesAmount; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0
    });
}

setInterval(() => {

    noise.seed(Math.random());
    noiseGrid = [];
    for (var x = 0; x < noiseGridX; x++) {
        noiseGrid.push([]);
        for (var y = 0; y < noiseGridY; y++) {
            noiseGrid[x][y] = (noise.simplex2d(x * noiseScale + 100, y * noiseScale + 150) + 1) * 2 * Math.PI;
        }
    }
    particles.forEach(p => {
        p.x = Math.random() * canvas.width;
        p.y = Math.random() * canvas.height;
        p.vx = 0;
        p.vy = 0;
    });
    context.fillRect(0, 0, canvas.width, canvas.height);

}, 15000);

function frame() {

    particles.forEach(p => {

        if (p.x > canvas.width) { p.x = 0; }
        if (p.y > canvas.height) { p.y = 0; }
        if (p.x < 0) { p.x = canvas.width; }
        if (p.y < 0) { p.y = canvas.height; }

        context.beginPath();
        context.moveTo(p.x, p.y);

        var x = Math.floor(p.x / 16);
        var y = Math.floor(p.y / 16);

        var ang = noiseGrid[x][y]; // * Math.random(); // cool effect

        p.vx = Math.cos(ang) * 0.5 + p.vx;
        p.vy = Math.sin(ang) * 0.5 + p.vy;
        
        p.x += p.vx;
        p.y += p.vy;
        
        context.lineTo(p.x, p.y);
        context.stroke();

        p.vx *= 0.8;
        p.vy *= 0.8;

    });

    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);