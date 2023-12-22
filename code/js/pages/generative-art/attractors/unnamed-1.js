
function drawF() {
    var a = document.getElementById("a").value;
    var b = document.getElementById("b").value;
    var c = document.getElementById("c").value;
    var d = document.getElementById("d").value;

    draw((x, y) => {
        return [
            Math.cos(x * x - y * y) * b + Math.sin(y * x - x) * a,
            Math.sin(2 * x * y) * c - Math.cos(x * 2 - y) * d
        ];
    });
}

drawF();