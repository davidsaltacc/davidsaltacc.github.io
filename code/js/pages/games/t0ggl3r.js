
var params = new URL(window.location.href).searchParams;

var l = window.location.href.indexOf("?");
var u = l == -1 ? window.location.href : window.location.href.slice(0, l);
window.history.pushState({}, "T0ggl3r", u);

document.getElementById("container").innerHTML = '<label class="switch"><input type="checkbox"><span class="slider"></span></label>\n'.repeat(parseInt(params.get("c") ?? 20));

var all = document.getElementsByClassName("switch");

var allLen = all.length;

var count = 0;

var counter = document.getElementById("count");
var title = document.getElementById("title");

function updCount() {
    counter.innerHTML = count + "/" + allLen;
    if (count == allLen) {
        title.innerHTML = "Well done!";
        title.className = "green";
    }
}

for (s of all) {
    s.childNodes.forEach(i => {
        if (i.tagName == "INPUT") {
            if (Math.random() < 0.15) {
                i.checked = true;
                count += 1;
            }
            i.onchange = function() {
                if (i.checked) {
                    count += 1;
                    for (var j = 0; j < Math.random() * (allLen / 40); j++) {
                        all.item(Math.floor(Math.random() * allLen)).childNodes.forEach(i2 => {
                            if (i2.tagName == "INPUT" && i2.checked && i2 != i && Math.random() < (count + allLen / 15) / (allLen)) {
                                i2.checked = false;
                                count -= 1;
                            }
                        });
                    }
                    updCount();
                } else {
                    count -= 1;
                    updCount();
                }
            }
        }
    });
    updCount();
}

function url(c) {
    var l = window.location.href.indexOf("?");
    var u = l == -1 ? window.location.href : window.location.href.slice(0, l);
    var url = new URL(u); 
    var params = url.searchParams;
    params.append("c", c);
    return url.href;
}

function lv(c) {
    window.location.href = url(c);
}