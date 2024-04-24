
async function init(canvasElement) {

if (!navigator.gpu) {
    alert("WebGPU is not supported in your browser.");
    return;
}

var canvas = canvasElement;
var context = canvas.getContext("webgpu");

canvas.width = canvas.style.width = window.innerWidth / 2; 
canvas.height = canvas.style.height = window.innerHeight / 2;

var adapter = await navigator.gpu.requestAdapter();
var device = await adapter.requestDevice();

device.lost.then(() => {
    alert("Lost contact to your GPU. Please reload this page, and if neccessary, restart your browser.");
});

var format = navigator.gpu.getPreferredCanvasFormat();
var uniformBufferSize = Math.ceil((
    3 * Float32Array.BYTES_PER_ELEMENT + // pos
    1 * Float32Array.BYTES_PER_ELEMENT + // zoom
    1 * Float32Array.BYTES_PER_ELEMENT // windowRatio
) / 8) * 8;

var uniformBuffer = device.createBuffer({
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

var permBuffer = device.createBuffer({
    size: 512 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
});

var gradPBuffer = device.createBuffer({
    size: 4 * 512 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
});

var code = null;
await fetch("../../code/wgl/pages/generative-art/anim-noise.wgsl") 
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
                    visibility: 1 | 2,
                    buffer: {},
                },
                {
                    binding: 1,
                    visibility: 2 | 4,
                    buffer: {
                        type: "read-only-storage"
                    },
                },
                {
                    binding: 2,
                    visibility: 2 | 4,
                    buffer: {
                        type: "read-only-storage"
                    },
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
        },
        {
            binding: 1,
            resource: {
                buffer: permBuffer
            }
        },
        {
            binding: 2,
            resource: {
                buffer: gradPBuffer
            }
        }
    ]
});

context.configure({
    device,
    format,
    alphaMode: "opaque",
});

var permValueBuffer = new ArrayBuffer(512 * Int32Array.BYTES_PER_ELEMENT);
var gradPValueBuffer = new ArrayBuffer(4 * 512 * Float32Array.BYTES_PER_ELEMENT);

var permValues = new Array(512);
var gradPValues = new Array(512);

function updateBuffers() {
    new Int32Array(permValueBuffer, 0).set(permValues);
    new Float32Array(gradPValueBuffer, 0).set(gradPValues.flatMap(l => l));
}

var p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

var grad3 = [
    [1, 1, 0],
    [-1, 1, 0],
    [1, -1, 0],
    [-1, -1, 0],
    [1, 0, 1],
    [-1, 0, 1],
    [1, 0, -1],
    [-1, 0, -1],
    [0, 1, 1],
    [0, -1, 1],
    [0, 1, -1],
    [0, -1, -1]
];

function setSeed(seed) {
    seed = Math.floor(seed * 65536);
    if (seed < 256) {
        seed = (seed << 8) | seed;
    }
    for (var i = 0; i < 256; i++) {
        var s;
        if (i & 1) {
            s = seed;
        } else {
            s = (seed >> 8);
        }
        var v = p[i] ^ (s & 255);
        permValues[i] = permValues[i + 256] = v;
        gradPValues[i] = gradPValues[i + 256] = grad3[v % 12];
    }

    updateBuffers();
}

setSeed(Math.random());

var z = 0;

function draw(context) {

    var arrayBuffer = new ArrayBuffer(uniformBufferSize);
    new Float32Array(arrayBuffer, 0).set([
        0, 0, z, // offset/pos
        2.5, // zoom
        canvas.width / canvas.height
    ]);

    device.queue.writeBuffer(uniformBuffer, 0, arrayBuffer);

    device.queue.writeBuffer(permBuffer, 0, permValueBuffer);
    device.queue.writeBuffer(gradPBuffer, 0, gradPValueBuffer);
    
    const encoder = device.createCommandEncoder();
    const renderPass = encoder.beginRenderPass({
        colorAttachments: [{
            view: context.getCurrentTexture().createView(),
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

function render() {
    draw(context);
}

function frame() {
    render();
    z += 0.0025;
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

return [render];

}

(async () => { return await init(document.getElementById("canvas")); })().then(([ render ]) => {
    render();
});
