
async function init() {

if (!navigator.gpu) {
    if (confirm("WebGPU not supported on your browser. Go back to possibly supported WebGL version?")) {
        window.location.href = "fractals-v2";
    }
    document.getElementById("statusbar").innerHTML = "WebGPU is not supported on your browser. Please go to the <a href=\"fractals-v2\">v2 version</a> instead.";
    return;
}

const canvasMain = document.getElementById("canvasMain");
const contextMain = canvasMain.getContext("webgpu", { preserveDrawingBuffer: true });

const canvasJul = document.getElementById("canvasJul");
const contextJul = canvasJul.getContext("webgpu", { preserveDrawingBuffer: true });

function status(s) {
    console.log(s);
    document.getElementById("statusbar").innerHTML = s;
}

status("STATUS: requesting adapter");
var adapter = await navigator.gpu.requestAdapter();
status("STATUS: requesting device");
var device = await adapter.requestDevice();

device.lost.then(() => {
    alert("Lost contact to your GPU. Please reload this page, and if neccessary, restart your browser.");
});

status("STATUS: setting up uniform buffer");

const format = navigator.gpu.getPreferredCanvasFormat();
const uniformBufferSize = Math.ceil((
    + 2 * Float32Array.BYTES_PER_ELEMENT // center: vec2<f32>
    + 2 * Float32Array.BYTES_PER_ELEMENT // juliasetConstant: vec2<f32>
    + 2 * Float32Array.BYTES_PER_ELEMENT // canvasDimensions: vec2<f32>
    + Float32Array.BYTES_PER_ELEMENT // zoom: f32
    + Float32Array.BYTES_PER_ELEMENT // radius: f32
    + Float32Array.BYTES_PER_ELEMENT // power: f32
    + Float32Array.BYTES_PER_ELEMENT // colorOffset: f32
    + Float32Array.BYTES_PER_ELEMENT // juliasetInterpolation: f32
    + Float32Array.BYTES_PER_ELEMENT // colorfulness: f32
    + Uint32Array.BYTES_PER_ELEMENT // maxIterations: u32
    + Uint32Array.BYTES_PER_ELEMENT // fractalType: u32
    + Uint32Array.BYTES_PER_ELEMENT // colorscheme: u32
    + Uint32Array.BYTES_PER_ELEMENT // colorMethod: u32
    + Uint32Array.BYTES_PER_ELEMENT // postFracFunc: u32
    + Uint32Array.BYTES_PER_ELEMENT // juliaset: u32
) / 8) * 8;

const uniformBuffer = device.createBuffer({
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

status("STATUS: uniform buffer size " + uniformBufferSize + " bytes");

status("STATUS: fetching shader code");

var code = null;
await fetch("../../code/wgl/pages/generative-art/fractals-v3.wgsl") 
    .then(response => response.text())
    .then(data => {
        code = data;
    }
);

status("STATUS: creating shader module");

const shaderModule = device.createShaderModule({ code: code });

status("STATUS: creating render pipeline. if you don't want to stay, go to the <a href=\"fractals-v3-min\">v3 minified</a>, which has just a few less features, or the <a href=\"fractals-v2\">v2 version</a>.");

const pipeline = await device.createRenderPipelineAsync({
    layout: device.createPipelineLayout({ bindGroupLayouts: [
        device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: {},
                }
            ]
        })
    ]}),
    vertex: {
        module: shaderModule,
        entryPoint: "vertex",
    },
    fragment: {
        module: shaderModule,
        entryPoint: "fragment",
        targets: [{ format }],
    },
    primitive: {
        topology: "triangle-strip",
    }
});

status("STATUS: creating bind group");

const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
        {
            binding: 0,
            resource: {
                buffer: uniformBuffer
            }
        }
    ]
});

status("STATUS: configuring canvases webgpu context");

contextMain.configure({
    device,
    format,
    alphaMode: "opaque",
});
contextJul.configure({
    device,
    format,
    alphaMode: "opaque",
});

status("STATUS: initializing fractal explorer");

var centerMain = [0, 0];
var zoomMain = 1 / 2.5;
var centerJul = [0, 0];
var zoomJul = 1 / 2.5;

var maxIterations = 100;
var radius = 100000;
var power = 2;
var colorOffset = 0;
var fractalType = 0;
var colorscheme = 0;
var colorMethod = 1;
var postFracFunc = 0;
var juliasetConstant = [0., 0.];
var juliasetInterpolation = 1;
var colorfulness = 1;

function draw(context, juliaset, center, zoom) {
	const arrayBuffer = new ArrayBuffer(uniformBufferSize);
	new Float32Array(arrayBuffer, 0).set([
		center[0],
        center[1],
        juliasetConstant[0],
        juliasetConstant[1],
        canvasMain.clientWidth, 
        canvasMain.clientHeight,
        zoom,
        radius,
        power, 
        colorOffset,
        juliasetInterpolation,
        colorfulness
	]);
	new Uint32Array(arrayBuffer, 12 * Float32Array.BYTES_PER_ELEMENT).set([
        maxIterations,
        fractalType,
        colorscheme,
        colorMethod,
        postFracFunc,
        juliaset
    ]);
	device.queue.writeBuffer(uniformBuffer, 0, arrayBuffer);

	const encoder = device.createCommandEncoder();
	const renderPass = encoder.beginRenderPass({
		colorAttachments: [{
			view: context.getCurrentTexture().createView(),
			loadOp: "clear",
			clearValue: [0, 0, 0, 0],
			storeOp: "store",
		}],
	});

	renderPass.setPipeline(pipeline);
	renderPass.setBindGroup(0, bindGroup);
	renderPass.draw(4);
	renderPass.end();

	device.queue.submit([encoder.finish()]);
};

function renderMain() {
    draw(contextMain, 0, centerMain, zoomMain);
}
function renderJul() {
    draw(contextJul, 1, centerJul, zoomJul);
}

renderMain();
renderJul();

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
    "spiky": {
        "id": 11,
        "description": "Something spiky."
    },
    "stripy rings": {
        "id": 12,
        "description": "Rings, but with stripes too. "
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
    },
    "lavawaves": {
        "id": 6,
        "description": "Some colorscheme I found on the internet. Decided to put it in because I was running out of good colormaps."
    },
    "morning glory": {
        "id": 7,
        "description": "Another colorscheme I found on the internet. "
    },
    "chocolate": {
        "id": 8,
        "description": "A colorscheme I just came up with. Has this chocolate-y color to it. Apparently it changes into a rainbow and back when zooming in. Unintended. Also, this only looks good with smooth coloring. Tho it really makes most fractals look amazing."
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
    },
    "exp": {
        "id": 10,
        "radius": 100
    },
    "atan": {
        "id": 11,
        "radius": 10
    },
    "asin": {
        "id": 12,
        "radius": 10
    },
    "acos": {
        "id": 13,
        "radius": 10
    },
    "asinh": {
        "id": 14,
        "radius": 10
    },
    "acosh": {
        "id": 15,
        "radius": 10
    },
    "atanh": {
        "id": 16,
        "radius": 10
    },
    "inv": {
        "id": 17,
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
        "description": "No name again, but it looks really cool. Also, it is very big."
    },
    "fish": {
        "id": 25,
        "radius": 10000000,
        "formula": "z<sub>n+1</sub> = FSabs(Re(z<sub>n</sub>) - Im(z<sub>n</sub>)) + i*(2 * Re(z<sub>n</sub>) * Im(z<sub>n</sub>))FE + c",
        "description": "Doesn't even look like anything close to a fish."
    },
    "wavy": {
        "id": 26,
        "radius": 10000000,
        "formula": "r = 4.0 + cos(Re(z<sub>n</sub>) * pi) * 3.0 + Re(c)<br>a = 1.4 + sin(Im(z<sub>n</sub>) * pi) * 0.4 + Im(c)<br>b = 0.3 + cos((Re(z<sub>n</sub>) + Im(z<sub>n</sub>)) * pi) * 0.2 + Re(c) + Im(c)<br>x = Im(z<sub>n</sub>) + 1 - a * x^2<br>y = b * x<br>x = r * x * (1 - x)<br>z<sub>n+1</sub> = FS(x + yi)FE",
        "description": "Really complicated. Looks best with my own colormap. Looking at this formula, I am realising there is absolutely no limit to how long these descriptions can be. Lets see... Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. Is this enough? I don't know."
    },
    "collatz": {
        "id": 27,
        "radius": 20,
        "formula": "no idea TODO add",
        "description": "A fractal from the complex plane collatz conjecture, apparently."
    },
    "unnamed 4": {
        "id": 28,
        "radius": 10000000,
        "formula": "no idea TODO add",
        "description": "idk"
    },
    "septagon": {
        "id": 29,
        "radius": 10,
        "formula": "no idea TODO add",
        "description": "idk"
    },
    "unnamed 5": {
        "id": 30,
        "radius": 10000000,
        "formula": "no idea TODO add",
        "description": "idk"
    },
    "unnamed 6": {
        "id": 31,
        "radius": 1000000,
        "formula": "no idea TODO add",
        "description": "idk"
    },
    "cactus": {
        "id": 32,
        "radius": 10000000,
        "formula": "no idea TODO add",
        "description": "idk"
    },
    "unnamed 7": {
        "id": 33,
        "radius": 10,
        "formula": "no idea TODO add",
        "description": "idk"
    }
}

function updateUi() {
    
}

var setFractal = function(type) {
    fractalType = presets_fractals[type]["id"];
    radius = presets_fractals[type]["radius"];

    updateUi();

    renderMain();
    renderJul();
}

function setColormap(name) {
    colorscheme = presets_colormaps[name]["id"];

    updateUi();

    renderMain();
    renderJul();
}

function setColormethod(name) {
    colorMethod = presets_colormethods[name]["id"];

    updateUi();

    renderMain();
    renderJul();
}

function setPostFunction(name) {
    for (f in presets_functions) {
        if (f == name) {
            postFracFunc = presets_functions[f]["id"];
            if (presets_functions[f]["radius"] != null) {
                radius = presets_functions[f]["radius"];
            } else {
                for (f in presets_fractals) {
                    if (presets_fractals[f]["id"] == fractalType) {
                        radius = presets_fractals[f]["radius"];
                    }
                };
            }
        }
    };

    updateUi();

    renderMain();
    renderJul();
}

var mouse_x_main = 0;
var mouse_y_main = 0;
var mouse_clicked_main = false;
var mouse_clicked_right_main = false;
function updateMouseCoords_main(e) {
    mouse_x_main = (2 * (e.pageX - e.target.offsetLeft) - canvasMain.clientWidth ) / Math.min(canvasMain.clientWidth, canvasMain.clientHeight);
    mouse_y_main = (2 * (e.pageY - e.target.offsetTop ) - canvasMain.clientHeight) / Math.min(canvasMain.clientWidth, canvasMain.clientHeight);
    mouse_y_main *= -1;
    mouse_x_main = mouse_x_main / zoomMain + centerMain[0];
    mouse_y_main = mouse_y_main / zoomMain + centerMain[1];
}
function on_zoom_main(e) {
    e.preventDefault();
    var z = Math.exp(-e.deltaY / 500);
    updateMouseCoords_main(e);
    centerMain[0] = mouse_x_main + (centerMain[0] - mouse_x_main) / z;
    centerMain[1] = mouse_y_main + (centerMain[1] - mouse_y_main) / z;
    zoomMain *= z;
    renderMain();
}
function mouse_down_main(e) {
    if (e.button == 0) {
        mouse_clicked_main = true;
        updateMouseCoords_main(e);
        juliasetConstant[0] = mouse_x_main;
        juliasetConstant[1] = mouse_y_main;
        updateUi();
        renderJul();
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
        juliasetConstant[0] = mouse_x_main;
        juliasetConstant[1] = mouse_y_main;
        updateUi();
        renderJul();
    }
    if (mouse_clicked_right_main) {
        var old_x = mouse_x_main;
        var old_y = mouse_y_main;
        updateMouseCoords_main(e);
        centerMain[0] += old_x - mouse_x_main;
        centerMain[1] += old_y - mouse_y_main;
        updateMouseCoords_main(e);
        renderMain();
    }
}

var mouse_x_jul = 0;
var mouse_y_jul = 0;
var mouse_clicked_right_jul = false;
function updateMouseCoords_jul(e) {
    mouse_x_jul = (2 * (e.pageX - e.target.offsetLeft) - canvasJul.clientWidth ) / Math.min(canvasJul.clientWidth, canvasJul.clientHeight);
    mouse_y_jul = (2 * (e.pageY - e.target.offsetTop ) - canvasJul.clientHeight) / Math.min(canvasJul.clientWidth, canvasJul.clientHeight);
    mouse_y_jul *= -1;
    mouse_x_jul = mouse_x_jul / zoomJul + centerJul[0];
    mouse_y_jul = mouse_y_jul / zoomJul + centerJul[1];
}
function on_zoom_jul(e) {
    e.preventDefault();
    var z = Math.exp(-e.deltaY / 500);
    updateMouseCoords_jul(e);
    centerJul[0] = mouse_x_jul + (centerJul[0] - mouse_x_jul) / z;
    centerJul[1] = mouse_y_jul + (centerJul[1] - mouse_y_jul) / z;
    zoomJul *= z;
    renderJul();
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
        centerJul[0] += old_x - mouse_x_jul;
        centerJul[1] += old_y - mouse_y_jul;
        updateMouseCoords_jul(e);
        renderJul();
    }
}

canvasMain.onwheel = on_zoom_main;
canvasMain.onmousedown = mouse_down_main;
canvasMain.onmouseup = mouse_up_main;
canvasMain.onmousemove = mouse_move_main;

canvasJul.onwheel = on_zoom_jul;
canvasJul.onmousedown = mouse_down_jul;
canvasJul.onmouseup = mouse_up_jul;
canvasJul.onmousemove = mouse_move_jul;

canvasMain.oncontextmenu = function(e) { e.preventDefault() };
canvasJul.oncontextmenu = function(e) { e.preventDefault() };

function setCanvasesSticky(sticky) {
    canvasMain.className = sticky ? "sticky" : "";
    canvasJul.className = sticky ? "sticky" : "";
}

setCanvasesSticky(true);

function exportMain() {
    renderMain();
    var data = canvasMain.toDataURL("image/png");
    var a = document.createElement("a");
    a.href = data;
    a.download = "fractal.png";
    a.click();
    a.remove();
}
function exportJul() {
    renderJul();
    var data = canvasJul.toDataURL("image/png");
    var a = document.createElement("a");
    a.href = data;
    a.download = "fractal.png";
    a.click();
    a.remove();
}

function setRadius(rad) { radius = rad; renderMain(); renderJul(); }
function setIterations(i) { maxIterations = i; renderMain(); renderJul(); }
function setColoroffset(o) { colorOffset = o; renderMain(); renderJul(); }
function setConstantX(x) { juliasetConstant[0] = x; renderJul(); }
function setConstantY(y) { juliasetConstant[1] = y; renderJul(); }
function setInterpolation(v) { juliasetInterpolation = v; renderJul(); }
function setColorfulness(c) { colorfulness = c; renderMain(); renderJul(); }

function setCanvasSize(size) {
    canvasMain.width = canvasMain.height = size;
    canvasJul.width = canvasJul.height = size;
    canvasMain.clientWidth = canvasMain.clientHeight = size;
    canvasJul.clientWidth = canvasJul.clientHeight = size;
    if (size > (window.innerWidth - window.innerWidth / 6) / 2 && size > window.innerHeight - window.innerHeight / 4) {
        setCanvasesSticky(false);
    } else {
        setCanvasesSticky(true);
    }
    
    renderMain();
    renderJul();
}

return [renderMain, renderJul, setFractal, setColormap, setColormethod, setColoroffset, setCanvasesSticky,
        setRadius, setIterations, setConstantX, setConstantY, setInterpolation, setPostFunction,
        exportMain, exportJul, setCanvasSize, setColorfulness];
}

var renderMain;
var renderJul;
var setFractal;
var setColormap;
var setColormethod;
var setColoroffset;
var setCanvasesSticky;
var setRadius;
var setIterations;
var setConstantX;
var setConstantY;
var setInterpolation;
var setPostFunction;
var exportMain;
var exportJul;
var setCanvasSize; 
var setColorfulness; // i hate this with all of my heart
(async () => { return await init(); })().then(([renderMain2, renderJul2, setFractal2, setColormap2, setColormethod2, setColoroffset2, setCanvasesSticky2,
                                                setRadius2, setIterations2, setConstantX2, setConstantY2, setInterpolation2, setPostFunction2,
                                                exportMain2, exportJul2, setCanvasSize2, setColorfulness2]) => {
    renderMain = renderMain2;
    renderJul = renderJul2;
    setFractal = setFractal2;
    setColormap = setColormap2;
    setColormethod = setColormethod2;
    setColoroffset = setColoroffset2;
    setCanvasesSticky = setCanvasesSticky2;
    setRadius = setRadius2;
    setIterations = setIterations2;
    setConstantX = setConstantX2;
    setConstantY = setConstantY2;
    setInterpolation = setInterpolation2;
    setPostFunction = setPostFunction2;
    exportMain = exportMain2;
    exportJul = exportJul2;
    setCanvasSize = setCanvasSize2;
    setColorfulness = setColorfulness2;

    document.getElementById("loadingscreen").style.display = "none";

    console.log("finished");
});

