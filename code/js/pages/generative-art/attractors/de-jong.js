
var iterationAmount = 50;
var pointAlpha = 0.2;
var maxParticles = 200000;

var req = null;

function draw() {

    cancelAnimationFrame(req);
    
    var a = document.getElementById("a").value;
    var b = document.getElementById("b").value;
    var c = document.getElementById("c").value;
    var d = document.getElementById("d").value;

    var amount = 0;

    function iter() {
        if (amount >= maxParticles) {
            return;
        }
        var particles = [];
        for (var i = 0; i < 100; i++) {
            particles.push(new Particle(
                Math.random() * canvas.width, Math.random() * canvas.height, 
                (x_, y_) => {
                    return [
                        Math.sin(a * y_) - Math.cos(b * x_),
                        Math.sin(c * x_) - Math.cos(d * y_)
                    ];
                }
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

draw();