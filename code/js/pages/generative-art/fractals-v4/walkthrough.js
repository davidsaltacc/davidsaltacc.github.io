
function confirmWalkthrough() {

    var div = document.createElement("div");
    div.className = "walkthroughConfirm";

    var p = document.createElement("p");
    p.innerHTML = "<strong>If you don't know what to do, you can start a walkthrough that will guide you. </strong>";
    div.appendChild(p);
    div.appendChild(document.createElement("br"));

    var acceptB = document.createElement("button");
    var denyB = document.createElement("button");
    acceptB.innerHTML = "Start Walkthrough";
    denyB.innerHTML = "Close";

    div.appendChild(acceptB);
    div.appendChild(denyB);

    document.body.appendChild(div);

    return {
        onInteracted: function(callback) { 
            function accepted() { callback(true); div.remove(); }
            function denied() { callback(false); div.remove(); }
            acceptB.onclick = accepted;
            denyB.onclick = denied;
        }
    };
}

function createSimpleDialog(text) {

    var div = document.createElement("div");
    div.className = "walkthroughDialog";
    
    var p = document.createElement("p");
    p.innerHTML = "<strong>" + text + "</strong>";
    div.appendChild(p);
    div.appendChild(document.createElement("br"));

    var acceptB = document.createElement("button");
    var denyB = document.createElement("button");
    acceptB.innerHTML = "Ok";
    denyB.innerHTML = "Cancel";

    div.appendChild(acceptB);
    div.appendChild(denyB);
    document.body.appendChild(div);

    return {
        onConfirmed: function(callback) { 
            function accepted() { div.remove(); callback(); }
            function denied() { div.remove(); document.getElementById("walkthroughDarken").style.display = "none"; }
            acceptB.onclick = accepted;
            denyB.onclick = denied;
        }
    };
}

function focusEl(id) {
    window.scrollTo({
        left: 0,
        top: 0,
        behavior: "instant"
    });
    var rect = document.getElementById(id).getClientRects()[0];
    window.scrollTo({
        left: 0,
        top: Math.floor(rect.top - window.innerHeight / 2),
        behavior: "smooth"
    });
    document.getElementById(id).className += " hl";
}

function unfocusEl(id) {
    document.getElementById(id).className = document.getElementById(id).className.replace(" hl", "");
}

function startWalkthrough() {
    resetSettings();
    document.getElementById("walkthroughDarken").style.display = "block";

    focusEl("whatarefractalsContainer");

    createSimpleDialog("If you don't know what fractals are at all, here are some useful links.").onConfirmed(() => {

        unfocusEl("whatarefractalsContainer");

        createSimpleDialog("Now you hopefully understand what fractals are. Lets start exploring them!").onConfirmed(() => {

            focusEl("canvasContainer");

            createSimpleDialog("Here you have the canvases the fractals are being rendered in.").onConfirmed(() => {
                
                unfocusEl("canvasContainer");
                focusEl("canvasMain");

                createSimpleDialog("Here is the main canvas. At the moment it shows the mandelbrot set.").onConfirmed(() => {

                    unfocusEl("canvasMain");
                    focusEl("canvasJul");

                    createSimpleDialog("Here, next to is is the juliaset canvas. If you know fractals, you should also know what juliasets are.").onConfirmed(() => {

                        unfocusEl("canvasJul");
                        focusEl("canvasContainer");

                        createSimpleDialog("You can use your scroll wheel to zoom in and out, and you can hold right click to move your view around. Play around with it for a little!").onConfirmed(() => {

                            focusEl("settingsReset");

                            createSimpleDialog("Just make sure that you don't zoom out too far and get lost. In that case, you can just reset the settings.").onConfirmed(() => {

                                createSimpleDialog("Now, your first task is: In the needle (left side) of the mandelbrot set, you will find another mandelbrot set. Zoom in on that.").onConfirmed(() => {

                                });
                            });
                        });
                    });
                });
            });
        });
    });
}