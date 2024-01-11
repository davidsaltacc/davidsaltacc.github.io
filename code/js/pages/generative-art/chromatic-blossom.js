
async function init() {

if (!navigator.gpu) {
    alert("WebGPU is not supported in your browser.");
    return;
}

const canvasMain = document.getElementById("canvasMain");
const contextMain = canvasMain.getContext("webgpu");

var adapter = await navigator.gpu.requestAdapter();
var device = await adapter.requestDevice();

device.lost.then(() => {
    alert("Lost contact to your GPU. Please reload this page, and if neccessary, restart your browser.");
});

const format = navigator.gpu.getPreferredCanvasFormat();
const uniformBufferSize = Math.ceil((
    + 2 * Float32Array.BYTES_PER_ELEMENT // center: vec2<f32>
    + 2 * Float32Array.BYTES_PER_ELEMENT // canvasDimensions: vec2<f32>
    + Float32Array.BYTES_PER_ELEMENT // zoom: f32
    + 10 * Float32Array.BYTES_PER_ELEMENT // a, b, c, d, e, f, g, h, i, j : f32
    + Uint32Array.BYTES_PER_ELEMENT // maxIterations: u32
    + Uint32Array.BYTES_PER_ELEMENT // radius: u32
    + Uint32Array.BYTES_PER_ELEMENT // sampleCount: u32
) / 8) * 8;

const uniformBuffer = device.createBuffer({
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

var code = null;
await fetch("../../code/wgl/pages/generative-art/chromatic-blossom.wgsl") 
    .then(response => response.text())
    .then(data => {
        code = data;
    }
);

const shaderModule = device.createShaderModule({ code: code });

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

contextMain.configure({
    device,
    format,
    alphaMode: "opaque",
});

var centerMain = [0, 0];
var zoomMain = 1 / 2.5;

var maxIterations = 20;
var radius = 100;
var sampleCount = 1;

var a = 0.5;
var b = 0.5;
var c = 8;
var d = 4;
var e = 1;
var f = 1;
var g = 1;
var h = 0;
var i = 0;
var j = 0;

const texture = device.createTexture({
    size: [canvasMain.clientWidth, canvasMain.clientHeight],
    format: format,
    usage: GPUTextureUsage.RENDER_ATTACHMENT
});
const view = texture.createView();

function draw(context, center, zoom) {
	const arrayBuffer = new ArrayBuffer(uniformBufferSize);
	new Float32Array(arrayBuffer, 0).set([
		center[0],
        center[1],
        canvasMain.clientWidth, 
        canvasMain.clientHeight,
        zoom,
        a, b, c, d, e, f, g, h, i, j
	]);
	new Uint32Array(arrayBuffer, 15 * Float32Array.BYTES_PER_ELEMENT).set([
        maxIterations,
        radius,
        sampleCount
    ]);
	device.queue.writeBuffer(uniformBuffer, 0, arrayBuffer);

	const encoder = device.createCommandEncoder();
	const renderPass = encoder.beginRenderPass({
		colorAttachments: [{
			view,
            resolveTarget: context.getCurrentTexture().createView(),
			loadOp: "clear",
			clearValue: [0, 0, 0, 1],
			storeOp: "store"
		}]
	});

	renderPass.setPipeline(pipeline);
	renderPass.setBindGroup(0, bindGroup);
	renderPass.draw(4);
	renderPass.end();

	device.queue.submit([encoder.finish()]);
};

function renderMain() {
    draw(contextMain, centerMain, zoomMain);
}

renderMain();

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

canvasMain.onwheel = on_zoom_main;
canvasMain.onmousedown = mouse_down_main;
canvasMain.onmouseup = mouse_up_main;
canvasMain.onmousemove = mouse_move_main;

canvasMain.oncontextmenu = function(e) { e.preventDefault() };

function exportMain() {
    var data = canvasMain.toDataURL("image/png");
    var a = document.createElement("a");
    a.href = data;
    a.download = "thing.png";
    a.click();
    a.remove();
}

function setCanvasSize(size) {
    canvasMain.width = canvasMain.height = size;
    canvasJul.width = canvasJul.height = size;
    canvasMain.clientWidth = canvasMain.clientHeight = size;
    canvasJul.clientWidth = canvasJul.clientHeight = size;
    renderMain();
}

function updateUi() {
    document.getElementById("a").value = a;
    document.getElementById("b").value = b;
    document.getElementById("c").value = c;
    document.getElementById("d").value = d;
    document.getElementById("e").value = e;
    document.getElementById("f").value = f;
    document.getElementById("g").value = g;
    document.getElementById("h").value = h;
    document.getElementById("i").value = i;
    document.getElementById("j").value = j;
}

function setIterations(i) { maxIterations = i; renderMain(); }
function setRadius(r) { radius = r; renderMain(); }
function setSampleCount(s) { sampleCount = s; renderMain(); }

function setA(a_) { a = a_; renderMain(); }
function setB(b_) { b = b_; renderMain(); }
function setC(c_) { c = c_; renderMain(); }
function setD(d_) { d = d_; renderMain(); }
function setE(e_) { e = e_; renderMain(); }
function setF(f_) { f = f_; renderMain(); }
function setG(g_) { g = g_; renderMain(); }
function setH(h_) { h = h_; renderMain(); }
function setI(i_) { i = i_; renderMain(); }
function setJ(j_) { j = j_; renderMain(); }
function randomizeValues() {
    a = (((Math.random() - 0.5) * 2) * 4).toFixed(2);
    b = (((Math.random() - 0.5) * 2) * 5).toFixed(2);
    c = Math.floor(((Math.random() - 0.5) * 2) * 10);
    c = c == 0 ? 1 : c;
    d = (((Math.random() - 0.5) * 2) * 15).toFixed(2);
    e = (((Math.random() - 0.5) * 2) * 10).toFixed(2);
    f = (((Math.random() - 0.5) * 2) * 6).toFixed(2);
    g = (((Math.random() - 0.5) * 2) * 2).toFixed(1);
    h = (((Math.random() - 0.5) * 2) * 5).toFixed(2);
    i = (((Math.random() - 0.5) * 2) * 10).toFixed(2);
    j = (((Math.random() - 0.5) * 2) * 4).toFixed(2);
    updateUi();
    renderMain();
};

return [renderMain, exportMain, setCanvasSize, setIterations, setRadius, setA, setB, setC, setD, setE, setF, setG, setH, setI, setJ, randomizeValues, setSampleCount];
}

var renderMain;
var exportMain;
var setCanvasSize; 
var setIterations; 
var setRadius; 
var setSampleCount;
var setA, setB, setC, setD, setE, setF, setG, setH, setI, setJ;
var randomizeValues; 
(async () => { return await init(); })().then(([renderMain2, exportMain2, setCanvasSize2, setIterations2, setRadius2, setA2, setB2, setC2, setD2, setE2, setF2, setG2, setH2, setI2, setJ2, randomizeValues2, setSampleCount2]) => {
    renderMain = renderMain2;
    exportMain = exportMain2;
    setCanvasSize = setCanvasSize2;
    setIterations = setIterations2;
    setRadius = setRadius2;
    setSampleCount = setSampleCount2;
    setA = setA2;
    setB = setB2;
    setC = setC2;
    setD = setD2;
    setE = setE2;
    setF = setF2;
    setG = setG2;
    setH = setH2;
    setI = setI2;
    setJ = setJ2;
    randomizeValues = randomizeValues2;
});
