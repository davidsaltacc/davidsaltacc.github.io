
function drawF() {
    var a = document.getElementById("a").value;
    var b = document.getElementById("b").value;

    function f(x) {
        return a * x + (2 * (1 - a) * x * x) / (1 + x * x);
    }

    draw((x, y) => {
        var xnext = b * y + f(x);
        return [
            xnext,
            f(xnext) - x
        ];
    });
    
}

drawF();