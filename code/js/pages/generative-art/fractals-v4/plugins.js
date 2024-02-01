
// plugin thing

var _loadedPlugins = [];

function loadPluginCode(c) {
    eval(c);
}

function loadPluginUrl(u) {
    fetch(u)
        .then(response => response.text())
        .then(data => {
        loadPluginCode(data);
    });
}

function initP() {

class FRXPluginUISection {
    constructor (id, name, element) {
        this.id = id;
        this.name = name;
        this.element = element;
    }
    createCustomFractalButton(id, name) {
        var b = document.createElement("button");
        b.innerHTML = name;
        b.className = "pluginButton";
        b.setAttribute("onclick", "setFractal(\"" + id + "\");");
        this.element.appendChild(b);
        return b;
    }
    createCustomColorschemeButton(id, name) {
        var b = document.createElement("button");
        b.innerHTML = name;
        b.className = "pluginButton";
        b.setAttribute("onclick", "setColorscheme(\"" + id + "\");");
        this.element.appendChild(b);
        return b;
    }
}

class FRXPlugin {
    constructor (id, name, description) {
        this.id = id;
        this.name = name;
        this.description = description;

        _loadedPlugins.forEach(p => {
            if (p.id == id) {
                throw new Error("A plugin with id " + id + " already exists.");
            }
        });

        _loadedPlugins.push(this);
    }
    createUi() {

        var d = document.createElement("div");
        d.className = "toggleable";

        var d2 = document.createElement("div");
        d.appendChild(d2);
        d2.id = this.id + "areatoggle";
        d2.className = "collapsToggle";

        var s = document.createElement("span");
        d2.appendChild(s);
        s.className = "areaind";
        s.id = this.id + "areaind";
        s.innerHTML = "&#11206;";

        var h3 = document.createElement("h3");
        d2.appendChild(h3);
        h3.innerHTML = this.name;
        
        var d3 = document.createElement("div");
        d.appendChild(d3);
        d3.id = this.id + "area";
        d3.style.display = "block";

        var h4 = document.createElement("h4");
        d3.appendChild(h4);
        h4.innerHTML = this.description;

        var cont = document.createElement("div");
        d3.appendChild(cont);
        d3.appendChild(document.createElement("hr"));

        var sc = document.createElement("script");
        sc.innerHTML = `
var NAMEe = document.getElementById("NAMEareatoggle");
var NAMEe2 = document.getElementById("NAMEarea");
var NAMEe3 = document.getElementById("NAMEareaind");
NAMEe.addEventListener("click", ev => {
    if (NAMEe2.style.display == "none") {
        NAMEe2.style.display = "block";
        NAMEe3.innerHTML = "&#11206;";
        return;
    }
    if (NAMEe2.style.display == "block") {
        NAMEe2.style.display = "none";
        NAMEe3.innerHTML = "&#11208;";
        return;
    }
});`.replaceAll("NAME", this.id);
        d3.appendChild(sc);

        this._html = d;

        document.getElementById("pluginContainer").appendChild(d);

        return new FRXPluginUISection(this.id, this.name, cont);
    }
}

var cShaderCode = {};

cShaderCode.addCustomFractal = function (id, code, preferred_radius, description, formula) {
    __addPFractal(id, preferred_radius, description, formula, code);
};
cShaderCode.addCustomColorscheme = function (id, code, description) {
    __addPCs(id, description, code);
};

var frxp = {};
frxp.Plugin = FRXPlugin;
frxp.CustomShaderCode = cShaderCode;

return frxp;

}

const FRXPlugins = initP();

