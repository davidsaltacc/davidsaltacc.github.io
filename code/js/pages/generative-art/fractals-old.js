var mandelbrotCanvas = document.createElement("canvas"),
    juliasetCanvas = document.createElement("canvas"),
    width = 500,
    height = 500,
    mandelbrotCtx = mandelbrotCanvas.getContext("2d"),
    juliasetCtx = juliasetCanvas.getContext("2d"),
    julScale = 2.5,
    manScale = 2.5,
    usecustom = false;
document.body.prepend(juliasetCanvas);
document.body.prepend(mandelbrotCanvas);
mandelbrotCanvas.width = juliasetCanvas.width = width;
mandelbrotCanvas.height = juliasetCanvas.height = height;
var ccx = 0;
var ccy = 0;
var rightclickedMan = false;
var rightclickedJul = false;
var manOffsX = 0;
var manOffsY = 0;
var julOffsX = 0;
var julOffsY = 0;
var power = 2;
var mandelbrot = true;
var burningShip = false;
var celtic = false;
var corn = false;
var feather = false;
var chirikov = false;
var ikeda = false;

var smoothcmap = false;

var classiccmap = true;
var rainbowcmap = false;
var BlWhBn = [
    [9, 1, 47],
    [7, 3, 60],
    [4, 4, 73],
    [2, 6, 87],
    [0, 7, 100],
    [6, 26, 119],
    [12, 44, 138],
    [18, 44, 138],
    [24, 44, 138],
    [41, 85, 174],
    [57, 125, 209],
    [96, 153, 219],
    [134, 181, 229], 
    [173, 209, 239],
    [211, 236, 248],
    [226, 230, 220],
    [241, 233, 191],
    [245, 217, 143],
    [248, 201, 95],
    [252, 186, 48],
    [255, 170, 0],
    [230, 149, 0],
    [204, 128, 0],
    [179, 108, 0],
    [153, 87, 0],
    [130, 70, 2],
    [106, 52, 3],
    [86, 41, 9],
    [66, 30, 15],
    [46, 19, 21],
    [25, 7, 26]
];
var WhBlRd = [
    [228, 224, 229],
    [206, 211, 221],
    [183, 198, 212],
    [160, 185, 204],
    [137, 172, 195],
    [129, 164, 195],
    [121, 156, 194],
    [113, 148, 194],
    [104, 140, 193],
    [101, 117, 182],
    [98, 93, 170],
    [95, 70, 159],
    [91, 46, 147],
    [81, 39, 125],
    [71, 31, 102],
    [61, 24, 80],
    [50, 16, 57],
    [74, 24, 63],
    [97, 31, 69],
    [120, 39, 75],
    [143, 46, 80],
    [154, 59, 81],
    [164, 71, 82],
    [174, 84, 83],
    [184, 96, 84],
    [189, 112, 96],
    [193, 128, 108],
    [197, 144, 120],
    [201, 159, 132],
    [209, 176, 157],
    [217, 193, 182],
    [225, 210, 207],
    [233, 226, 232]
];
var HSV = [
    [255, 0, 0],
    [255, 153, 0],
    [255, 230, 0],
    [204, 255, 0],
    [128, 255, 0],
    [51, 255, 0],
    [0, 255, 26],
    [0, 255, 102],
    [0, 255, 179],
    [0, 255, 255],
    [0, 179, 255],
    [0, 102, 255],
    [0, 26, 255],
    [51, 0, 255],
    [128, 0, 255],
    [204, 0, 255],
    [255, 0, 230],
    [255, 0, 153],
    [255, 0, 76]
];
var FireIce = [
    [0, 0, 0],
    [39, 5, 0],
    [77, 11, 0],
    [116, 16, 0],
    [154, 21, 0],
    [167, 41, 0],
    [180, 60, 0],
    [192, 80, 0],
    [205, 99, 0],
    [212, 120, 4],
    [219, 141, 9],
    [225, 161, 13],
    [232, 182, 17],
    [233, 192, 52],
    [233, 202, 88],
    [234, 212, 123],
    [234, 222, 158],
    [234, 226, 174],
    [233, 231, 190],
    [233, 235, 206],
    [232, 239, 222],
    [206, 234, 225],
    [181, 229, 228],
    [155, 223, 230],
    [129, 218, 233],
    [104, 193, 220],
    [79, 169, 207],
    [54, 144, 194],
    [29, 119, 181],
    [22, 103, 169],
    [15, 87, 156],
    [7, 70, 144],
    [0, 54, 131],
    [0, 41, 98],
    [0, 27, 66],
    [0, 14, 33]
];

var FireIce = [
    [0, 0, 0],
    [39, 5, 0],
    [77, 11, 0],
    [116, 16, 0],
    [154, 21, 0],
    [167, 41, 0],
    [180, 60, 0],
    [192, 80, 0],
    [205, 99, 0],
    [212, 120, 4],
    [219, 141, 9],
    [225, 161, 13],
    [232, 182, 17],
    [233, 192, 52],
    [233, 202, 88],
    [234, 212, 123],
    [234, 222, 158],
    [234, 226, 174],
    [233, 231, 190],
    [233, 235, 206],
    [232, 239, 222],
    [206, 234, 225],
    [181, 229, 228],
    [155, 223, 230],
    [129, 218, 233],
    [104, 193, 220],
    [79, 169, 207],
    [54, 144, 194],
    [29, 119, 181],
    [22, 103, 169],
    [15, 87, 156],
    [7, 70, 144],
    [0, 54, 131],
    [0, 41, 98],
    [0, 27, 66],
    [0, 14, 33]
];
var colormap = BlWhBn;
function cmapBlWhBn() {
    smoothcmap = false;
    colormap = BlWhBn;
    renderFractal();
    renderJuliaset(ccx, ccy);
}
function cmapWhBlRd() {
    smoothcmap = false;
    colormap = WhBlRd;
    renderFractal();
    renderJuliaset(ccx, ccy);
}
function cmapHSV() {
    smoothcmap = false;
    colormap = HSV;
    renderFractal();
    renderJuliaset(ccx, ccy);
}
function cmapFireIce() {
    smoothcmap = false;
    colormap = FireIce;
    renderFractal();
    renderJuliaset(ccx, ccy);
}
function reverseCmap() {
    colormap = colormap.reverse();
    renderFractal();
    renderJuliaset(ccx, ccy);
}
function classicCmap() {
    smoothcmap = true;
    rainbowcmap = false;
    classiccmap = true;
    renderFractal();
    renderJuliaset(ccx, ccy);
}
function rainbowCmap() {
    smoothcmap = true;
    classiccmap = false;
    rainbowcmap = true;
    renderFractal();
    renderJuliaset(ccx, ccy);
}
const gpu = new GPU.GPU();
const renderFractal_ = gpu.createKernel(function(width, height, scale, cx, cy, jset, brot, ship, celtic, corn, feather, chirikov, ikeda, pow, cmap, cl, offsx, offsy, radius_, smoothcmap, classiccmap, rainbowcmap) {
    var x = this.thread.x;
    var y = this.thread.y;
    var scale_m = 1;
	var radius = radius_;
	radius = 2;
    if (feather) {
        scale_m = 1.5;
		radius = 128;
    }
    if (chirikov) {
        scale_m = 2;
		radius = 128;
    }
    if (pow > 2) {
        scale_m = 0.6;
    }
    var a = x / width * (scale * 2 * scale_m) - scale * scale_m + offsx; 
    var b = y / height * (scale * 2 * scale_m) - scale * scale_m + offsy;
    var ca = a;
    var cb = b;
    if (jset) {
        ca = cx;
        cb = cy;
    }
    var lastA = 1;
    var lastB = 0;
    var str = 0;
    var col = 0;
    var nsm = 0;
    var n = 0;
    while (n < 200) {
        if (brot || ship || corn || celtic) {
            var aa = 1;
            var bb = 0;
            for (var i = 0; i < pow; i++) {
                var temp = aa; 
                aa = aa * a - bb * b;
                bb = temp * b + bb * a;
            }
            if (celtic) {
                aa = Math.abs(aa);
            }
            if (corn) {
                bb *= -1;
            }
            a = aa + ca;
            b = bb + cb;
            if (ship) {
                b = Math.abs(bb) + cb;
            }
        } else if (feather) {
            var aa = a * a;
            var bb = b * b;
            var dr = 1.0 + aa;
            var di = bb;
            var z3r = a * a * a - 3 * a * b * b;
            var z3i = 3 * a * a * b - b * b * b;
            var dvr = (z3r * dr + z3i * di) / (dr * dr + di * di);
            var dvi = (z3i * dr - z3r * di) / (dr * dr + di * di);
            a = dvr + ca;
            b = dvi + cb;
        } else if (chirikov) {
            a = a + ca * b;
            b = b + cb * Math.sin(a);
        } else if (ikeda) {
            var t = 0.4 - 6 / (1 + a * a + b * b);
            var sin_t = Math.sin(t);
            var cos_t = Math.cos(t);
            a = 1 + ca * (a * cos_t - b * sin_t);
            b = cb * (a * sin_t + b * cos_t);
        } else if (false) { // heart, todo fix
            var aa = 2 * a * b;
            var bb = Math.pow(Math.abs(b), -98) - Math.pow(Math.abs(a), -98);
            a = aa + ca;
            b = bb + cb;
        } else if (false) { // magnet 1, todo fix
            var zsqr = a * a - b * b;
            var zsqi = 2 * a * b;
            var numr = zsqr + ca - 1;
            var numi = zsqi + cb;
            var z2r = 2 * a;
            var z2i = 2 * b;
            var denr = z2r + ca - 2;
            var deni = z2i + cb;
            var dmag = denr * denr + deni * deni;
            var divr = (numr * denr + numi * deni) / dmag;
            var divi = (numi * denr - numr * deni) / dmag;
            var resr = divr * divr - divi * divi;
            var resi = 2 * divr * divi;
            a = resr;
            b = resi;
        };
        nsm = Math.fround(n + 1) - Math.log(Math.log(Math.abs(Math.sqrt(a * a + b * b))));
        if (a * a + b * b > radius) {
            break;
        }
        n++;
        lastA = a;
        lastB = b;
    }
    if (n == 200) {
        return [0, 0, 0];
    }
    if (smoothcmap) {
        if (classiccmap) {
            nsm = nsm / 200 * Math.PI * 2; // "CLASSIC" COLORMAP
            return [
                Math.floor((0.5 + Math.sin(nsm    ) / 2) * 255),
                Math.floor((0.5 + Math.sin(nsm + 1) / 2) * 255),
                Math.floor((0.5 + Math.sin(nsm + 2) / 2) * 255)
            ]; 
        } else if (rainbowcmap) {
            nsm = nsm / 200 * Math.PI * 2;
            return [
                Math.floor(Math.sin(nsm) * 127 + 128),
                Math.floor(Math.sin(nsm + 2 * Math.PI / 3) * 127 + 128),
                Math.floor(Math.sin(nsm + 4 * Math.PI / 3) * 127 + 128)
            ];
        }
        
    } else {
        var index = n % cl; 
        return [cmap[index][0], cmap[index][1], cmap[index][2]];
    }
    
    
}).setDynamicOutput(true).setDynamicArguments(true).setTactic("balanced").setPrecision("single").setOutput([width, height]);
function toImageData(image) {
    const data = mandelbrotCtx.createImageData(width, height);
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            const index = (y * height + x) * 4;
            const color = image[y][x];
            data.data[index] = color[0];
            data.data[index + 1] = color[1];
            data.data[index + 2] = color[2];
            data.data[index + 3] = 255;
        }
    }
    return data;
}
function renderFractal() {
    const mandelbrot_ = renderFractal_(width, height, manScale, 0, 0, false, mandelbrot, burningShip, celtic, corn, feather, chirikov, ikeda, power, colormap, colormap.length, manOffsX, manOffsY, 100000000, smoothcmap, classiccmap, rainbowcmap);
    mandelbrotCtx.putImageData(toImageData(mandelbrot_), 0, 0);
}
function renderJuliaset(normX, normY) {
    const juliaset = renderFractal_(width, height, julScale, normX, normY, true, mandelbrot, burningShip, celtic, corn, feather, chirikov, ikeda, power, colormap, colormap.length, julOffsX, julOffsY, 100000000, smoothcmap, classiccmap, rainbowcmap);
    juliasetCtx.putImageData(toImageData(juliaset), 0, 0);
}
function setPower(n) {
    power = n;
}
function renderMandelbrot(n) {
    burningShip = false;
    celtic = false;
    corn = false;
    feather = false;
    chirikov = false;
    ikeda = false;
    mandelbrot = true;
    setPower(n);
    renderFractal();
    renderJuliaset(ccx, ccy);
}
function renderBurningShip(n) {
    mandelbrot = false;
    celtic = false;
    corn = false;
    feather = false;
    chirikov = false;
    ikeda = false;
    burningShip = true;
    setPower(n);
    renderFractal();
    renderJuliaset(ccx, ccy);
} 
function renderCeltic(n) {
    mandelbrot = false;
    burningShip = false;
    corn = false;
    feather = false;
    chirikov = false;
    ikeda = false;
    celtic = true;
    setPower(n);
    renderFractal();
    renderJuliaset(ccx, ccy);
}

function renderTricorn(n) {
    mandelbrot = false;
    burningShip = false;
    celtic = false;
    feather = false;
    chirikov = false;
    ikeda = false;
    corn = true;
    setPower(n);
    renderFractal();
    renderJuliaset(ccx, ccy);
} 

function renderFeather() {
    mandelbrot = false;
    burningShip = false;
    celtic = false;
    corn = false;
    chirikov = false;
    ikeda = false;
    feather = true;
    setPower(2);
    renderFractal();
    renderJuliaset(ccx, ccy);
}
function renderChirikov() {
    mandelbrot = false;
    burningShip = false;
    celtic = false;
    corn = false;
    feather = false;
    ikeda = false;
    chirikov = true;
    setPower(2);
    renderFractal();
    renderJuliaset(ccx, ccy);
}
function renderIkeda() {
    mandelbrot = false;
    burningShip = false;
    celtic = false;
    corn = false;
    feather = false;
    chirikov = false;
    ikeda = true;
    setPower(2);
    renderFractal();
    renderJuliaset(ccx, ccy);
}
renderMandelbrot(2);
mandelbrotCanvas.addEventListener("click", (evt) => {
    var x = evt.pageX;
    var y = evt.pageY;
    evt.preventDefault();
    var scale_m = 1;
    if (feather) {
        scale_m = 1.5;
    }
    if (chirikov) {
        scale_m = 2;
    }
    if (power > 2) {
        scale_m = 0.6;
    }
    var normX = ((x / width * 2 - 1) * manScale * scale_m + manOffsX).toFixed(10);
    var normY = ((y / height * 2 - 1) * manScale * scale_m + manOffsY).toFixed(10);
    document.getElementById("juliasetC").innerHTML = "c = (" + normX + " + " + normY + "i)";
    ccx = normX;
    ccy = normY;
    renderJuliaset(normX, normY);
});
mandelbrotCanvas.addEventListener("contextmenu", evt => {
    evt.preventDefault();
});
juliasetCanvas.addEventListener("contextmenu", evt => {
    evt.preventDefault();
});
mandelbrotCanvas.addEventListener("wheel", (evt) => {
    manScale *= (1 + evt.deltaY / 1000);
    evt.preventDefault();
    renderFractal();
    renderJuliaset(ccx, ccy);
});
juliasetCanvas.addEventListener("wheel", (evt) => {
    julScale *= (1 + evt.deltaY / 1000);
    evt.preventDefault();
    renderFractal();
    renderJuliaset(ccx, ccy);
});
var manPrevX = 0;
var manPrevY = 0;
var manPrevI = false;
var manMoveI = 0;
mandelbrotCanvas.addEventListener("mousemove", (evt) => {
    if (!rightclickedMan) {
        return;
    }
    if (!manPrevI) {
        manPrevI = true;
        manPrevX = evt.offsetX;
        manPrevY = evt.offsetY;
        return;
    }
    var scale_m = 1;
    if (feather) {
        scale_m = 1.5;
    }
    if (chirikov) {
        scale_m = 2;
    }
    if (power > 2) {
        scale_m = 0.6;
    }
    var mx = evt.offsetX - manPrevX;
    var my = evt.offsetY - manPrevY;
    manPrevX = evt.offsetX;
    manPrevY = evt.offsetY;
    manOffsX -= ((mx / 200 * 2 - mx / 200) * manScale * scale_m);
    manOffsY -= ((my / 200 * 2 - my / 200) * manScale * scale_m);
    manMoveI++;
    if (manMoveI % 3 == 0) { // REDUCE LAG (lmao idc)
        renderFractal();
    }
});
var julPrevX = 0;
var julPrevY = 0;
var julPrevI = false;
var julMoveI = 0;
juliasetCanvas.addEventListener("mousemove", (evt) => {
    if (!rightclickedJul) {
        return;
    }
    if (!julPrevI) {
        julPrevI = true;
        julPrevX = evt.offsetX;
        julPrevY = evt.offsetY;
        return;
    }
    var scale_m = 1;
    if (feather) {
        scale_m = 1.5;
    }
    if (chirikov) {
        scale_m = 2;
    }
    if (power > 2) {
        scale_m = 0.6;
    }
    var jx = evt.offsetX - julPrevX;
    var jy = evt.offsetY - julPrevY;
    julPrevX = evt.offsetX;
    julPrevY = evt.offsetY;
    julOffsX -= ((jx / 200 * 2 - jx / 200) * julScale * scale_m);
    julOffsY -= ((jy / 200 * 2 - jy / 200) * julScale * scale_m);
    julMoveI++;
    if (julMoveI % 3 == 0) { // REDUCE LAG (lmao idc)
        renderJuliaset(ccx, ccy);
    }
});
mandelbrotCanvas.addEventListener("mousedown", (evt) => {
    if (evt.button == 2) {
        rightclickedMan = true;
    } 
});
mandelbrotCanvas.addEventListener("mouseup", (evt) => {
    if (evt.button == 2) {
        rightclickedMan = false;
        manPrevI = false;
    } 
});
mandelbrotCanvas.addEventListener("mouseleave", (evt) => {
    rightclickedMan = false;
    manPrevI = false;
});
juliasetCanvas.addEventListener("mousedown", (evt) => {
    if (evt.button == 2) {
        rightclickedJul = true;
    } 
});
juliasetCanvas.addEventListener("mouseup", (evt) => {
    if (evt.button == 2) {
        rightclickedJul = false;
        julPrevI = false;
    } 
});
juliasetCanvas.addEventListener("mouseleave", (evt) => {
    rightclickedJul = false;
        julPrevI = false;
});
document.getElementById("cxvalue").innerHTML = 0;
document.getElementById("cyvalue").innerHTML = 0;
document.getElementById("sizevalue").innerHTML = width;
document.getElementById("powervalue").innerHTML = 2;
document.getElementById("cx").min = -julScale;
document.getElementById("cx").max = julScale;
document.getElementById("cy").min = -julScale;
document.getElementById("cy").max = julScale;
document.getElementById("cxn").min = -julScale;
document.getElementById("cxn").max = julScale;
document.getElementById("cyn").min = -julScale;
document.getElementById("cyn").max = julScale;
document.getElementById("cx").oninput = function() {
    document.getElementById("cxvalue").innerHTML = this.value;
    ccx = this.value;
    renderJuliaset(ccx, ccy);
    document.getElementById("juliasetC").innerHTML = "c = (" + ccx + " + " + ccy + "i)";
}
document.getElementById("cy").oninput = function() {
    document.getElementById("cyvalue").innerHTML = this.value;
    ccy = this.value;
    renderJuliaset(ccx, ccy);
    document.getElementById("juliasetC").innerHTML = "c = (" + ccx + " + " + ccy + "i)";
}

document.getElementById("size").oninput = function() {
    document.getElementById("sizevalue").innerHTML = this.value;
    width = height = this.value;
    mandelbrotCanvas.width = juliasetCanvas.width = width;
    mandelbrotCanvas.height = juliasetCanvas.height = height;
    renderFractal_.setOutput([width, height]);
    renderFractal();
    renderJuliaset(ccx, ccy);
}
document.getElementById("power").oninput = function() {
    document.getElementById("powervalue").innerHTML = this.value;
    power = this.value;
    renderFractal();
    renderJuliaset(ccx, ccy);
    document.getElementById("julPow").innerHTML = power;
    document.getElementById("fracPow").innerHTML = power;
}
function updateCxBtn() {
    ccx = document.getElementById("cxn").value;
    document.getElementById("juliasetC").innerHTML = "c = (" + ccx + " + " + ccy + "i)";
    renderJuliaset(ccx, ccy);
}
function updateCyBtn() {
    ccy = document.getElementById("cyn").value;
    document.getElementById("juliasetC").innerHTML = "c = (" + ccx + " + " + ccy + "i)";
    renderJuliaset(ccx, ccy);
}
// UNUSED ANIMATION CODE BEGIN
var vx = -2.5;
var vy = -2.5;
var images = [];
var dataURLs = []; 
var increase = 0.005;
// width = height = 1000;
// juliasetCanvas.width = width;
// juliasetCanvas.height = height;
// renderFractal_.setOutput([width, height]);
function saveFrames() {
    var zip = new JSZip();
    var vfi = 0;
    dataURLs.forEach((url) => {
        zip.file("frame_" + vfi.toString().padStart(4, "0") + ".png", url.split(",")[1], { base64: true });
        vfi++;
    });
    zip.generateAsync({ type: "blob" }).then((content) => {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = "fractal_frames.zip";
        a.click();
        URL.revokeObjectURL(a.href);
        a.remove();
    });
}
var vi = 0;
function toDataURLs() {
    juliasetCtx.putImageData(images[vi], 0, 0);
    var dataURL = juliasetCanvas.toDataURL();
    dataURLs.push(dataURL);
    vi++;
    if (vi == images.length - 1) {
        saveFrames();
        return;
    }
    requestAnimationFrame(toDataURLs);
}
function outInEasing(t) {
    if (t < 0.5) {
        return 2 * t * t;
    } else {
        return 1 - 2 * (1 - t) * (1 - t);
    }
}
var angle = 0;
function renderFrames() {
    const vxfromangle = 0.7885 * Math.cos(angle);
    const vyfromangle = 0.7885 * Math.sin(angle);
    const juliaset = renderFractal_(width, height, 2.5, vxfromangle, vyfromangle, true, false, false, false, false, true, false, false, false, colormap, colormap.length).toArray();
    var vimg = toImageData(juliaset);
    images.push(vimg);
    juliasetCtx.putImageData(vimg, 0, 0);
    // vx += increase;
    // vy += increase;
    angle += increase;
    console.log(angle);
    // if (vx >= 2.5 || vy >= 2.5) {
    //     toDataURLs();
    //     return;
    // }
    if (angle >= Math.PI * 2) {
        toDataURLs();
        return;
    }
    requestAnimationFrame(renderFrames);
}
// renderFrames();
// UNUSED ANIMATION CODE END