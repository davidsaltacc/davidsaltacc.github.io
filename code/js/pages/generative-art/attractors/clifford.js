
var iterationAmount = 100;
var pointAlpha = 0.25;

function draw() {
    
    var a = document.getElementById("a").value;
    var b = document.getElementById("b").value;
    var c = document.getElementById("c").value;
    var d = document.getElementById("d").value;
    
    var particles = [];

    for (var x = 0; x < canvas.width; x += canvas.width / (canvas.width / 2)) {
        for (var y = 0; y < canvas.height; y += canvas.height / (canvas.height / 2)) {
            particles.push(new Particle(
                x, y, 
                (x_, y_) => {
                    return [
                        Math.sin(a * y_) + c * Math.cos(a * x_),
                        Math.sin(b * x_) + d * Math.cos(b * y_)
                    ];
                }
            ));
        }
    }

    ctx.fillStyle = "rgba(0, 0, 0, 1)";

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255, 255, 255, " + pointAlpha + ")";

    particles.forEach((particle) => {
        for (var i = 0; i < iterationAmount; i++) {
            particle.update();
        }
        
        particle.show();
    });

}

requestAnimationFrame(draw);