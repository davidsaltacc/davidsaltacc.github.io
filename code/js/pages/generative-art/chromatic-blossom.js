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
    + Uint32Array.BYTES_PER_ELEMENT // skeleton: u32
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
var radius = 1000;
var sampleCount = 6;
var skeleton = false;

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
        sampleCount,
        skeleton
    ]);
    device.queue.writeBuffer(uniformBuffer, 0, arrayBuffer);

    const encoder = device.createCommandEncoder();
    const renderPass = encoder.beginRenderPass({
        colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            loadOp: "clear",
            clearValue: [0, 0, 0, 0],
            storeOp: "store",
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
    renderMain();
    var data = canvasMain.toDataURL("image/png");
    var a = document.createElement("a");
    a.href = data;
    a.download = "chromatic-blossom.png";
    a.click();
    a.remove();
}

function setCanvasSize(size) {
    canvasMain.width = canvasMain.height = size;
    canvasMain.clientWidth = canvasMain.clientHeight = size;
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

function toggleSkeleton() { skeleton = !skeleton; renderMain(); return skeleton; }

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
    g = Math.floor(((Math.random() - 0.5) * 2) * 4) / 2;
    h = (((Math.random() - 0.5) * 2) * 5).toFixed(2);
    i = (((Math.random() - 0.5) * 2) * 10).toFixed(2);
    j = (((Math.random() - 0.5) * 2) * 4).toFixed(2);
    updateUi();
    renderMain();
};

var keyframes = [];

function addKeyframe() {
    var element = document.createElement("div");
    element.className = "keyframe";
    element.innerHTML = `
<p>Keyframe:</p>
<p>a, b, c, d, e, f, g, h, i, j:</p>
<input class="inputA" type="number" value="0.5">
<input class="inputB" type="number" value="0.5">
<input class="inputC" type="number" value="8">
<input class="inputD" type="number" value="4">
<input class="inputE" type="number" value="1">
<input class="inputF" type="number" value="1">
<input class="inputG" type="number" value="1">
<input class="inputH" type="number" value="0">
<input class="inputI" type="number" value="0">
<input class="inputJ" type="number" value="0">
<p>Time (seconds):</p>
<input type="number" value="0" class="inputTime"><br><br>
<button type="button" onclick="removeKeyframe(this);">Remove Keyframe</button>
`;
    keyframes.push({
        el: element
    });
    document.getElementById("keyframes").appendChild(element);
}

function removeKeyframe(button) {
    keyframes.splice(keyframes.indexOf({
        el: button.parentElement
    }), 1);
    button.parentElement.remove();
}

function animate() {
    var frames = [];
    keyframes.forEach((frame) => {
        frames.push({
            a: parseFloat(frame.el.getElementsByClassName("inputA")[0].value),
            b: parseFloat(frame.el.getElementsByClassName("inputB")[0].value),
            c: parseFloat(frame.el.getElementsByClassName("inputC")[0].value),
            d: parseFloat(frame.el.getElementsByClassName("inputD")[0].value),
            e: parseFloat(frame.el.getElementsByClassName("inputE")[0].value),
            f: parseFloat(frame.el.getElementsByClassName("inputF")[0].value),
            g: parseFloat(frame.el.getElementsByClassName("inputG")[0].value),
            h: parseFloat(frame.el.getElementsByClassName("inputH")[0].value),
            i: parseFloat(frame.el.getElementsByClassName("inputI")[0].value),
            j: parseFloat(frame.el.getElementsByClassName("inputJ")[0].value),
            time: parseFloat(frame.el.getElementsByClassName("inputTime")[0].value)
        });
    });
    console.log(frames);
    var animationFrames = [];

    // lerping
}

return [renderMain, exportMain, setCanvasSize, setIterations, setRadius, setSampleCount, setA, setB, setC, setD, setE, setF, setG, setH, setI, setJ, randomizeValues, addKeyframe, removeKeyframe, animate, toggleSkeleton];
}

var renderMain;
var exportMain;
var setCanvasSize; 
var setIterations; 
var setRadius; 
var setSampleCount;
var setA, setB, setC, setD, setE, setF, setG, setH, setI, setJ;
var randomizeValues; 
var addKeyframe; 
var removeKeyframe; 
var animateFrames;
var toggleSkeleton;
(async () => { return await init(); })().then(([renderMain2, exportMain2, setCanvasSize2, setIterations2, setRadius2, setSampleCount2, setA2, setB2, setC2, setD2, setE2, setF2, setG2, setH2, setI2, setJ2, randomizeValues2, addKeyframe2, removeKeyframe2, animate2, toggleSkeleton2]) => {
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
    addKeyframe = addKeyframe2;
    removeKeyframe = removeKeyframe2;
    animateFrames = animate2;
    toggleSkeleton = toggleSkeleton2;
});

