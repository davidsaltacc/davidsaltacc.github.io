
function drawF() {
    var a = document.getElementById("a").value;
    var b = document.getElementById("b").value;
    var c = document.getElementById("c").value;
    var d = document.getElementById("d").value;

    draw((x, y) => {
        return [
            Math.sin(a * y) + c * Math.cos(a * x),
            Math.sin(b * x) + d * Math.cos(b * y)
        ];
    });
}

drawF();