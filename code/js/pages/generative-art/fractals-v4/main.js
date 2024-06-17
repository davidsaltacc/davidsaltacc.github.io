if (window.location.href.startsWith("http://127.0.0.1")) { // :P
    document.getElementById("sb").style.display = "none";
}

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
status("STATUS: requesting GPU device. if this takes more than a few seconds, something probably went terribly wrong. your computer might exploder. to fix this issue, simply restart your browser. UNLESS you use a browser that doesn't support webgpu. 'The chrome://flags/#enable-unsafe-webgpu flag must be enabled. Linux experimental support also requires launching the browser with --enable-features=Vulkan.'");
var device = await adapter.requestDevice();

device.lost.then(() => {

    // update GPU to fix screen clearing issues on both canvases
    renderMain();
    renderJul();

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
    + Float32Array.BYTES_PER_ELEMENT // cloudSeed: f32
    + Float32Array.BYTES_PER_ELEMENT // cloudAmplitude: f32
    + Float32Array.BYTES_PER_ELEMENT // cloudMultiplier: f32
    + Uint32Array.BYTES_PER_ELEMENT // maxIterations: u32
    + Uint32Array.BYTES_PER_ELEMENT // sampleCount: u32
    + Uint32Array.BYTES_PER_ELEMENT // juliaset: u32
) / 8) * 8;

const uniformBuffer = device.createBuffer({
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

status("STATUS: uniform buffer size " + uniformBufferSize + " bytes");

var pipeline;
var bindGroup;

async function fetchSubCode(name, type, customCode) {
    if (customCode) {
        return customCode;
    }
    var code = null;
    await fetch("../../code/wgl/pages/generative-art/fractals-v4/" + type + "/" + name + ".wgsl") 
        .then(response => response.text())
        .then(data => {
            code = data;
        }
    );
    return code;
}

async function loadImage(url) {
    var img = new Image();
    img.src = url;
    await img.decode();

    var canv = document.createElement("canvas");
    canv.width = img.width;
    canv.height = img.height;

    var ctx = canv.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var data = ctx.getImageData(0, 0, img.width, img.height);
    canv.remove();
    return {
        data: data.data,
        width: img.width, 
        height: img.height
    };
}

function createOrbitTrapTexture(width, height) {
    var texture = device.createTexture({
        size: [width, height, 1],
        format: "rgba8unorm",
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
    });
    return texture;
}

function createOrbitTrapTextureSampler() {
    return device.createSampler({
        magFilter: "nearest",
        minFilter: "nearest"
    });
}

var orbitTrapTextureSourceImage;
var orbitTrapTexture;
var orbitTrapTextureSampler;

async function compileShaderCode_(cmethod, cscheme, fractal, postf) {
    var code = null;
    await fetch("../../code/wgl/pages/generative-art/fractals-v4/main.wgsl") 
        .then(response => response.text())
        .then(data => {
            code = data;
        }
    );

    orbitTrapTextureSourceImage = await loadImage("/assets/cat.png");
    orbitTrapTexture = createOrbitTrapTexture(orbitTrapTextureSourceImage.width, orbitTrapTextureSourceImage.height);
    orbitTrapTextureSampler = createOrbitTrapTextureSampler();

    code = code.replace("///POST_FUNC", postf);
    code = code.replace("///ITER_FUNC", fractal);
    code = code.replace("///COLORSCHEME", cscheme);
    code = code.replace("///COLORING_METHOD", cmethod);

    const cshaderModule = device.createShaderModule({ code: code });
    var cpipeline;

    try {

        cpipeline = await device.createRenderPipelineAsync({
            layout: device.createPipelineLayout({
                bindGroupLayouts: [ device.createBindGroupLayout({
                    entries: [
                        {
                            binding: 0,
                            visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                            buffer: {},
                        },
                        {
                            binding: 1,
                            visibility: GPUShaderStage.FRAGMENT,
                            texture: {},
                        },
                        {
                            binding: 2,
                            visibility: GPUShaderStage.FRAGMENT,
                            sampler: {},
                        },
                    ],
                }) ]
            }),
            vertex: {
                module: cshaderModule,
                entryPoint: "vertex",
            },
            fragment: {
                module: cshaderModule,
                entryPoint: "fragment",
                targets: [{ format: format }],
            },
            primitive: {
                topology: "triangle-strip",
            }
        });
        
    } catch (e) {
        var messages = (await cshaderModule.getCompilationInfo()).messages;
        var errormsg = "";
        errormsg += "Error compiling shader:";
        messages.forEach(m => {
            errormsg += "\n\n:" + m.lineNum + ":" + m.linePos + " error: " + m.message;
            errormsg += "\n...\n";
            errormsg += "line " + (m.lineNum - 1) + ": " + code.split("\n")[m.lineNum - 2] + "\n";
            errormsg += "line " + m.lineNum + ": " + code.split("\n")[m.lineNum - 1] + "\n";
            errormsg += "line " + (m.lineNum + 1) + ": " + code.split("\n")[m.lineNum] + "\n";
            errormsg += "\n...";
        });
        console.log(errormsg);
        return errormsg;
    }

    const cbindGroup = device.createBindGroup({
        layout: cpipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: uniformBuffer
                }
            },
            {
                binding: 1,
                resource: orbitTrapTexture.createView()
            },
            {
                binding: 2,
                resource: orbitTrapTextureSampler
            }
        ]
    });
    contextMain.configure({
        device,
        format
    });
    contextJul.configure({
        device,
        format
    });
    pipeline = cpipeline;
    bindGroup = cbindGroup; 

    console.log("done");

    return "success";
}

var customFractal = false;
var customCs = false;

var pluginFractal = null;
var pluginCs = null;

async function compileShaderCode(cmethod, cscheme, fractal, postf) {

    showLoadingWave();

    var result = await compileShaderCode_(
        await fetchSubCode(cmethod, "colormethods"),
        customCs ? document.getElementById("cscodei").value : await fetchSubCode(cscheme, "colorschemes", pluginCs),
        customFractal ? document.getElementById("fcodei").value : await fetchSubCode(fractal, "fractals", pluginFractal),
        await fetchSubCode(postf, "post_functions")
    );

    hideLoadingWave();

    return result;
}

status("STATUS: initializing fractal explorer");

var centerMain = [0, 0];
var zoomMain = 1 / 2.5;
var centerJul = [0, 0];
var zoomJul = 1 / 2.5;

var maxIterations = 100;
var radius = 100000;
var power = 2;
var colorOffset = 0;
var fractalType = "mandelbrot";
var colorscheme = "classic";
var colorMethod = "smooth";
var postFracFunc = "none";
var juliasetConstant = [0., 0.];
var juliasetInterpolation = 1;
var colorfulness = 1;
var sampleCount = 1;
var cloudSeed = 33333;
var cloudAmplitude = 0;
var cloudMultiplier = 0.8;

await compileShaderCode(colorMethod, colorscheme, fractalType, postFracFunc);

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
        colorfulness,
        cloudSeed,
        cloudAmplitude,
        cloudMultiplier
	]);
	new Uint32Array(arrayBuffer, 15 * Float32Array.BYTES_PER_ELEMENT).set([
        maxIterations,
        sampleCount,
        juliaset
    ]);
	device.queue.writeBuffer(uniformBuffer, 0, arrayBuffer);
    device.queue.writeTexture(
        { texture: orbitTrapTexture },
        orbitTrapTextureSourceImage.data,
        {
            bytesPerRow: orbitTrapTextureSourceImage.width * 4,
            rowsPerImage: orbitTrapTextureSourceImage.height
        },
        { width: orbitTrapTextureSourceImage.width, height: orbitTrapTextureSourceImage.height }
    );

	const encoder = device.createCommandEncoder();
	const renderPass = encoder.beginRenderPass({
		colorAttachments: [{
			view: context.getCurrentTexture().createView(),
			loadOp: "clear",
			clearValue: [0, 0, 0, 1],
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
        "description": "Rings around the fractal."
    },
    "stripes": {
        "id": 4,
        "description": "Really cool stripes pattern."
    },
    "accurate": {
        "id": 5,
        "description": "Pixels are either black (part of the set) or not (not a part of the set)."
    },
    "smooth_stripes": {
        "id": 6,
        "description": "Like stripes, just a lot smoother."
    },
    "edgy": {
        "id": 7,
        "description": "Another stripes variant, has a lot of edges."
    },
    "floor": {
        "id": 8,
        "description": "Yet <i>another</i> stripes variant."
    },
    "squared": {
        "id": 9,
        "description": "Another stripes variant. "
    },
    "stripier_stripes": {
        "id": 10,
        "description": "Just another stripes variant. More colorful."
    },
    "spiky": {
        "id": 11,
        "description": "Something spiky."
    },
    "stripy_rings": {
        "id": 12,
        "description": "Rings, but with stripes too. "
    },
    "interior_2": {
        "id": 13,
        "description": "Another interior coloring method, a little different that the first one."
    },
    "interior_stripes": {
        "id": 14,
        "description": "Stripes, but on the interior. A little messy, only looks really good on the juliasets."
    },
    "pickover_stalk": {
        "id": 15,
        "description": "Another attempt at orbit traps. Looks quite nice, actually. Even when I don't understand half of it. Has a lot of lines, so maybe put a higher sample count."
    }
};

var presets_colorschemes = {
    "classic": {
        "id": 0,
        "description": "The \"Classic\" colormap. Easily calculated with a bit of math magic."
    },
    "ultrafractal": {
        "id": 1,
        "description": "The default colormap in ultra fractal."
    },
    "red_blue": {
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
    "lava_waves": {
        "id": 6,
        "description": "Some colorscheme I found on the internet. Decided to put it in because I was running out of good colormaps."
    },
    "morning_glory": {
        "id": 7,
        "description": "Another colorscheme I found on the internet. "
    },
    "chocolate": {
        "id": 8,
        "description": "A colorscheme I just came up with. Has this chocolate-y color to it. Changes into a rainbow and back when zooming in. Unintended. "
    },
    "contrasted_classic": {
        "id": 9,
        "description": "The classic colorscheme, but more contrasted."
    },
    "black_white": {
        "id": 10,
        "description": "Black and white colorscheme. Looks cool."
    },
    "twilight": {
        "id": 11,
        "description": "Twilight colormap from matplotlib."
    },
    "red": {
        "id": 12,
        "description": "Red."
    },
    "green": {
        "id": 13,
        "description": "Green."
    },
    "blue": {
        "id": 14,
        "description": "Blue."
    },
    "cold": {
        "id": 15,
        "description": "Only cold colors."
    },
    "winter": {
        "id": 16,
        "description": "Snowy and icy. I like it"
    },
    "glow": {
        "id": 17,
        "description": "Doesn't sound like the best of names for this"
    }
};

var presets_functions = {
    "none": {
        "id": 0,
        "radius": null,
        "description": "You have no fractal modifier selected. What are you expecting to see here?"
    },
    "sin": {
        "id": 1,
        "radius": 10,
        "description": "Complex sine."
    },
    "sinh": {
        "id": 2,
        "radius": 10,
        "description": "Complex hyperbolic sine."
    },
    "cos": {
        "id": 3,
        "radius": 10,
        "description": "Complex cosine."
    },
    "cosh": {
        "id": 4,
        "radius": 10,
        "description": "Complex hyperbolic cosine."
    },
    "tan": {
        "id": 5,
        "radius": 10,
        "description": "Complex tangent. Looks noisy. Maybe you want to set a higher sample count."
    },
    "tanh": {
        "id": 6,
        "radius": 10,
        "description": "Complex hyperbolic tangent."
    },
    "log": {
        "id": 7,
        "radius": 10,
        "description": "Complex logarithm. I would enable interior coloring."
    },
    "sqrt": {
        "id": 8,
        "radius": 10,
        "description": "Complex square root. Mandelbrot looks boring with this one."
    },
    "abs": {
        "id": 9,
        "radius": 10,
        "description": "Takes the absolute of both sides. An actual absolute of a complex number would return a single non-complex value."
    },
    "exp": {
        "id": 10,
        "radius": 100,
        "description": "Complex exponential function."
    },
    "atan": {
        "id": 11,
        "radius": 10,
        "description": "Complex arctangent. Enable interior coloring."
    },
    "asin": {
        "id": 12,
        "radius": 10,
        "description": "Complex arcsine. Enable interior coloring. With higher powers, this can create interesting effects."
    },
    "acos": {
        "id": 13,
        "radius": 10,
        "description": "Complex arccosine. Enable interior coloring. With higher powers, this can create interesting effects."
    },
    "asinh": {
        "id": 14,
        "radius": 10,
        "description": "Complex hyperbolic arcsine. Enable interior coloring. With higher powers, this can create interesting effects."
    },
    "acosh": {
        "id": 15,
        "radius": 10,
        "description": "Complex hyperbolic arccosine. Enable interior coloring. With higher powers, this can create interesting effects."
    },
    "atanh": {
        "id": 16,
        "radius": 10,
        "description": "Complex hyperbolic arctangent. Enable interior coloring."
    },
    "inv": {
        "id": 17,
        "radius": 10,
        "description": "Inversed. Pretty much just 1/z."
    },
    "scatter":{
        "id": 18,
        "radius": null,
        "description": "Make sure to use a high sample count, among with a high colorfulness value, then it creates an almost buddhabrot-like image."
    }
}

var presets_fractals = {
    "mandelbrot": {
        "id": 0,
        "radius": 10000000,
        "description": "The standard Mandelbrot set.",
        "formula": "<p>z<sub>n+1</sub> = z<sub>n</sub><sup>POWER</sup> + c</p>"
    },
    "burning_ship": {
        "id": 1,
        "radius": 10000000,
        "description": "A variation of the Mandelbrot set. Got its name because of the tiny burning ship on the left.",
        "formula": "<p>z<sub>n+1</sub> = (|Re(z<sub>n</sub><sup>POWER</sup>)| + Im(z<sub>n</sub><sup>POWER</sup>)i) + c</p>"
    },
    "celtic": {
        "id": 2,
        "radius": 10000000,
        "description": "Another variation of the Mandelbrot set. Kind of looks like a fish.",
        "formula": "<p>z<sub>n+1</sub> = (Re(z<sub>n</sub><sup>POWER</sup>) + |Im(z<sub>n</sub><sup>POWER</sup>)|i) + c</p>"
    },
    "buffalo": {
        "id": 3,
        "radius": 10000000,
        "description": "Yet another Mandelbrot variation. The reason for its name should be obvious.",
        "formula": "<p>z<sub>n+1</sub> = (|Re(z<sub>n</sub><sup>POWER</sup>)| + |Im(z<sub>n</sub><sup>POWER</sup>)|i) + c</p>"
    },
    "tricorn": {
        "id": 4,
        "radius": 10000000,
        "description": "ANOTHER Mandelbrot variation. Also called the Mandelbar sometimes.",
        "formula": "<p>z<sub>n+1</sub> = (-Re(z<sub>n</sub><sup>POWER</sup>) + Im(z<sub>n</sub><sup>POWER</sup>)i) + c</p>"
    },
    "duck": {
        "id": 5,
        "radius": 10000000,
        "description": "Another Mandlebrot variation. Looks like a duck. Apparently also called the perpendicular burning ship.",
        "formula": "<p>polar = toPolar(z<sub>n</sub>)<br>r = Re(polar)<sup>POWER</sup><br>t = POWER * |Im(polar)|;<br>z<sub>n+1</sub> = (r * cos(t) + i * r * sin(t)) + c</p>"
    },
    "ass": {
        "id": 6,
        "radius": 10000000,
        "description": "Kind of looks like- well, ..., whatever.",
        "formula": "<p>x<sub>n+1</sub> = x<sub>n</sub><sup>3</sup> - y<sub>n</sub><sup>2</sup> * abs(y<sub>n</sub>) + c<sub>x</sub><br>y<sub>n+1</sub> = 2 * x<sub>n</sub> * y<sub>n</sub> + c<sub>y</sub></p>"
    },
    "sine": {
        "id": 7,
        "radius": 50,
        "description": "Infinitely repeating to the left and right. Interesting, isn't it?",
        "formula": "<p>z<sub>n+1</sub> = sin(z)<sup>POWER</sup> + c</p>"
    },
    "popcorn": {
        "id": 8,
        "radius": 2,
        "description": "I have no idea who named this one the \"Popcorn\" fractal. Maybe the creators name was Popcorn? Anyway. It generates really cool patterns.",
        "formula": "<p>x<sub>n+1</sub> = x<sub>n</sub> - c<sub>x</sub> * (y<sub>n</sub> + tan(3 * y<sub>n</sub>))<br>y<sub>n+1</sub> = y<sub>n</sub> - c<sub>y</sub> * (x<sub>n</sub> + tan(3 * x<sub>n</sub>))</p>"
    },
    "thorn": {
        "id": 9,
        "radius": 10000000,
        "description": "Not the usual kind of fractal, yet still very interesting.",
        "formula": "<p>x<sub>n+1</sub> = x<sub>n</sub> / cos(y<sub>n</sub>) + c<sub>x</sub><br>y<sub>n+1</sub> = y<sub>n</sub> / sin(x<sub>n</sub>) + c<sub>y</sub></p>"
    },
    "henon": {
        "id": 10,
        "radius": 20000,
        "description": "Henon map.",
        "formula": "<p>x<sub>n+1</sub> = 1 - c<sub>x</sub> * x<sub>n</sub><sup>2</sup> + y<sub>n</sub><br>x<sub>n+1</sub> = c<sub>y</sub> * x<sub>n</sub></p>"
    },
    "duffing": {
        "id": 11,
        "radius": 200,
        "description": "Duffing map.",
        "formula": "<p>x<sub>n+1</sub> = y<sub>n</sub><br>y<sub>n+1</sub> = -1 * c<sub>y</sub> * x<sub>n</sub> + c<sub>x</sub> * y<sub>n</sub> - y<sub>n</sub><sup>3</sup></p>"
    },
    "chirikov": {
        "id": 12,
        "radius": 100, 
        "description": "Chirikov map.",
        "formula": "<p>x<sub>n+1</sub> = x<sub>n</sub> + c<sub>x</sub> * y<sub>n</sub><br>y<sub>n+1</sub> = y<sub>n</sub> + c<sub>y</sub> * sin(x<sub>n</sub>)</p>"
    },
    "ikeda": {
        "id": 13,
        "radius": 20000,
        "description": "Ikeda map. ",
        "formula": "<p>t = 0.4 - 6 / (1 + x<sub>n</sub><sup>2</sup> + y<sub>n</sub><sup>2</sup>)<br>x<sub>n+1</sub> = 1 + c<sub>x</sub> * (x<sub>n</sub> * cos(t) - y<sub>n</sub> * sin(t))<br>x<sub>n+1</sub> = c<sub>y</sub> * (x<sub>n</sub> * sin(t) + y<sub>n</sub> * cos(t))</p>"
    },
    "feather": {
        "id": 14,
        "radius": 50, 
        "description": "Really cool looking fractal. Looks like a feather.",
        "formula": "<p>z<sub>n</sub><sup>3</sup> / (1 + (Re(z)<sup>2</sup> + i * Im(z)<sup>2</sup>)) + c</p>"
    },
    "heart": {
        "id": 15,
        "radius": 10000000,
        "description": "<3",
        "formula": "<p>x<sub>n+1</sub> = 2 * x<sub>n</sub> * y<sub>n</sub> + c<sub>x</sub><br>y<sub>n+1</sub> = |y<sub>n</sub>| - |x<sub>n</sub>| + c<sub>y</sub></p>"
    },
    "ass_2": {
        "id": 16,
        "radius": 10000,
        "description": "Looks a little bit like another.. Anyway. \"Description\", huh? More like \"Probably a sarcastic comment by david\"...",
        "formula": "<p>x<sub>n+1</sub> = sinh(x<sub>n</sub>) * sin(y<sub>n</sub>) + c<sub>x</sub><br>y<sub>n+1</sub> = cosh(y<sub>n</sub>) * cos(x<sub>n</sub>) + c<sub>y</sub></p>"
    },
    "triangle": {
        "id": 17,
        "radius": 10000,
        "description": "Literally just a triangle. Did you know that a² + b² = c² for every right triangle? ",
        "formula": "<p>x<sub>n+1</sub> = sin(x<sub>n</sub>) * sinh(y<sub>n</sub>) + c<sub>x</sub><br>y<sub>n+1</sub> = cos(y<sub>n</sub>) * cosh(x<sub>n</sub>) + c<sub>y</sub></p>"
    },
    "shark_fin": {
        "id": 18,
        "radius": 10000000,
        "description": "Could also be a dolphin. Actually, not really.",
        "formula": "<p>x<sub>n+1</sub> = x<sub>n</sub><sup>2</sup> - |y<sub>n</sub>| * y<sub>n</sub><br>y<sub>n+1</sub> = 2 * x<sub>n</sub> * y<sub>n</sub></p>"
    },
    "tippets": {
        "id": 19,
        "radius": 10000000,
        "description": "With all respect, I think, John Tippets messed up the code for a mandelbrot set, and got this.",
        "formula": "<p>x<sub>n+1</sub> = x<sub>n</sub><sup>2</sup> - y<sub>n</sub><sup>2</sup> + c<sub>x</sub><br>y<sub>n+1</sub> = 2 * x<sub>n+1</sub> * y<sub>n</sub> + c<sub>y</sub></p>"
    },
    "zubieta": {
        "id": 20,
        "radius": 10000000,
        "description": "Looks really interesting. ",
        "formula": "<p>z<sub>n+1</sub> = z<sup>POWER</sup> + c / z</p>"
    },
    "sinh": {
        "id": 21,
        "radius": 70,
        "description": "Kind of like the sine, this one is repeating infinitely vertically. Just looks a little better.",
        "formula": "<p>z<sub>n+1</sub> = sinh(z)<sup>POWER</sup> + c</p>"
    },
    "unnamed_1": {
        "id": 22,
        "radius": 10000000,
        "description": "I found no good name for this. If you can think of anything, tell me.",
        "formula": "<p>z<sub>n+1</sub> = z<sub>n</sub><sup>POWER</sup> - (-z)<sup>c<sub>x</sub></sup> + c<sub>y</sub></p>"
    },
    "unnamed_2": {
        "id": 23,
        "radius": 10000000,
        "description": "I found no name again. Creates really cool patterns. With a power of one and interior coloring, seems to create a Nova/Newton fractal.",
        "formula": "<p>z<sub>n+1</sub> = (z<sub>n</sub> - (z<sub>n</sub><sup>3</sup> - 1) / (3 * z<sub>n</sub><sup>2</sup>))<sup>POWER</sup> + c</p>"
    },
    "unnamed_3": {
        "id": 24,
        "radius": 10000000,
        "description": "No name again, but it looks really cool. Also, it is very big.",
        "formula": "<p>((z<sub>n</sub><sup>2</sup> + c - 1) / (z * (2 + 2i) + c - 2))<sup>POWER</sup></p>"
    },
    "fish": {
        "id": 25,
        "radius": 10000000,
        "description": "Doesn't even look like anything close to a fish.",
        "formula": "<p>x<sub>n+1</sub> = |x<sub>n</sub> - y<sub>n</sub>|<br>y<sub>n+1</sub> = 2 * x<sub>n</sub> * y<sub>n</sub></p>"
    },
    "wavy": {
        "id": 26,
        "radius": 10000000,
        "description": "A lot of waves. Fun fact: I know a few digits of pi... 3.14159265358979323. I once remembered more, but by brain has more holes than a swiss cheese.",
        "formula": "<p>a = y<sub>n</sub> + 1 - (1.4 + sin(y<sub>n</sub>  * pi) * 0.4 + c<sub>x</sub>) * x<sub>n</sub><sup>2</sup><br>b = (0.3 + cos((x<sub>n</sub> + y<sub>n</sub>) * pi) * 0.2 + c<sub>y</sub>) * a<br>x<sub>n+1</sub> = (4 + cos(x<sub>n</sub> * pi) * 3 + (c<sub>x</sub> + c<sub>y</sub>)) * a * (1 - a)<br>y<sub>n+1</sub> = b</p>"
    },
    "collatz": {
        "id": 27,
        "radius": 20,
        "description": "Complex collatz conjecture, apparently.",
        "formula": "<p>z<sub>n+1</sub> = 0.25 * (1 + 4 * z<sub>n</sub> - (1 + 2 * z<sub>n</sub>) * cos(pi * z<sub>n</sub>)) + c</p>"
    },
    "unnamed_4": {
        "id": 28,
        "radius": 10000000,
        "description": "Another unnamed fractal. Has a lot of edges.",
        "formula": "<p>z<sub>n+1</sub> = ((Im(z<sub>n</sub>) - sign(Re(z<sub>n</sub>)) * sqrt(|Im(c) * Re(z<sub>n</sub>) - (Re(c) + Im(c))|)) + i(Re(c) - Re(z<sub>n</sub>)))<sup>POWER</sup></p>"
    },
    "septagon": {
        "id": 29,
        "radius": 10,
        "description": "It looks a little like an hourglass, and its juliasets are septagons.",
        "formula": "<p>z<sub>n+1</sub> = (z<sub>n</sub><sup>7</sup> + (c<sub>x</sub>/c<sub>y</sub> + i(c<sub>x</sub>/c<sub>y</sub>))) / z<sub>n</sub></p>"
    },
    "unnamed_5": {
        "id": 30,
        "radius": 10000000,
        "description": "No idea, this one seems like a warped and distorted version of the mandelbrot set.",
        "formula": "<p>z<sub>n+1</sub> = z<sub>n</sub><sup>POWER</sup> + ((|Re(z)| + i|Im(z)|) + i) / ((|Re(z)| + i|Im(z)|) + 1) + c</p>"
    },
    "unnamed_6": {
        "id": 31,
        "radius": 1000000,
        "description": "The juliasets have interesting symmetries. Probably not, but I am running out of ideas what to put here.",
        "formula": "<p>z<sub>n+1</sub> = (z<sub>n</sub><sup>4</sup> + (1 + i * Re(c))) / (z<sub>n</sub><sup>2</sup> + (1 + i * Im(c)))</p>"
    },
    "cactus": {
        "id": 32,
        "radius": 10000000,
        "description": "Cactus fractal. (I still don't know what to put here.)",
        "formula": "<p>z<sub>n+1</sub> = z<sub>n</sub><sup>3</sup> + (c - 1) * z<sub>n</sub> - c</p>"
    },
    "unnamed_7": {
        "id": 33,
        "radius": 10,
        "description": "Very big (?). Fun fact: As of writing this description, I should be learning for my maths test tomorrow, which I haven't even started with yet. By the time you are reading this, it very likely already ended, so no reason to wish me luck.",
        "formula": "<p>t = c * z<sub>n</sub><sup>2</sup> * (z<sub>n</sub><sup>2</sup> + 1) / (z<sub>n</sub><sup>2</sup> - 1)<sup>2</sup><br>z<sub>n+1</sub> = (Re(t) - Im(t)) / |t|<sup>2</sup></p>"
    },
    "power_circle": {
        "id": 34,
        "radius": 16,
        "description": "Only called it that because it looks like a circle (obviously) and comes from raising z to the power of c.",
        "formula": "<p>z<sub>n+1</sub> = z<sub>n</sub><sup>c</sup></p>"
    },
    "bitten_mandelbrot": {
        "id": 35,
        "radius": 10000000,
        "description": "i took a bite, do you mind? :3",
        "formula": "<p>z<sub>n+1</sub> = (z + c)<sup>POWER</sup> - c / (z + i)</p>"
    },
    "unnamed_8": {
        "id": 36,
        "radius": 10000000,
        "description": "Im running out of creativity. I really do not know what to name this one.",
        "formula": "<p>z<sub>n+1</sub> = (sqrt(z<sub>n</sub><sup>2</sup> / c) - c / z<sub>n</sub><sup>2</sup>)<sup>POWER</sup> * 0.5</p>"
    },
    "unnamed_9": {
        "id": 37,
        "radius": 30,
        "description": "Again, I do not know what to name this one.",
        "formula": "<p>z<sub>n+1</sub> = (log((Im(z<sub>n</sub>) + i * Re(z<sub>n</sub>)) * c + c))<sup>3</sup></p>"
    },
    "smol_brot": {
        "id": 38,
        "radius": 30,
        "description": "Smaller mandelbrot-like looking fractal.",
        "formula": "<p>z<sub>n+1</sub> = z<sub>n</sub><sup>POWER</sup> + c * 2</p>"
    },
    "magnet": {
        "id": 39,
        "radius": 10000000,
        "description": "Magnet fractal. Maybe turn on interior coloring?",
        "formula": "<p>((z<sub>n</sub><sup>POWER</sup> + c - 1) / (2 * z<sub>n</sub> + c - 2))<sup>POWER</sup></p>"
    },
    "tree": {
        "id": 40,
        "radius": 10,
        "description": "Square root makes tree, apparently. Changes its appearance a lot with different powers.",
        "formula": "<p>z<sub>n+1</sub> = sqrt(z<sub>n</sub><sup>POWER+1</sup>) + c</p>"
    },
    "unnamed_10": {
        "id": 41,
        "radius": 10000000,
        "description": "I reeeaally need to find some names for all of these.",
        "formula": "<p>z<sub>n+1</sub> = z<sub>n</sub><sup>3</sup> + z<sub>n</sub> + c</p>"
    },
    "not_mandelbrot": {
        "id": 42,
        "radius": 10000000,
        "description": "Looks like the mandelbrot set at first, but really isn't.",
        "formula": "<p>z<sub>n+1</sub> = (((1 - i) * z<sub>n</sub>) / 2) * (((1 + i) * (z<sub>n</sub> - 1)) / 2) + c</p>"
    }
}

function __addPFractal(id, radius, description, formula, code) {
    presets_fractals[id] = {
        "radius": radius,
        "description": description,
        "formula": formula,
        "code": code
    };
}

function __addPCs(id, description, code) {
    presets_colorschemes[id] = {
        "description": description,
        "code": code
    };
}

function showUrlWarning() {
    document.getElementById("urlaoutdatedwarn").style.display = "block";
}

function hideUrlWarning() {
    document.getElementById("urlaoutdatedwarn").style.display = "none";
}

function showLoadingWave() {
    document.getElementById("loadingscreen").style.display = "block";
}

function hideLoadingWave() {
    document.getElementById("loadingscreen").style.display = "none";
}

function updateUi() {
    function el(e) {
        return document.getElementById(e);
    }

    el("radius").value = radius;
    el("iterations").value = maxIterations;
    el("power").value = power;
    el("constantRe").value = juliasetConstant[0];
    el("constantIm").value = juliasetConstant[1];
    el("nji").value = juliasetInterpolation;
    el("coloroffset").value = colorOffset;
    el("colorfulness").value = colorfulness;
    el("sampleCount").value = sampleCount;
    el("cloudSeed").value = cloudSeed;
    el("cloudAmplitude").value = cloudAmplitude;
    el("cloudMultiplier").value = cloudMultiplier;

    el("frfm").innerHTML = presets_fractals[fractalType].formula.replaceAll("POWER", power);

    showUrlWarning();

}

function updateDescriptions() {
    function el(e) {
        return document.getElementById(e);
    }
    
    el("frdesc").innerHTML = customFractal ? "Custom" : presets_fractals[fractalType].description;
    el("csdesc").innerHTML = customCs ? "Custom" : presets_colorschemes[colorscheme].description;
    el("cmdesc").innerHTML = presets_colormethods[colorMethod].description;
    el("fmdesc").innerHTML = presets_functions[postFracFunc].description;

    showUrlWarning();
}

async function setFractal(type) {

    if (presets_fractals[type]["code"]) {
        pluginFractal = presets_fractals[type]["code"];
    } else {
        pluginFractal = null;
    }

    fractalType = type;
    customFractal = false;
    document.getElementById("tgshdf").innerHTML = "Enable Custom Fractal Shader"; 

    if (postFracFunc == "none") {
        radius = presets_fractals[type]["radius"];
    } else {
        if (presets_functions[postFracFunc]["radius"] != null) {
            radius = presets_functions[postFracFunc]["radius"];
        }
    }

    await compileShaderCode(colorMethod, colorscheme, fractalType, postFracFunc);

    updateUi();
    updateDescriptions();

    renderMain();
    renderJul();
}

async function setColorscheme(name) {

    if (presets_colorschemes[name]["code"]) {
        pluginCs = presets_colorschemes[name]["code"];
    } else {
        pluginCs = null;
    }

    colorscheme = name;
    customCs = false;
    document.getElementById("tgshdcs").innerHTML = "Enable Custom Colorscheme Shader"; 

    await compileShaderCode(colorMethod, colorscheme, fractalType, postFracFunc);

    updateUi();
    updateDescriptions();

    renderMain();
    renderJul();
}

async function setColormethod(name) {
    colorMethod = name;

    await compileShaderCode(colorMethod, colorscheme, fractalType, postFracFunc);

    updateUi();
    updateDescriptions();

    renderMain();
    renderJul();
}

async function setPostFunction(name) {
    for (f in presets_functions) {
        if (f == name) {
            postFracFunc = name;
            if (presets_functions[f]["radius"] != null) {
                radius = presets_functions[f]["radius"];
            } else {
                for (f in presets_fractals) {
                    if (f == fractalType) {
                        radius = presets_fractals[f]["radius"];
                    }
                };
            }
        }
    };

    await compileShaderCode(colorMethod, colorscheme, fractalType, postFracFunc);

    updateUi();
    updateDescriptions();

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
    showUrlWarning();
}
function mouse_down_main(e) {
    if (e.button == 0) {
        mouse_clicked_main = true;
        updateMouseCoords_main(e);
        juliasetConstant[0] = mouse_x_main;
        juliasetConstant[1] = mouse_y_main;
        updateUi();
        renderJul();
        showUrlWarning();
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
        showUrlWarning();
    }
    if (mouse_clicked_right_main) {
        var old_x = mouse_x_main;
        var old_y = mouse_y_main;
        updateMouseCoords_main(e);
        centerMain[0] += old_x - mouse_x_main;
        centerMain[1] += old_y - mouse_y_main;
        updateMouseCoords_main(e);
        renderMain();
        showUrlWarning();
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
    showUrlWarning();
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
        showUrlWarning();
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

function _export(dURL) {
    var pURL = createUrlParams();
    var s = dURL.split(",");
    
    var a = document.createElement("a");   // long text to avoid it accidentally occuring in png files' image data
    a.href = s[0] + "," + btoa(atob(s[1]) + "301210301210301210_FRACTALEXPLORERPARAMETERURL:" + pURL);
    a.download = "fractal.png";
    a.click();
    a.remove();
}
function exportMain() {
    renderMain();
    var data = canvasMain.toDataURL("image/png");
    _export(data);
}
function exportJul() {
    renderJul();
    var data = canvasJul.toDataURL("image/png");
    _export(data);
}

function loadParamsFromFile() {
    var input = document.createElement("input");
    input.type = "file";
    input.onchange = e => { 
        var file = e.target.files[0]; 
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = readerEvent => {
            var content = readerEvent.target.result;
            var split = content.split("301210301210301210_FRACTALEXPLORERPARAMETERURL:");
            if (split.length == 2) {
                applyUrlParams_(split[1]);
            } else {
                alert("No URL could be found in the uploaded image.");
            }
        }
    }

    input.click();
}

function setRadius(rad) { radius = rad; renderMain(); renderJul(); updateUi(); }
function setPower(p) { power = p; renderMain(); renderJul(); updateUi(); }
function setIterations(i) { maxIterations = i; renderMain(); renderJul(); updateUi(); }
function setColoroffset(o) { colorOffset = o; renderMain(); renderJul(); updateUi(); }
function setConstantX(x) { juliasetConstant[0] = x; renderJul(); updateUi(); }
function setConstantY(y) { juliasetConstant[1] = y; renderJul(); updateUi(); }
function setInterpolation(v) { juliasetInterpolation = v; renderJul(); updateUi();}
function setColorfulness(c) { colorfulness = c; renderMain(); renderJul(); updateUi(); }
function setSampleCount(s) { sampleCount = s; renderMain(); renderJul(); updateUi(); }
function setCloudSeed(s) { cloudSeed = s; renderMain(); renderJul(); }
function setCloudAmplitude(a) { cloudAmplitude = a; renderMain(); renderJul(); }
function setCloudMultiplier(m) { cloudMultiplier = m; renderMain(); renderJul(); }

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

function createUrlParams() {
    var l = window.location.href.indexOf("?");
    var u = l == -1 ? window.location.href : window.location.href.slice(0, l);
    var url = new URL(u); 
    var params = url.searchParams;
    params.append("cxm", centerMain[0]);
    params.append("cym", centerMain[1]);
    params.append("cxj", centerJul[0]);
    params.append("cyj", centerJul[1]);
    params.append("cx", juliasetConstant[0]);
    params.append("cy", juliasetConstant[1]);
    params.append("zm", zoomMain);
    params.append("zj", zoomJul);
    params.append("r", radius);
    params.append("i", maxIterations);
    params.append("cm", colorMethod);
    params.append("cs", colorscheme);
    params.append("co", colorOffset);
    params.append("cf", colorfulness);
    params.append("sc", sampleCount);
    params.append("f", fractalType);
    params.append("nji", juliasetInterpolation);
    params.append("p", power);
    params.append("pf", postFracFunc);
    params.append("csd", cloudSeed);
    params.append("cam", cloudAmplitude);
    params.append("cml", cloudMultiplier);
    document.getElementById("url").innerText = document.getElementById("url").href = url.href;
    hideUrlWarning();

    return url.href;
}

async function applyUrlParams() {
    applyUrlParams_(window.location.href);
}

async function applyUrlParams_(url) {
    var params = new URL(url).searchParams;
    centerMain[0] = parseFloat(params.get("cxm") ?? centerMain[0]);
    centerMain[1] = parseFloat(params.get("cym") ?? centerMain[1]);
    centerJul[0] = parseFloat(params.get("cxj") ?? centerJul[0]);
    centerJul[1] = parseFloat(params.get("cyj") ?? centerJul[1]);
    juliasetConstant[0] = parseFloat(params.get("cx") ?? juliasetConstant[0]);
    juliasetConstant[1] = parseFloat(params.get("cy") ?? juliasetConstant[1]);
    zoomMain = parseFloat(params.get("zm") ?? zoomMain);
    zoomJul = parseFloat(params.get("zj") ?? zoomJul);
    radius = parseFloat(params.get("r") ?? radius);
    maxIterations = parseFloat(params.get("i") ?? maxIterations);
    colorMethod = params.get("cm") ?? colorMethod;
    colorscheme = presets_colorschemes[params.get("cs")] ? (params.get("cs") ?? colorscheme) : colorscheme;
    colorOffset = parseFloat(params.get("co") ?? colorOffset);
    colorfulness = parseFloat(params.get("cf") ?? colorfulness);
    sampleCount = parseInt(params.get("sc") ?? sampleCount);
    fractalType = presets_fractals[params.get("f")] ? (params.get("f") ?? fractalType) : fractalType;
    juliasetInterpolation = parseFloat(params.get("nji") ?? juliasetInterpolation);
    power = parseFloat(params.get("p") ?? power);
    postFracFunc = params.get("pf") ?? postFracFunc;
    cloudSeed = parseFloat(params.get("csd") ?? cloudSeed);
    cloudAmplitude = parseFloat(params.get("cam") ?? cloudAmplitude);
    cloudMultiplier = parseFloat(params.get("cml") ?? cloudMultiplier);

    await compileShaderCode(colorMethod, colorscheme, fractalType, postFracFunc);
    renderMain();
    renderJul();
    updateUi();
    createUrlParams();
    updateDescriptions();
}

async function randomizeFractal() {
    var allFractals = [];
    Object.keys(presets_fractals).forEach(f => { allFractals.push(f); });
    var allColorschemes = [];
    Object.keys(presets_colorschemes).forEach(s => { allColorschemes.push(s); });
    var allFuncs = [];
    Object.keys(presets_functions).forEach(f => { allFuncs.push(f); });

    fractalType = allFractals[Math.floor(Math.random() * allFractals.length)];
    colorscheme = allColorschemes[Math.floor(Math.random() * allColorschemes.length)];
    postFracFunc = allFuncs[Math.floor(Math.random() * allFuncs.length)];

    var rrand = Math.random();
    radius = rrand > 0.333 ? (rrand > 0.666 ? 10 : 1000) : 1000000;
    power = Math.sign(Math.random() - 0.5) * (Math.floor(Math.random() * 8) + 2);
    juliasetConstant = [Math.random() * Math.random() * 6, Math.random() * Math.random() * 6];

    await compileShaderCode(colorMethod, colorscheme, fractalType, postFracFunc);
    renderMain();
    renderJul();
    updateUi();
    updateDescriptions();
}

async function resetSettings() {
    centerMain = [0, 0];
    zoomMain = 1 / 2.5;
    centerJul = [0, 0];
    zoomJul = 1 / 2.5;
    maxIterations = 100;
    radius = 100000;
    power = 2;
    colorOffset = 0;
    fractalType = "mandelbrot";
    colorscheme = "classic";
    colorMethod = "smooth";
    postFracFunc = "none";
    juliasetConstant = [0., 0.];
    juliasetInterpolation = 1;
    colorfulness = 1;
    sampleCount = 1;
    cloudSeed = 33333;
    cloudAmplitude = 0;
    cloudMultiplier = 0.8;

    await compileShaderCode(colorMethod, colorscheme, fractalType, postFracFunc);
    renderMain();
    renderJul();
    updateUi();
    updateDescriptions();
    createUrlParams();
}

applyUrlParams();
createUrlParams();

updateDescriptions();

async function toggleShader(b, t) {
    if (t == "f") {
        customFractal = !customFractal;
    }
    if (t == "cs") {
        customCs = !customCs;
    }
    var returnv = await compileShaderCode(colorMethod, colorscheme, fractalType, postFracFunc);
    if (returnv == "success") {
        document.getElementById(t + "compileout").innerHTML = "successfully compiled and loaded new shader";
        if (t == "f") {
            b.innerHTML = (customFractal ? "Disable" : "Enable") + " Custom Fractal Shader";
        }
        if (t == "cs") {
            b.innerHTML = (customCs ? "Disable" : "Enable") + " Custom Colorscheme Shader";
        }
        updateDescriptions();
        renderMain();
        renderJul();
    } else {
        document.getElementById(t + "compileout").innerHTML = returnv;
        if (t == "f") {
            customFractal = !customFractal;
        }
        if (t == "cs") {
            customCs = !customCs;
        }
    }
}

async function updateShader(t) {
    var cfo = customFractal;
    var ccso = customCs;
    customFractal = t == "f";
    customCs = t == "cs";
    var returnv = await compileShaderCode(colorMethod, colorscheme, fractalType, postFracFunc);
    customFractal = cfo;
    customCs = ccso;
    if (returnv == "success") {
        document.getElementById(t + "compileout").innerHTML = "successfully compiled and loaded new shader";
        renderMain();
        renderJul();
        customFractal = t == "f";
        customCs = t == "cs";
        if (t == "f") {
            document.getElementById("tgshdf").innerHTML = "Disable Custom Fractal Shader";
        }
        if (t == "cs") {
            document.getElementById("tgshdcs").innerHTML = "Disable Custom Colorscheme Shader";
        }
    } else {
        document.getElementById(t + "compileout").innerHTML = returnv;
        if (t == "f") {
            document.getElementById("tgshdf").innerHTML = "Enable Custom Fractal Shader"; 
            customFractal = false;
        }
        if (t == "cs") {
            document.getElementById("tgshdcs").innerHTML = "Enable Custom Colorscheme Shader";
            customCs = false;
        }
        updateDescriptions();
    }
}

return [renderMain, renderJul, setFractal, setColorscheme, setColormethod, setColoroffset, setCanvasesSticky,
        setRadius, setIterations, setConstantX, setConstantY, setInterpolation, setPostFunction,
        exportMain, exportJul, setCanvasSize, setColorfulness, setSampleCount, setPower, toggleShader, updateShader,
        createUrlParams, resetSettings, __addPFractal, __addPCs, randomizeFractal, 
        setCloudSeed, setCloudAmplitude, setCloudMultiplier, loadParamsFromFile, applyUrlParams_];
}

var renderMain;
var renderJul;
var setFractal;
var setColorscheme;
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
var setColorfulness; 
var setSampleCount;
var setPower;
var toggleShader;
var updateShader; 
var createUrlParams; 
var resetSettings; 
var __addPFractal; 
var __addPCs; 
var randomizeFractal; 
var setCloudSeed;
var setCloudAmplitude;
var setCloudMultiplier;
var loadParamsFromFile;
var applyUrlParams;
(async () => { return await init(); })().then(([renderMain2, renderJul2, setFractal2, setColorscheme2, setColormethod2, setColoroffset2, setCanvasesSticky2,
                                                setRadius2, setIterations2, setConstantX2, setConstantY2, setInterpolation2, setPostFunction2,
                                                exportMain2, exportJul2, setCanvasSize2, setColorfulness2, setSampleCount2, setPower2, toggleShader2, updateShader2,
                                                createUrlParams2, resetSettings2, __addPFractal2, __addPCs2, randomizeFractal2, 
                                                setCloudSeed2, setCloudAmplitude2, setCloudMultiplier2, loadParamsFromFile2, applyUrlParams2]) => {
    renderMain = renderMain2;
    renderJul = renderJul2;
    setFractal = setFractal2;
    setColorscheme = setColorscheme2;
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
    setSampleCount = setSampleCount2;
    setPower = setPower2;
    toggleShader = toggleShader2;
    updateShader = updateShader2;
    createUrlParams = createUrlParams2;
    resetSettings = resetSettings2;
    __addPFractal = __addPFractal2;
    __addPCs = __addPCs2;
    randomizeFractal = randomizeFractal2;
    setCloudSeed = setCloudSeed2;
    setCloudAmplitude = setCloudAmplitude2;
    setCloudMultiplier = setCloudMultiplier2;
    loadParamsFromFile = loadParamsFromFile2;
    applyUrlParams = applyUrlParams2;

    document.getElementById("loadingscreen").style.display = "none";
    document.getElementById("statusbar").style.display = "none";
    document.getElementById("loadingscreen").style.backgroundColor = "#00000060";

    console.log("finished initialization");

    //confirmWalkthrough().onInteracted(accepted => {
    //    if (accepted) {
    //        startWalkthrough();
    //    }
    //});
});
