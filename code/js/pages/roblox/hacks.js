
var el = x => document.getElementById(x);

function changeTab(name, button) { // very messy but works
    el("exploits").style.display = "none";
    el("viruses").style.display = "none";
    el("bypassers").style.display = "none";
    el("adblockers").style.display = "none";
    el(name).style.display = "flex";
    el("exploits_button").className = "";
    el("viruses_button").className = "";
    el("bypassers_button").className = "";
    el("adblockers_button").className = "";
    button.className = "active";
}

function toggleFilterMenu() {
    var filter = el("filter");
    if (filter.style.transform == "translate(0px, -150px)") {
        filter.style.transform = "";
    } else {
        filter.style.transform = "translate(0px, -150px)";
    }
}

var activeFilters = [];

function toggleFilter(name, button) {
    if (button.className.includes(" active")) {
        button.className = button.className.replace(" active", "");
    } else {
        button.className += " active";
    }
    if (activeFilters.includes(name)) {
        activeFilters = activeFilters.filter(item => item !== name);
    } else {
        activeFilters.push(name);
    }
    var allCards = Array.from(document.querySelector("#exploits .container").children);
    for (card of allCards) {
        if (activeFilters.length == 0) {
            card.style.display = "flex";
            continue;
        }
        var visible = false;
        for (filter of activeFilters) {
            if (card.className.includes(filter)) {
                card.style.display = "flex";
                visible = true;
                break;
            }
        }
        if (!visible) {
            card.style.display = "none";
        }
    }
}