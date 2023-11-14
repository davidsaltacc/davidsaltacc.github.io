const counter = document.getElementById("counter");

var pi = 3;
var n = 2;
var s = 1;
function update() {
    pi += s * (4 / ((n) * (n + 1) * (n + 2)));
    s *= -1;
    n += 2;
    if (n % 200 == 0) {
        counter.innerHTML = pi;
    }
    setTimeout(update, 0);
}
update();