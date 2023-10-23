const counter = document.getElementById("counter");

function update() {
    const cDate = new Date();
    const nYear = cDate.getFullYear() + 1;
    const nYearD = new Date(nYear, 0, 1, 0, 0, 0);
    const diff = parseInt((nYearD - cDate) / 1000);
    const seconds = new Intl.NumberFormat("en-US").format(diff);
    counter.innerHTML = seconds;
    setTimeout(update, 1000);
}
update();