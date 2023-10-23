function unsupported_device() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

if (unsupported_device()) {
    document.getElementById("unsupported").style.display = "block";
    
    // crash, best way to stop the rest from executing at all
    throw new Error("unsupported device detected");
}

var container = document.getElementsByClassName("container")[0];
var canvasMain = document.createElement("canvas");
var canvasJul = document.createElement("canvas");
canvasMain.id = "canvasMain";
canvasJul.id = "canvasJul";
canvasMain.className = "sticky";
canvasJul.className = "sticky";
container.prepend(canvasMain);
container.prepend(canvasJul);
canvasMain.width = 500;
canvasMain.height = 500;
canvasJul.width = 500;
canvasJul.height = 500;
canvasMain.oncontextmenu = function(e) { e.preventDefault() };
canvasJul.oncontextmenu = function(e) { e.preventDefault() };
var glmain = canvasMain.getContext("webgl2", { preserveDrawingBuffer: true });
var gljul = canvasJul.getContext("webgl2", { preserveDrawingBuffer: true });

async function loadShaders_(gl) {
    if (!gl) {
        alert("Your browser does not support WebGL. This could also be caused by rendering a too large or resource-intensive image. If that is the case, please restart your browser.");
        return null;
    }

    var vertCode;
    var fragCode;

    await fetch("../../code/gl/pages/generative-art/fractals.vert") 
        .then(response => response.text())
        .then(data => {
            vertCode = data;
        });
    await fetch("../../code/gl/pages/generative-art/fractals.frag") 
        .then(response => response.text())
        .then(data => {
            fragCode = data;
        });

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0., 0., 0., 1.);
    gl.clear(gl.COLOR_BUFFER_BIT);
    var source = vertCode;
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, source);
    gl.compileShader(vertexShader);
    var vertShaderLog = gl.getShaderInfoLog(vertexShader);
    source = fragCode;
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, source);
    gl.compileShader(fragmentShader);
    var fragShaderLog = gl.getShaderInfoLog(fragmentShader);
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert(gl.getProgramInfoLog(program));
        console.log(vertShaderLog);
        console.log(fragShaderLog);
        return null;
    }
    var vertexArray = new Float32Array([-1., -1., 1., -1., 1., 1., -1., 1.]);
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    var aVertexPosition = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(aVertexPosition);
    gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(program);
    return program;
}

var programMain = null;
var programJul = null;

async function loadShaders() { // async/await blackmagic to deal with this fuckery
    document.getElementById("statusbar").style.display = "block";
    programMain = await loadShaders_(glmain);
    programJul = await loadShaders_(gljul);
    drawMain();
    drawJul();
    document.getElementById("statusbar").style.display = "none";
}

var julia_constant = [0, 0];

function uniform(gl, program,
    canvas_dimensions,
    center,
    julia_constant,
    scale_factor,
    radius,
    juliaset,
    max_iterations,
    fractal_type,
    colorscheme,
    color_offset,
    color_method,
    main_juliaset_lerp,
    mandelbrot_power,
    post_function,
    pixelate,
    pixelate_resolution
) {
    gl.uniform2fv(gl.getUniformLocation(program, "canvas_dimensions"), canvas_dimensions);
    gl.uniform2fv(gl.getUniformLocation(program, "center"), center);
    gl.uniform2fv(gl.getUniformLocation(program, "julia_constant"), julia_constant);
    gl.uniform1f(gl.getUniformLocation(program, "scale_factor"), scale_factor);
    gl.uniform1f(gl.getUniformLocation(program, "radius"), radius);
    gl.uniform1i(gl.getUniformLocation(program, "juliaset"), juliaset);
    gl.uniform1i(gl.getUniformLocation(program, "max_iterations"), max_iterations);
    gl.uniform1i(gl.getUniformLocation(program, "fractal_type"), fractal_type);
    gl.uniform1i(gl.getUniformLocation(program, "colorscheme"), colorscheme);
    gl.uniform1f(gl.getUniformLocation(program, "color_offset"), color_offset);
    gl.uniform1i(gl.getUniformLocation(program, "color_method"), color_method);
    gl.uniform1f(gl.getUniformLocation(program, "main_juliaset_lerp"), main_juliaset_lerp);
    gl.uniform1f(gl.getUniformLocation(program, "mandelbrot_power"), mandelbrot_power);
    gl.uniform1i(gl.getUniformLocation(program, "post_function"), post_function);
    gl.uniform1i(gl.getUniformLocation(program, "pixelate"), pixelate);
    gl.uniform1i(gl.getUniformLocation(program, "pixelate_resolution"), pixelate_resolution);
}

var radius = 2000000;
var max_iterations = 200;
var fractal_type = 0;
var color_method = 1;
var colorscheme = 5;
var color_offset = 0;
var main_jul_lerp = 1;
var mandelbrot_power = 2;
var power_slider_float = 0;
var fractal_post_function = 0;
var pixelate = 0;
var pixelate_resolution = 1;

var presets_colormethods = {
    "terraced": {
        "id": 0,
        "description": "\"Mathematically accurate\" coloring method. Not smoothed, colored based on how long it takes for z to escape to infinity."
    },
    "smooth": {
        "id": 1,
        "description": "Smooth coloring."
    },
    "interior": {
        "id": 2,
        "description": "Interior coloring."
    },
    "rings": {
        "id": 3,
        "description": "Rings around the fractal. A lower radius makes it look better sometimes. Aim for around 20000."
    },
    "stripes": {
        "id": 4,
        "description": "Really cool stripes pattern."
    },
    "accurate": {
        "id": 5,
        "description": "Pixels are either black (part of the set) or not (not a part of the set)."
    },
    "smooth stripes": {
        "id": 6,
        "description": "Like stripes, just a lot smoother."
    },
    "edgy": {
        "id": 7,
        "description": "Another stripes variant, has a lot of edges."
    },
    "floor": {
        "id": 8,
        "description": "Yet *another* stripes variant, but this ones my favourite, it looks really cool."
    },
    "squared": {
        "id": 9,
        "description": "Another stripes variant. "
    },
    "stripier stripes": {
        "id": 10,
        "description": "Just another stripes variant. More colorful."
    },
    "transparent background": {
        "id": 11,
        "description": "A transparent background, if you want to have your own image in the background."
    },
    "transparent set": {
        "id": 12,
        "description": "A transparent set, if you want to have your own image inside the set."
    }
};

var presets_colormaps = {
    "classic": {
        "id": 0,
        "description": "The \"Classic\" colormap. Easily calculated with a bit of math magic."
    },
    "ultra fractal": {
        "id": 1,
        "description": "The default colormap in ultra fractal."
    },
    "red and blue": {
        "id": 2,
        "description": "Red and blue. As the name says."
    },
    "sand": {
        "id": 3,
        "description": "Sand colormap. Colors remind of sand and water related things."
    },
    "rainbow": {
        "id": 4,
        "description": "Basically a HSV colormap. Just rainbows."
    },
    "davids": {
        "id": 5,
        "description": "My own colorscheme. Really like it. Sorry, if the smoothing doesn't look too good."
    }
};

var presets_functions = {
    "none": {
        "id": 0,
        "radius": null
    },
    "sin": {
        "id": 1,
        "radius": 10
    },
    "sinh": {
        "id": 2,
        "radius": 10
    },
    "cos": {
        "id": 3,
        "radius": 10
    },
    "cosh": {
        "id": 4,
        "radius": 10
    },
    "tan": {
        "id": 5,
        "radius": 10
    },
    "tanh": {
        "id": 6,
        "radius": 10
    },
    "log": {
        "id": 7,
        "radius": 10
    },
    "sqrt": {
        "id": 8,
        "radius": 10
    },
    "abs": {
        "id": 9,
        "radius": 10
    }
}

var presets_fractals = {
    "mandelbrot": {
        "id": 0,
        "radius": 10000000,
        "formula": "z<sub>n+1</sub> = FSz<sub>n</sub><sup>POWER</sup>FE + c",
        "description": "The standard Mandelbrot set."
    },
    "burning ship": {
        "id": 1,
        "radius": 10000000,
        "formula": "z<sub>n+1</sub> = FS(Re(z<sub>n</sub>) + i*abs(Im(z<sub>n</sub>)))<sup>POWER</sup>FE + c",
        "description": "A variation of the Mandelbrot set. Got its name because of the tiny burning ship on the left."
    },
    "celtic": {
        "id": 2,
        "radius": 10000000,
        "formula": "z<sub>n+1</sub> = FS(abs(Re(z<sub>n</sub>)) + i*Im(z<sub>n</sub>))<sup>POWER</sup>FE + c",
        "description": "Another variation of the Mandelbrot set. Kind of looks like a fish."
    },
    "buffalo": {
        "id": 3,
        "radius": 10000000,
        "formula": "z<sub>n+1</sub> = FS(abs(Re(z<sub>n</sub>)) + i*abs(Im(z<sub>n</sub>)))<sup>POWER</sup>FE + c",
        "description": "Yet another Mandelbrot variation. The reason for its name should be obvious."
    },
    "tricorn": {
        "id": 4,
        "radius": 10000000,
        "formula": "z<sub>n+1</sub> = FS(Re(z<sub>n</sub>) + i*-Im(z<sub>n</sub>))<sup>POWER</sup>FE + c",
        "description": "ANOTHER Mandelbrot variation. Also called the Mandelbar sometimes."
    },
    "duck": {
        "id": 5,
        "radius": 10000000,
        "formula": "r = magnitude(z)<sup>POWER</sup><br>theta = POWER * abs(atan(z<sub>n+1</sub>))<br>z<sub>n+1</sub> = FSr * (cos(theta) + i*sin(theta))FE + c",
        "description": "Another Mandlebrot variation. Looks like a duck. Apparently also called the perpendicular burning ship. Formula is mostly just the polar coordinate formula for getting the N-th power of z, it has to be modified for the duck."
    },
    "ass": {
        "id": 6,
        "radius": 10000000,
        "formula": "z<sub>n+1</sub> = FS(Re(z<sub>n</sub>)<sup>3</sup> - Im(z<sub>n</sub>)<sup>2</sup> * abs(Re(z<sub>n</sub>)) + i*(2 * Re(z<sub>n</sub>) * Im(z<sub>n</sub>)))FE + c",
        "description": "Kind of looks like- well, ..., whatever."
    },
    "sine": {
        "id": 7,
        "radius": 50,
        "formula": "z<sub>n+1</sub> = FSc + sin(z<sub>n</sub>)<sup>POWER</sup>FE",
        "description": "Infinitely repeating to the left and right. Interesting, isn't it?"
    },
    "popcorn": {
        "id": 8,
        "radius": 2,
        "formula": "z<sub>n+1</sub> = FS(Re(z<sub>n</sub>) - Re(c) * (Im(z<sub>n</sub>) + tan(3 * Im(z<sub>n</sub>))), Im(z<sub>n</sub>)) - Im(c) * (Re(z<sub>n</sub>) + tan(3 * Re(z<sub>n</sub>)))FE",
        "description": "I have no idea who named this one the \"Popcorn\" fractal. Maybe the creators name was Popcorn? Also, it generates really cool patterns."
    },
    "thorn": {
        "id": 9,
        "radius": 10000000,
        "formula": "z<sub>n+1</sub> = FS(Re(z<sub>n</sub>) / cos(Im(z<sub>n</sub>)), Im(z<sub>n</sub>) / sin(Re(z<sub>n</sub>)))FE + c",
        "description": "Not the usual kind of fractal, yet still very interesting."
    },
    "henon": {
        "id": 10,
        "radius": 20000,
        "formula": "z<sub>n+1</sub> = FS(1 - Re(c) * Re(z<sub>n</sub>) * Re(z<sub>n</sub>) + Im(z<sub>n</sub>) + i*(Im(c) * Re(z<sub>n</sub>)))FE",
        "description": "Henon map."
    },
    "duffing": {
        "id": 11,
        "radius": 200,
        "formula": "z<sub>n+1</sub> = FS(Im(z<sub>n</sub>) + i*(-1 * Im(c) * Re(z<sub>n</sub>) + Re(c) * Im(z<sub>n</sub>) - Im(z<sub>n</sub>)<sup>3</sup>))FE",
        "description": "Duffing map."
    },
    "chirikov": {
        "id": 12,
        "radius": 100, 
        "formula": "z<sub>n+1</sub> = FS(Re(z<sub>n</sub>) + Re(c) * Im(z<sub>n</sub>) + i*(Im(c) + Im(c) * sin(Re(z<sub>n</sub>))FE",
        "description": "Chirikov map."
    },
    "ikeda": {
        "id": 13,
        "radius": 20000,
        "formula": "t = 0.4 - 6 / (1 + Re(z<sub>n</sub>)<sup>2</sup> + Im(z<sub>n</sub>)<sup>2</sup>)<br>z<sub>n+1</sub> = FS(1 + Re(c) * (Re(z<sub>n</sub>) * cos(t) - Im(z<sub>n</sub>) * sin(t)) + i*(Im(c) * (Re(z<sub>n</sub>) * sin(t) + Im(z<sub>n</sub>) * cos(t))))FE",
        "description": "Ikeda map. Beast of a formula."
    },
    "feather": {
        "id": 14,
        "radius": 50, 
        "formula": "z<sub>n+1</sub> = FSz<sub>n</sub><sup>3</sup>/(1 + Re(z<sub>n</sub>)<sup>2</sup> + Im(z<sub>n</sub>)<sup>2</sup>)FE + c",
        "description": "Really cool looking fractal. Looks like a feather."
    },
    "heart": {
        "id": 15,
        "radius": 10000000,
        "formula": "z<sub>n+1</sub> = FS(2 * Re(z<sub>n</sub>) * Im(z<sub>n</sub>) + i*(abs(Im(z<sub>n</sub>)) - abs(Re(z<sub>n</sub>))))FE + c",
        "description": "I wonder where this one got its name from."
    },
    "ass 2": {
        "id": 16,
        "radius": 10000000,
        "formula": "z<sub>n+1</sub> = FS(sinh(Re(z<sub>n</sub>)) * sin(Im(z<sub>n</sub>)) + i*(cosh(Im(z<sub>n</sub>)) * cos(Re(z<sub>n</sub>))))FE + c",
        "description": "Looks just a little bit like sunglasses."
    },
    "triangle": {
        "id": 17,
        "radius": 10000000,
        "formula": "z<sub>n+1</sub> = FS(sin(Re(z<sub>n</sub>)) * sinh(Im(z<sub>n</sub>)) + i*(cos(Im(z<sub>n</sub>)) * cosh(Re(z<sub>n</sub>))))FE + c",
        "description": "Literally just a triangle."
    },
    "shark fin": {
        "id": 18,
        "radius": 10000000,
        "formula": "z<sub>n+1</sub> = FS(Re(z<sub>n</sub>)<sup>2</sup> - abs(Im(z<sub>n</sub>)) * Im(z<sub>n</sub>)) + i*(2 * Re(z<sub>n</sub>) * Im(z<sub>n</sub>))FE + c",
        "description": "Could also be a dolphin. Actually, not really."
    },
    "tippets": {
        "id": 19,
        "radius": 10000000,
        "formula": "re = Re(z<sub>n</sub>)<sup>2</sup> - Im(z<sub>n</sub>)<sup>2</sup> + Re(c)<br>z<sub>n+1</sub> = FS(re, i*(2 * re * Im(z<sub>n</sub>) + Im(c)))FE",
        "description": "With all respect, I think, John Tippets just messed up the code for a mandelbrot set, and got this."
    },
    "zubiet": {
        "id": 20,
        "radius": 10000000,
        "formula": "z<sub>n+1</sub> = FSz<sub>n</sub><sup>POWER</sup>FE + c / z<sub>n</sub>",
        "description": "Looks really interesting. "
    },
    "sinh": {
        "id": 21,
        "radius": 70,
        "formula": "z<sub>n+1</sub> = FSc + sinh(z<sub>n</sub>)<sup>POWER</sup>FE",
        "description": "Kind of like the sine, this one is repeating infinitely vertically. Just looks a little better."
    },
    "unnamed 1": {
        "id": 22,
        "radius": 10000000,
        "formula": "z<sub>n+1</sub> = FSz<sub>n</sub><sup>POWER</sup> - (-z<sub>n</sub>)<sup>Re(c)</sup> + (Im(c) + 0i)",
        "description": "I found no good name for this. If you can think of anything, tell me."
    },
    "unnamed 2": {
        "id": 23,
        "radius": 10000000,
        "formula": "z<sub>n+1</sub> = FS(z<sub>n</sub> - (z<sub>n</sub><sup>3</sup> - 1) / (3 * z<sub>n</sub><sup>2</sup>))<sup>POWER</sup>FE + c",
        "description": "I found no name again. Creates really cool patterns. On a power of one (change with power slider) and interior coloring, seems to create a Nova/Newton fractal."
    },
    "unnamed 3": {
        "id": 24,
        "radius": 10000000,
        "formula": "z<sub>n+1</sub> = FS((z<sub>n</sub><sup>POWER</sup> + c - 1) / ((2 + 2i) * z<sub>n</sub> + c - 2))<sup>POWER</sup>FE",
        "description": "No name again, but it looks really cool."
    }
}

function update_formula() {
    for (f in presets_fractals) {
        if (presets_fractals[f]["id"] == fractal_type) {
            var func_start = "";
            var func_end = "";
            if (fractal_post_function != 0) {
                for (fn in presets_functions) {
                    if (presets_functions[fn]["id"] == fractal_post_function) {
                        func_start = fn + "(";
                        func_end = ")";
                    }
                };
            }
            document.getElementById("formula").innerHTML = presets_fractals[f]["formula"]
                .replaceAll("POWER", mandelbrot_power)
                .replace("FS", func_start)
                .replace("FE", func_end);
        }
    };
}

function update_ui() {
    document.getElementById("radius").value = radius;
    document.getElementById("iterations").value = max_iterations;
    document.getElementById("constantRe").value = julia_constant[0];
    document.getElementById("constantIm").value = julia_constant[1];
    document.getElementById("coloroffset").value = color_offset;
    document.getElementById("nji").value = main_jul_lerp;

    document.getElementById("pixelate").checked = pixelate == 1 ? true : false;
    document.getElementById("pixelateresolution").value = pixelate_resolution;

    for (f in presets_fractals) {
        if (presets_fractals[f]["id"] == fractal_type) {
            document.getElementById("description").innerHTML = presets_fractals[f]["description"]; 
        }
    }
    for (c in presets_colormaps) {
        if (presets_colormaps[c]["id"] == colorscheme) {
            document.getElementById("description_colorscheme").innerHTML = presets_colormaps[c]["description"]; 
        }
    }
    for (m in presets_colormethods) {
        if (presets_colormethods[m]["id"] == color_method) {
            document.getElementById("description_colormethod").innerHTML = presets_colormethods[m]["description"]; 
        }
    }

    if (power_slider_float == 1) {
        document.getElementById("powerfloat").value = mandelbrot_power;
        document.getElementById("powerint").value = Math.round(mandelbrot_power);
    }
    if (power_slider_float == 0) {
        document.getElementById("powerint").value = mandelbrot_power;
        document.getElementById("powerfloat").value = mandelbrot_power;
    }
}

function togglePixelation() {
    pixelate = pixelate == 0 ? 1 : 0;
    drawMain();
    drawJul();
}

function updatePixelationValue() {
    pixelate_resolution = parseInt(document.getElementById("pixelateresolution").value);
    drawMain();
    drawJul();
}

function setCanvasesSticky(sticky) {
    canvasMain.className = sticky ? "sticky" : "";
    canvasJul.className = sticky ? "sticky" : "";
}

function updateSize(size) {
    canvasMain.width = canvasMain.height = size;
    canvasJul.width = canvasJul.height = size;
    canvasMain.clientWidth = canvasMain.clientHeight = size;
    canvasJul.clientWidth = canvasJul.clientHeight = size;
    loadShaders();
    if (size > (window.innerWidth - window.innerWidth / 6) / 2 && size > window.innerHeight - window.innerHeight / 4) {
        setCanvasesSticky(false);
    } else {
        setCanvasesSticky(true);
    }
}

function update_post_function(name) {
    for (f in presets_functions) {
        if (f == name) {
            fractal_post_function = presets_functions[f]["id"];
            if (presets_functions[f]["radius"] != null) {
                radius = presets_functions[f]["radius"];
            } else {
                for (f in presets_fractals) {
                    if (presets_fractals[f]["id"] == fractal_type) {
                        radius = presets_fractals[f]["radius"];
                    }
                };
            }
        }
    };

    update_formula();
    update_ui();

    drawMain();
    drawJul();
}

function updateSettings() {
    radius = parseFloat(document.getElementById("radius").value);
    max_iterations = parseInt(document.getElementById("iterations").value);
    julia_constant[0] = parseFloat(document.getElementById("constantRe").value);
    julia_constant[1] = parseFloat(document.getElementById("constantIm").value);
    color_offset = parseFloat(document.getElementById("coloroffset").value);
    main_jul_lerp = parseFloat(document.getElementById("nji").value);
    
    drawMain();
    drawJul();
}

function updatePowerFloat() {
    power_slider_float = 1;
    mandelbrot_power = parseFloat(document.getElementById("powerfloat").value);

    update_formula();

    drawMain();
    drawJul();
}
function updatePowerInt() {
    power_slider_float = 0;
    mandelbrot_power = parseFloat(document.getElementById("powerint").value);

    update_formula();

    drawMain();
    drawJul();
}

function setFractal(type) {
    fractal_type = presets_fractals[type]["id"];
    radius = presets_fractals[type]["radius"];

    for (f in presets_functions) {
        if (presets_functions[f]["id"] == fractal_post_function) {
            fractal_post_function = presets_functions[f]["id"];
            if (presets_functions[f]["radius"] != null) {
                radius = presets_functions[f]["radius"];
            }
        }
    };
    
    update_ui();
    update_formula();

    drawMain();
    drawJul();
}

function setColormap(name) {
    colorscheme = presets_colormaps[name]["id"];

    document.getElementById("description_colorscheme").innerHTML = presets_colormaps[name]["description"];

    drawMain();
    drawJul();
}

function setColormethod(name) {
    color_method = presets_colormethods[name]["id"];

    document.getElementById("description_colormethod").innerHTML = presets_colormethods[name]["description"];

    drawMain();
    drawJul();
}

function drawMain() {
    create_url_params();
    uniform(glmain, programMain,
        [canvasMain.clientWidth, canvasMain.clientHeight],
        [center_x_main, center_y_main],
        [0, 0],
        scale_factor_main,
        radius,
        0,
        max_iterations,
        fractal_type,
        colorscheme,
        color_offset,
        color_method,
        main_jul_lerp,
        mandelbrot_power,
        fractal_post_function,
        pixelate,
        pixelate_resolution
    );

    glmain.drawArrays(glmain.TRIANGLE_FAN, 0, 4);
}

function drawJul() {
    create_url_params();
    var jc = [julia_constant[0], -julia_constant[1]];
    uniform(gljul, programJul,
        [canvasJul.clientWidth, canvasJul.clientHeight],
        [center_x_jul, center_y_jul],
        jc,
        scale_factor_jul,
        radius,
        1,
        max_iterations,
        fractal_type,
        colorscheme,
        color_offset,
        color_method,
        main_jul_lerp,
        mandelbrot_power,
        fractal_post_function,
        pixelate,
        pixelate_resolution
    );

    gljul.drawArrays(gljul.TRIANGLE_FAN, 0, 4);
}

var center_x_main = 0;
var center_y_main = 0;
var scale_factor_main = 1 / 2.5;
var mouse_x_main = 0;
var mouse_y_main = 0;
var mouse_clicked_main = false;
var mouse_clicked_right_main = false;
function updateMouseCoords_main(e) {
    mouse_x_main = (2 * (e.pageX - e.target.offsetLeft) - canvasMain.clientWidth ) / Math.min(canvasMain.clientWidth, canvasMain.clientHeight);
    mouse_y_main = (2 * (e.pageY - e.target.offsetTop ) - canvasMain.clientHeight) / Math.min(canvasMain.clientWidth, canvasMain.clientHeight);
    mouse_y_main *= -1;
    mouse_x_main = mouse_x_main / scale_factor_main + center_x_main;
    mouse_y_main = mouse_y_main / scale_factor_main + center_y_main;
}
function on_zoom_main(e) {
    e.preventDefault();
    var zoom = Math.exp(-e.deltaY / 500);
    updateMouseCoords_main(e);
    center_x_main = mouse_x_main + (center_x_main - mouse_x_main) / zoom;
    center_y_main = mouse_y_main + (center_y_main - mouse_y_main) / zoom;
    scale_factor_main *= zoom;
    drawMain();
}
function mouse_down_main(e) {
    if (e.button == 0) {
        mouse_clicked_main = true;
        updateMouseCoords_main(e);
        julia_constant[0] = mouse_x_main;
        julia_constant[1] = mouse_y_main;
        document.getElementById("constantRe").value = mouse_x_main;
        document.getElementById("constantIm").value = mouse_y_main;
        drawJul();
    }
    if (e.button == 2) {
        mouse_clicked_right_main = true;
    }
    updateMouseCoords_main(e);
}
function mouse_up_main(e) {
    if (e.button == 0) {
        mouse_clicked_main = false;
        
    }
    if (e.button == 2) {
        mouse_clicked_right_main = false;
    }
}
function mouse_move_main(e) {
    if (mouse_clicked_main) {
        updateMouseCoords_main(e);
        julia_constant[0] = mouse_x_main;
        julia_constant[1] = mouse_y_main;
        document.getElementById("constantRe").value = mouse_x_main;
        document.getElementById("constantIm").value = mouse_y_main;
        drawJul();
    }
    if (mouse_clicked_right_main) {
        var old_x = mouse_x_main;
        var old_y = mouse_y_main;
        updateMouseCoords_main(e);
        center_x_main += old_x - mouse_x_main;
        center_y_main += old_y - mouse_y_main;
        updateMouseCoords_main(e);
        drawMain();
    }
}

var center_x_jul = 0;
var center_y_jul = 0;
var scale_factor_jul = 1 / 2.5;
var mouse_x_jul = 0;
var mouse_y_jul = 0;
var mouse_moved_jul = false;
var mouse_clicked_right_jul = false;
function updateMouseCoords_jul(e) {
    mouse_x_jul = (2 * (e.pageX - e.target.offsetLeft) - canvasJul.clientWidth ) / Math.min(canvasJul.clientWidth, canvasJul.clientHeight);
    mouse_y_jul = (2 * (e.pageY - e.target.offsetTop ) - canvasJul.clientHeight) / Math.min(canvasJul.clientWidth, canvasJul.clientHeight);
    mouse_y_jul *= -1;
    mouse_x_jul = mouse_x_jul / scale_factor_jul + center_x_jul;
    mouse_y_jul = mouse_y_jul / scale_factor_jul + center_y_jul;
}
function on_zoom_jul(e) {
    e.preventDefault();
    var zoom = Math.exp(-e.deltaY / 500);
    updateMouseCoords_jul(e);
    center_x_jul = mouse_x_jul + (center_x_jul - mouse_x_jul) / zoom;
    center_y_jul = mouse_y_jul + (center_y_jul - mouse_y_jul) / zoom;
    scale_factor_jul *= zoom;
    drawJul();
}
function mouse_down_jul(e) {
    if (e.button == 2) {
        mouse_clicked_right_jul = true;
    }
    updateMouseCoords_jul(e);
}
function mouse_up_jul(e) {
    if (e.button == 2) {
        mouse_clicked_right_jul = false;
    }
}
function mouse_move_jul(e) {
    if (mouse_clicked_right_jul) {
        var old_x = mouse_x_jul;
        var old_y = mouse_y_jul;
        updateMouseCoords_jul(e);
        center_x_jul += old_x - mouse_x_jul;
        center_y_jul += old_y - mouse_y_jul;
        updateMouseCoords_jul(e);
        drawJul();
    }
}

function exportMain() {
    var canvas = document.createElement("canvas");
    canvas.width = canvasMain.width;
    canvas.height = canvasMain.height;
    canvas.getContext("2d").drawImage(canvasMain, 0, 0);
    var image = canvas.toDataURL("image/png");
    var a = document.createElement("a");
    a.href = image;
    a.download = "fractal.png";
    a.click();
    a.remove();
    canvas.remove();
}

function exportJul() {
    var canvas = document.createElement("canvas");
    canvas.width = canvasJul.width;
    canvas.height = canvasJul.height;
    canvas.getContext("2d").drawImage(canvasJul, 0, 0);
    var image = canvas.toDataURL("image/png");
    var a = document.createElement("a");
    a.href = image;
    a.download = "fractal.png";
    a.click();
    a.remove();
    canvas.remove();
}

function create_url_params() {
    var url = new URL("https://davidsaltacc.github.io/pages/generative-art/fractals");
    var params = url.searchParams;
    params.append("cxm", center_x_main);
    params.append("cym", center_y_main);
    params.append("cxj", center_x_jul);
    params.append("cyj", center_y_jul);
    params.append("cx", julia_constant[0]);
    params.append("cy", julia_constant[1]);
    params.append("scm", scale_factor_main);
    params.append("scj", scale_factor_jul);
    params.append("r", radius);
    params.append("i", max_iterations);
    params.append("cm", color_method);
    params.append("cs", colorscheme);
    params.append("co", color_offset);
    params.append("f", fractal_type);
    params.append("nji", main_jul_lerp);
    params.append("mp", mandelbrot_power);
    params.append("pf", power_slider_float);
    params.append("fpf", fractal_post_function);
    params.append("px", pixelate);
    params.append("pxr", pixelate_resolution);
    document.getElementById("url").innerText = document.getElementById("url").href = url.href;
}


function apply_url_params() {
    var params = (new URL(window.location.href)).searchParams;
    center_x_main = parseFloat(params.get("cxm") ?? center_x_main);
    center_y_main = parseFloat(params.get("cym") ?? center_y_main);
    center_x_jul = parseFloat(params.get("cxj") ?? center_x_jul);
    center_y_jul = parseFloat(params.get("cyj") ?? center_y_jul);
    julia_constant[0] = parseFloat(params.get("cx") ?? julia_constant[0]);
    julia_constant[1] = parseFloat(params.get("cy") ?? julia_constant[1]);
    scale_factor_main = parseFloat(params.get("scm") ?? scale_factor_main);
    scale_factor_jul = parseFloat(params.get("scj") ?? scale_factor_jul);
    radius = parseInt(params.get("r") ?? radius);
    max_iterations = parseInt(params.get("i") ?? max_iterations);
    color_method = parseInt(params.get("cm") ?? color_method);
    colorscheme = parseInt(params.get("cs") ?? colorscheme);
    color_offset = parseFloat(params.get("co") ?? color_offset);
    fractal_type = parseInt(params.get("f") ?? fractal_type);
    main_jul_lerp = parseFloat(params.get("nji") ?? main_jul_lerp);
    mandelbrot_power = parseFloat(params.get("mp") ?? mandelbrot_power);
    power_slider_float = parseInt(params.get("pf") ?? power_slider_float);
    fractal_post_function = parseInt(params.get("fpf") ?? fractal_post_function);
    pixelate = parseInt(params.get("px") ?? pixelate);
    pixelate_resolution = parseInt(params.get("pxr") ?? pixelate_resolution);

    update_ui()
    update_formula();
}

function contextlost() {
    alert("Your WebGL seems to have crashed. This is mainly caused, by rendering a too large or resource-intensive image. Please refresh this page (you can save your settings with the link below).");
}

canvasMain.onwheel = on_zoom_main;
canvasMain.onmousedown = mouse_down_main;
canvasMain.onmouseup = mouse_up_main;
canvasMain.onmousemove = mouse_move_main;

canvasJul.onwheel = on_zoom_jul;
canvasJul.onmousedown = mouse_down_jul;
canvasJul.onmouseup = mouse_up_jul;
canvasJul.onmousemove = mouse_move_jul;

canvasMain.addEventListener("webglcontextlost", contextlost);

document.body.onload = function() {
    apply_url_params();

    loadShaders();
}