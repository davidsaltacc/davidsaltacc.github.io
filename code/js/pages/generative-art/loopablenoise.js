var sliderIds = ["noisescale", "fbmamplitude", "fbmfrequency", "fbmoctavecount", "fbmpersistence", "fbmlacunarity", "dwarpnumwarps", "dwarpfalloff", "dwarpscale", "cmapred", "cmapgreen", "cmapblue", "framepercentincrease", "fps"];
var sliderElements = [];
var sliderValues = {};
sliderIds.forEach((id) => {
	sliderElements.push(document.getElementById(id));
});
sliderElements.forEach((slider) => {
	document.getElementById(slider.id + "value").innerHTML = slider.value;
	sliderValues[slider.id] = Number(slider.value);
	slider.oninput = function() {
		document.getElementById(this.id + "value").innerHTML = this.value;
		sliderValues[this.id] = Number(this.value);
	}
})
var seed = Math.random()
document.getElementById("seedvalue").innerHTML = Math.floor(seed * 65536); 
noise.seed(seed);
function degToRad(deg) {
    return deg * Math.PI / 180;
}
function colormap(v) {
    var vr = Math.round(v * sliderValues["cmapred"]),
        vg = Math.round(v * sliderValues["cmapgreen"]),
        vb = Math.round(v * sliderValues["cmapblue"]);
    return "rgb(" + vr + ", " + vg + ", " + vb + ")";
}
function fbm(a, x, y) {
	var amplitude = sliderValues["fbmamplitude"];
	var frequency = sliderValues["fbmfrequency"];
	var octaveCount = sliderValues["fbmoctavecount"];
	var persistence = sliderValues["fbmpersistence"];
	var lacunarity = sliderValues["fbmlacunarity"];
	var val = 0;
	var max = 0;
	for (i = 0; i < octaveCount; i++) {
		val += amplitude * noise.simplex2dLoopable(a, x * frequency, y * frequency);
		max += amplitude;
		amplitude *= persistence;
		frequency *= lacunarity;
	}
	return val / max;
}
function mainNoiseFunction(a, x, y) {
    return fbm(a, x, y)
}
function domainWarp(a, x, y) {
	var numWarps = sliderValues["dwarpnumwarps"];
	var falloff = sliderValues["dwarpfalloff"];
	var scale = sliderValues["dwarpscale"];
	for (var i = 0; i < numWarps; i++) {
		const dx = scale * mainNoiseFunction(a, x + 100, y + 100); // diff noises for xy, better domain warping effect
		const dy = scale * mainNoiseFunction(a, x - 100, y - 100);
		x += dx;
		y += dy;
		scale *= falloff;
	}
	return [x, y];
}
function getValue(a, x, y) {
	[x, y] = domainWarp(a, x, y);
	var value = mainNoiseFunction(a, x, y);
    return value;
}
var canvas = document.getElementById("canvas");
var canvasSize = 600;
var width = canvasSize,
    height = canvasSize;
document.getElementById("size").oninput = function() {
    width = canvas.width = canvasSize = this.value;
    height = canvas.height = canvasSize = this.value;
}

function renderAndExportWithGif(zip, callback) {
    var canvas = document.getElementById("canvas"),
        context = canvas.getContext("2d", { willReadFrequently: true }),
        width = canvas.width = canvasSize,
        height = canvas.height = canvasSize,
        scale = sliderValues["noisescale"],
        degIncrease = sliderValues["framepercentincrease"], // 2.3 deg = 0.04 rad
        images = [],
        a = 0,
        toGifSettings = {},
        progress = document.getElementById("progress"),
        maxProg = (Math.PI * 2).toFixed(3);
    
    function* renderLoop() { // generator for dom updates, is useful sometimes
        for (var a = 0; a < Math.PI * 2; a += degToRad(degIncrease)) {
            for (var y = 0; y < height; y++) {
                for (var x= 0; x < width; x++) {
                    var v = (getValue(a, x * scale, y * scale) + 1) / 2;
                    context.fillStyle = colormap(v);
                    context.fillRect(x, y, 1, 1);
                }
                yield;
            }
            images.push(canvas.toDataURL("image/png"));
            progress.innerHTML = "progress: " + a.toFixed(3) + " / " + maxProg;
            yield;
        }
        for (var i = 0; i < images.length; i++) {
            var fname = "frame_" + i.toString().padStart(5, "0") + ".png";
            zip.file(fname, images[i].split(",")[1], { base64: true });
        }
        progress.innerHTML = "progress: merging into gif...";
        callback(images);
    }
    const loopGenerator = renderLoop();
    function update() {
		loopGenerator.next();
		if (!loopGenerator.done) {
			requestAnimationFrame(update);
		}
	}
	requestAnimationFrame(update);
}
function dataURLToImage(dataURL) {
    var image = new Image();
    image.src = dataURL;
    return image;
}
function generateAnimatedGif(dataURLs, frameDuration, callback) {
    fetch("../../assets/merged_frames.gif").then(function(response) { return response.arrayBuffer(); }).then(function(text) { callback(text); });
    return;
    var gif_;
    fetch("https://cdn.jsdelivr.net/gh/jnordberg/gif.js/dist/gif.worker.js").then((response) => {
        return response.blob();
    }).then(function(workerUrl) {
        var gif = new GIF({
            workers: 6, // MORE WORKERS ITS SO SLOW
            workerScript: URL.createObjectURL(workerUrl),
            quality: 10,
            width: width,
            height: height
        });
        var cv = document.createElement("canvas");
        var ctx = canvas.getContext("2d", { willReadFrequently: true });
        cv.width = width;
        cv.height = height;
        dataURLs.forEach((dataURL) => {
            var image = dataURLToImage(dataURL);
            ctx.drawImage(image, 0, 0);
            gif.addFrame(ctx, { delay: frameDuration, copy: true});
        });
        cv.remove();
        callback(gif);
    });
}
function renderAndExport() { // really. i know its the worst shit code ive ever written. its so fucking late. ive been sitting at this for so long. and its not even working.
    var zip = new JSZip();
    renderAndExportWithGif(zip, function(frames) {
        generateAnimatedGif(frames, 1000 / sliderValues["fps"], (gif) => {
            //gif.on("finished", (blob) => {
                zip.file("merged_frames.gif", gif); // placeholder gif bcs my code dont work
                zip.generateAsync({ type: "blob" }).then(function (content) {
                    var a = document.createElement("a");
                    a.href = URL.createObjectURL(content);
                    a.download = "frames_and_merged.zip";
                    a.click();
                    URL.revokeObjectURL(a.href);
                    a.remove();
                });
            //});
            //gif.render();
        });
    });
}