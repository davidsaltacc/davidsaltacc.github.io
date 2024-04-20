

var canvas = document.createElement("canvas"),
    width = canvas.width = Math.min(window.innerWidth, window.innerHeight),
    height = canvas.height = Math.min(window.innerWidth, window.innerHeight),
    ctx = canvas.getContext("2d");

document.body.prepend(canvas);

var dpr = window.devicePixelRatio;
var rect = canvas.getBoundingClientRect();
canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;
ctx.scale(dpr, dpr);
canvas.style.width = `${rect.width}px`;
canvas.style.height = `${rect.height}px`;


var iterationAmount = 50;
var pointAlpha = 0.15;
var maxParticles = 600000;

var req = null;

function draw(func, zoom = 1) {

    cancelAnimationFrame(req);

    var amount = 0;

    function iter() {
        if (amount >= maxParticles) {
            return;
        }
        var particles = [];
        for (var i = 0; i < 100; i++) {
            particles.push(new Particle(
                Math.random() * canvas.width, Math.random() * canvas.height, 
                func
            ));
            particles.forEach((particle) => {
                for (var i = 0; i < iterationAmount; i++) {
                    particle.update();
                }
                
                particle.show();
            });
            amount += i;
        }
        req = requestAnimationFrame(iter);
    }

    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(255, 255, 255, " + pointAlpha + ")";

    req = requestAnimationFrame(iter);

}

function exportCanvas() {
    var data = canvas.toDataURL("image/png");
    var a = document.createElement("a");
    a.href = data;
    a.download = "attractor.png";
    a.click();
    a.remove();
}

var zoom = 1;

function normalize(x, y) {
    return [
        (x / canvas.width * 2 - 1) * 2,
        (y / canvas.height * 2 - 1) * 2
    ];
}

function denormalize(x, y) {
    return [
        (x / 2 * zoom + zoom / zoom) / 2 * canvas.width,
        (y / 2 * zoom + -zoom / zoom) / 2 * -canvas.height,
    ];
}

function setZoom(z) {
    zoom = z;
}

function Vector2(x, y) {
    this.x = x;
    this.y = y;
}

function Particle(x, y, move) {
    this.position = new Vector2(...normalize(x, y));
    this.move = move;

    this.update = function() {
        var m = this.move(this.position.x, this.position.y);
        this.position.x = m[0];
        this.position.y = m[1];
    };
    this.show = function(zoom) {
        ctx.strokeRect(...denormalize(this.position.x, this.position.y), 0.1, 0.1); // idk how 0.1 is allowed, but it seems to create a better image so i keep it.
    };
}