const counter = document.getElementById("counter");

var k = 1;
var pi = 0;
var i = 0;
function update() {
    if (i % 2 == 0) {
        pi += 4 / k;
    } else {
        pi -= 4 / k;
    }
    k += 2;
    i += 1;
    if (i % 100 == 0) {
        counter.innerHTML = pi;
    }
    setTimeout(update, 0);
}
update();