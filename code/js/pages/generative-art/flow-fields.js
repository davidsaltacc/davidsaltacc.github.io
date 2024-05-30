
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

canvas.width = canvas.style.width = window.innerWidth; 
canvas.height = canvas.style.height = window.innerHeight;

noise.seed(Math.random());

var noiseGrid = [];
var noiseGridX = Math.ceil(canvas.width / 16) + 1;
var noiseGridY = Math.ceil(canvas.height / 16) + 1;

var noiseScale = 0.0008 + (Math.random() ** 2) * 0.03;
var particlesAmount = 0.006 * canvas.width * canvas.height;

context.fillStyle = "#000000ff";
context.fillRect(0, 0, canvas.width, canvas.height);

context.lineWidth = 1;

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

var maxIter = 22;
var iter = 0;

function hsv2rgb(h, s, v) {
    var r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
    ];
}

setInterval(() => {

    iter = 0;
    noiseScale = 0.0008 + (Math.random() ** 2) * 0.03;

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
    
    requestAnimationFrame(frame);

}, 15000);

function frame() {

    if (iter > maxIter) {
        return;
    }

    particles.forEach(p => {

        if (p.x > canvas.width) { p.x = 0; }
        if (p.y > canvas.height) { p.y = 0; }
        if (p.x < 0) { p.x = canvas.width; }
        if (p.y < 0) { p.y = canvas.height; }

        context.beginPath();
        context.moveTo(p.x, p.y);

        var x = Math.floor(p.x / 16);
        var y = Math.floor(p.y / 16);

        var ang = noiseGrid[x][y]; // * Math.random(); // cool effect on higher noise scales

        p.vx = Math.cos(ang) * 0.5 + p.vx;
        p.vy = Math.sin(ang) * 0.5 + p.vy;
        
        p.x += p.vx;
        p.y += p.vy;
        
        context.lineTo(p.x, p.y);
        var color = hsv2rgb(ang / 12, 0.55, 1);
        context.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]}, 0.37)`;

        context.stroke();

        p.vx *= 0.8;
        p.vy *= 0.8;

    });

    iter += 1;

    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);