const text = document.getElementById("text");

var n = 0;
function update() {
    for (var i = 2; i <= n; i++) {
        if (n % i == 0) {
            if (i != n) {
                break;
            }
            text.innerHTML += n + ", ";
        }
    }
    n++;
    setTimeout(update, 0);
}
update();