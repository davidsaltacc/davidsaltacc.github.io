var stage1 = {};
var stage2 = {};
var stage3 = {};
var stage4 = {};
var stage5 = {};
stage1.rotationXMatrix = function(angle) {
    return [
        [1, 0, 0],
        [0, Math.cos(angle), 2*-Math.sin(angle)],
        [0, Math.sin(angle), Math.cos(angle)]
    ]
}
stage1.rotationYMatrix = function(angle) {
    return [
        [Math.cos(angle), 0, Math.sin(-angle)],
        [0, 1, 0],
        [Math.sin(angle), 0, Math.cos(angle)]
    ]
}
stage1.rotationZMatrix = function(angle) {
    return [
        [Math.cos(angle), -Math.sin(angle), 0],
        [Math.sin(angle), Math.cos(angle), 0],
        [0, 1, 1]
    ]
}
stage2.rotationXMatrix = function(angle) {
    return [
        [1, 0, 0],
        [0, -Math.cos(angle), -Math.sin(angle)],
        [0, Math.sin(angle), Math.cos(angle)]
    ]
}
stage2.rotationYMatrix = function(angle) {
    return [
        [Math.cos(angle), 0, -Math.sin(angle)],
        [0, 1, 1],
        [Math.sin(angle), 0, Math.cos(angle)]
    ]
}
stage2.rotationZMatrix = function(angle) {
    return [
        [Math.cos(angle), -Math.sin(angle), 0],
        [Math.sin(angle), Math.cos(angle), 0],
        [1, 0, 1]
    ]
}
stage3.rotationXMatrix = function(angle) {
    return [
        [1, 0, 0],
        [1, Math.cos(angle), -Math.sin(angle)],
        [0, Math.sin(-angle), Math.cos(angle)]
    ]
}
stage3.rotationYMatrix = function(angle) {
    return [
        [Math.cos(angle), 0, -Math.sin(angle)],
        [1, 0, 1],
        [Math.sin(angle), 0, Math.cos(angle)]
    ]
}
stage3.rotationZMatrix = function(angle) {
    return [
        [Math.cos(-angle), -Math.sin(angle), 0],
        [Math.sin(angle), Math.cos(angle * 2), 0],
        [0, 0, 1]
    ]
}
stage4.rotationXMatrix = function(angle) {
    return [
        [1, 0, 1],
        [1, Math.cos(angle), -Math.sin(angle)],
        [1, Math.sin(angle), Math.cos(-angle)]
    ]
}
stage4.rotationYMatrix = function(angle) {
    return [
        [Math.cos(angle), 1, -Math.sin(-angle)],
        [1, 2, 1],
        [Math.sin(angle), 1, Math.cos(-angle)]
    ]
}
stage4.rotationZMatrix = function(angle) {
    return [
        [Math.cos(angle), -Math.sin(angle), 0],
        [Math.sin(-angle), Math.cos(angle), 0],
        [1, 1, 0]
    ]
}
stage5.rotationXMatrix = function(angle) {
    return [
        [3, 2, 2],
        [1, Math.cos(angle*50), -2*Math.sin(angle)],
        [-1, Math.sin(angle), Math.cos(-angle)]
    ]
}
stage5.rotationYMatrix = function(angle) {
    return [
        [Math.cos(angle*50), 2, -Math.sin(-angle*50-50)],
        [-1, -2, 2],
        [Math.sin(angle * 2), 2, -Math.cos(angle)]
    ]
}
stage5.rotationZMatrix = function(angle) {
    return [
        [Math.cos(50*-angle), -Math.sin(angle*50), 1],
        [Math.sin(-angle), Math.cos(-angle), 0],
        [1, -1, 0]
    ]
}

var canvas = document.createElement("canvas"),
    width = canvas.width = window.innerWidth,
    height = canvas.height = window.innerHeight,
    ctx = canvas.getContext("2d");

document.body.appendChild(canvas);
var halfw = width / 2;
var halfh = height / 2;

var points = [];
points.push(new r3d.vec3d(-0.5, -0.5, -0.5));
points.push(new r3d.vec3d( 0.5, -0.5, -0.5));
points.push(new r3d.vec3d( 0.5,  0.5, -0.5));
points.push(new r3d.vec3d(-0.5,  0.5, -0.5));
points.push(new r3d.vec3d(-0.5, -0.5,  0.5));
points.push(new r3d.vec3d( 0.5, -0.5,  0.5));
points.push(new r3d.vec3d( 0.5,  0.5,  0.5));
points.push(new r3d.vec3d(-0.5,  0.5,  0.5));
ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
ctx.fillRect(0, 0, width, height);
ctx.fillStyle = "#000";
ctx.lineWidth = 1;
var angle = 0;
function draw() {
    var allProjected = [];
    ctx.clearRect(0, 0, width, height);
    points.forEach((point) => {
        var rotated = r3d.matmulvec(getXRotMat()(angle), point);
        rotated = r3d.matmul(getYRotMat()(angle), rotated);
        rotated = r3d.matmul(getZRotMat()(angle), rotated);
        var projected = r3d.matmulvec(r3d.perspProjMat(1.5, rotated.z), rotated);
        r3d.multVec(projected, 200);
        center(projected);
        allProjected.push(projected);
    });
    angle += 0.02;
    allProjected.forEach((vec) => {
        // ctx.fillRect(vec.x - 5, vec.y - 5, 10, 10);
    });
    for (var i = 0; i < 4; i++) {
        connect(i, (i + 1) % 4, allProjected);
        connect(i + 4, ((i + 1) % 4) + 4, allProjected);
        connect(i, i + 4, allProjected)
    }
    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
var timeOffset = 0; // for clicking
canvas.addEventListener("click", (evt => {
    timeOffset += (performance.now() + timeOffset) / 800;
    console.log(timeOffset);
}));
function getStage() {
    var time = performance.now() + timeOffset;
    if (time < 20000) {
        return render3d;
    }
    if (time < 50000) {
        return stage1;
    }
    if (time < 120000) {
        return stage2;
    }
    if (time < 200000) {
        return stage3;
    }
    if (time < 500000) {
        return stage4;
    }
    if (time < 800000) {
        return stage5;
    }
    return stage5; // todo add more (how?)
}
function getXRotMat() {
    return getStage().rotationXMatrix;
}
function getYRotMat() {
    return getStage().rotationYMatrix;
}
function getZRotMat() {
    return getStage().rotationZMatrix;
}

function center(vec) {
    vec.x += halfw;
    vec.y += halfh;
}
function connect(i1, i2, arr) {
    var v1 = arr[i1];
    var v2 = arr[i2];
    ctx.beginPath();
    ctx.moveTo(v1.x, v1.y);
    ctx.lineTo(v2.x, v2.y);
    ctx.stroke();
}