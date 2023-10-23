var sliderIds = [
    "amount",
    "traillen",
    "explamount",
    "explsize",
    "gravity",
];
var sliderElements = [];
var sliderValues = {};
sliderIds.forEach((id) => {
    sliderElements.push(document.getElementById(id));
});
sliderElements.forEach((slider) => {
    document.getElementById(slider.id + "value").innerHTML = slider.value;
    sliderValues[slider.id] = Number(slider.value);
    slider.oninput = function () {
        document.getElementById(this.id + "value").innerHTML = this.value;
        sliderValues[this.id] = Number(this.value);
    };
});
var menuHidden = false;
var toggleVisibility = function () {
    menuHidden = !menuHidden;
    if (!menuHidden) {
        showMenu();
        return;
    }
    hideMenu();
};
var hideMenu = function () {
    document.getElementsByClassName("slidercontainer")[0].style.display =
        "none";
};
var showMenu = function () {
    document.getElementsByClassName("slidercontainer")[0].style.display =
        "block";
};

var canvas = document.createElement("canvas"),
    width = (canvas.width = window.innerWidth),
    height = (canvas.height = window.innerHeight),
    ctx = canvas.getContext("2d");

document.body.appendChild(canvas);

function Vector2(x, y) {
    this.x = x;
    this.y = y;
    this.add = function (vec) {
        this.x += vec.x;
        this.y += vec.y;
    };
    this.multiply = function (amount) {
        this.x *= amount;
        this.y *= amount;
    };
    this.clone = function () {
        return new Vector2(this.x, this.y);
    };
}

function Particle(x, y, hue) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, 0);
    this.acceleration = new Vector2(0, 0);
    this.hue = hue + Math.random() * 50 - 25;
    this.sat = 25 + Math.random() * 75;
    this.lig = 30 + Math.random() * 40;

    this.previousPosition = new Vector2(x, y);

    this.applyVForce = function (force) {
        this.acceleration.y += force;
    };
    this.update = function () {
        this.velocity.add(this.acceleration);
        this.previousPosition = this.position.clone();
        this.position.add(this.velocity);
        this.acceleration.multiply(0);
    };
    this.show = function () {
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.previousPosition.x, this.previousPosition.y);
        ctx.stroke();
    };
}

function Firework(x, y) {
    this.hue = Math.round(Math.random() * 360);
    this.firework = new Particle(
        x || Math.random() * width,
        y || height,
        this.hue
    );
    this.firework.velocity.add(
        new Vector2(0, Math.random() * -(height / 60) - 5)
    );
    this.exploded = false;
    this.particles = [];

    this.update = function () {
        if (!this.exploded) {
            this.firework.applyVForce(sliderValues["gravity"]);
            this.firework.update();

            if (this.firework.velocity.y >= 0) {
                this.exploded = true;
                this.explode();
            }
        }
        var i = 0;
        this.particles.forEach((p) => {
            p.applyVForce(sliderValues["gravity"]);
            p.update();
            p.lifespan -= Math.random() * 0.03;
            if (p.lifespan <= 0 || p.position.y > height || p.position.y < 0) {
                this.particles.splice(i, 1);
            }
            i++;
        });
    };
    this.show = function () {
        if (!this.exploded) {
            ctx.strokeStyle = "hsla(" + this.hue + ", 100%, 50%, 1)";
            this.firework.show();
        }
        this.particles.forEach((p) => {
            //ctx.shadowColor = "hsla(" + this.hue + ", 100%, 50%, 1)";
            //ctx.shadowBlur = 15;
            ctx.strokeStyle =
                "hsla(" +
                p.hue +
                ", " +
                p.sat +
                "%, " +
                p.lig +
                "%, " +
                p.lifespan +
                ")";
            p.show();
            //ctx.shadowColor = "transparent";
        });
    };
    this.explode = function () {
        for (var i = 0; i < sliderValues["explamount"]; i++) {
            var p = new Particle(
                this.firework.position.x,
                this.firework.position.y,
                this.hue
            );
            p.velocity = new Vector2(
                Math.random() * sliderValues["explsize"] * 2 -
                sliderValues["explsize"],
                Math.random() * sliderValues["explsize"] * 2 -
                sliderValues["explsize"]
            );
            p.acceleration = new Vector2(
                Math.random() * sliderValues["explsize"] -
                sliderValues["explsize"] / 2,
                Math.random() * sliderValues["explsize"] -
                sliderValues["explsize"] / 2
            );
            p.lifespan = 1;
            this.particles.push(p);
        }
    };
}

var fireworks = [];

canvas.addEventListener("click", (event) => {
    fireworks.push(new Firework(event.pageX, event.pageY));
});
ctx.fillStyle = "rgb(0, 0, 0)";
ctx.fillRect(0, 0, width, height);

ctx.lineWidth = 2;

var render = function () {
    ctx.fillStyle = "rgba(0, 0, 0, " + (1 - sliderValues["traillen"]) + ")";
    ctx.fillRect(0, 0, width, height);

    if (Math.random() < sliderValues["amount"]) {
        fireworks.push(new Firework());
    }

    var i = 0;
    fireworks.forEach((fw) => {
        fw.update();
        if (fw.exploded) {
            if (fw.particles.length <= 0) {
                fw = null;
                fireworks.splice(i, 1);
                return;
            }
        }
        fw.show();
        i++;
    });

    requestAnimationFrame(render);
};
render();