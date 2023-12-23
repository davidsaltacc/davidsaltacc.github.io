
function drawF() {
    var a = document.getElementById("a").value;
    var b = document.getElementById("b").value;
    var c = document.getElementById("c").value;
    var d = document.getElementById("d").value;

    draw((x, y) => {
        var x2 = x - (x * (x * x + 1)) / 2;
        var y2 = y - (y * (y * y + 1)) / 2;
        return [
            a * Math.sin(y2) + b * Math.tanh(x2),
            c * Math.sin(x2) + d / Math.cosh(y2)
        ];
    });
}

setZoom(0.4);
drawF();