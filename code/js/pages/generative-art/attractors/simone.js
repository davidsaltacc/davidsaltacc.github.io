
function drawF() {
    var a = parseFloat(document.getElementById("a").value);
    var b = parseFloat(document.getElementById("b").value);


    draw((x, y) => {
        return [
            Math.sin(x * x - y * y + a),
            Math.cos(2 * x * y + b)
        ];
    }, 2);
}

setZoom(2);
drawF();