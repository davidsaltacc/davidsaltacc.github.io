

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

function exportCanvas() {
    var data = canvas.toDataURL("image/png");
    var a = document.createElement("a");
    a.href = data;
    a.download = "attractor.png";
    a.click();
    a.remove();
}

function normalize(x, y) {
    return [
        (x / canvas.width * 2 - 1) * 2,
        (y / canvas.height * 2 - 1) * 2
    ];
}

function denormalize(x, y) {
    return [
        (x / 2 + 1) / 2 * canvas.width,
        (y / 2 + 1) / 2 * canvas.height,
    ];
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
    this.show = function() {
        ctx.strokeRect(...denormalize(this.position.x, this.position.y), 0.1, 0.1); // idk how 0.1 is allowed, but it seems to create a better image so i keep it.
    };
}