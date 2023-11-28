var sliderIds = ["noisescale", "fbmamplitude", "fbmfrequency", "fbmoctavecount", "fbmpersistence", "fbmlacunarity", "dwarpnumwarps", "dwarpfalloff", "dwarpscale", "cmapred", "cmapgreen", "cmapblue"];
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
});
function showHelp() {
	document.getElementsByClassName("helpmenumodal")[0].style.display = "block";
}
function closeHelp() {
	document.getElementsByClassName("helpmenumodal")[0].style.display = "none";
}
window.onclick = function(event) {
	if (event.target == document.getElementsByClassName("helpmenumodal")[0]) {
		closeHelp();
	}
}
var canvas = document.getElementById("canvas"),
    context = canvas.getContext("2d"),
    width = canvas.width = window.innerWidth,
    height = canvas.height = window.innerHeight;
var usecustomcmap = false;
// document.getElementById('usecustomcmap').innerHTML = usecustomcmap;
var seed = Math.random()
document.getElementById("seedvalue").innerHTML = Math.floor(seed * 65536); 
noise.seed(seed);
var gz = 0;
var colormap = setCustomColormap(true);
var defaultcolormap = colormap;
var rendering = false;
usecustomcmap = true;
setCustomColormap(true);
function render() {
	if (rendering) {
		return;
	}
	rendering = true;
	document.getElementById("rerenderButton").innerHTML = "Rendering in progress...";
	setTimeout(function() { // force dom update so button text updates
		for (var x = 0; x < width; x++) {
			for (var y = 0; y < height; y++) {
				var col = getWarpedColor(mainNoiseFunction, x, y, gz);
				context.fillStyle = "#" + ((col[0] << 16) + (col[1] << 8) + col[2]).toString(16);
				context.fillRect(x, y, 1, 1);
			}
		}
		rendering = false;
		document.getElementById("rerenderButton").innerHTML = "Rerender";
	}, 0);
	// gz += 50;
    // requestAnimationFrame(render);
}

function renderWithUpdates() { // bad code but works, updates the canvas while rendering
	if (rendering) {
		return;
	} else {
		rendering = true;
		document.getElementById("rerenderButton").innerHTML = "Rendering in progress...";
	}
	function* drawLoop() {
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				const col = getWarpedColor(mainNoiseFunction, x, y, gz);
				context.fillStyle = "#" + ((col[0] << 16) + (col[1] << 8) + col[2]).toString(16).padStart(6, "0");
				context.fillRect(x, y, 1, 1);
			}
			yield;
		}
		rendering = false;
		document.getElementById("rerenderButton").innerHTML = "Rerender";
	}
	const loopGenerator = drawLoop();
	function updateCanvas() {
		loopGenerator.next();
		if (!loopGenerator.done) {
			requestAnimationFrame(updateCanvas);
		}
	}
	requestAnimationFrame(updateCanvas);
}

function exportCanvas() { 
	var image = canvas.toDataURL("image/png");
	var a = document.createElement("a");
	a.href = image;
	a.download = "noise";
	a.click();
	a.remove();
}

function setCustomColormap(enabled) {
	if (enabled) {
		colormap = function(v) {
			return [parseInt(v * sliderValues["cmapred"]), parseInt(v * sliderValues["cmapgreen"]), parseInt(v * sliderValues["cmapblue"])];
		}
		return;
	}
	colormap = defaultcolormap;
}
function getValue(x, y, z) {
	return noise.simplex3d(x * sliderValues["noisescale"], y * sliderValues["noisescale"], z * sliderValues["noisescale"]);
}
function mainNoiseFunction(x, y, z) {
	return fbm(getValue, x, y, z);
}

function getColorAtPosition(func, x, y, z) {
	const value = (1 + func(x, y, z)) / 2;
	return colormap(value); // step(20, value) for a interesting effect
}
function getWarpedColor(func, x, y, z) {
	[x, y, z] = domainWarp(func, x, y, z);
	return getColorAtPosition(func, x, y, z);
}
function fbm(func, x, y, z, amplitude, frequency, octaveCount, persistence, lacunarity) {
	var amplitude = amplitude || sliderValues["fbmamplitude"];
	var frequency = frequency || sliderValues["fbmfrequency"];
	var octaveCount = octaveCount || sliderValues["fbmoctavecount"];
	var persistence = persistence || sliderValues["fbmpersistence"];
	var lacunarity = lacunarity || sliderValues["fbmlacunarity"];
	var val = 0;
	var max = 0;
	for (i = 0; i < octaveCount; i++) {
		val += amplitude * func(x * frequency, y * frequency, z * frequency);
		max += amplitude;
		amplitude *= persistence;
		frequency *= lacunarity;
	}
	return val / max;
}
function domainWarp(func, x, y, z, numWarps, falloff, scale) {
	var numWarps = numWarps || sliderValues["dwarpnumwarps"];
	var falloff = falloff || sliderValues["dwarpfalloff"];
	var scale = scale || sliderValues["dwarpscale"];
	for (var i = 0; i < numWarps; i++) {
		const dx = scale * func(x, y, z);
		const dy = scale * func(-x, -y, z);
		x += dx;
		y += dy;
		scale *= falloff;
	}
	return [x, y, z];
}
function step(n, v) { // bad but it works
	var stepsize = 1 / n;
	for (var i = 0; i < 1; i += stepsize) {
		if (v >= i && v < i + stepsize) {
			return i;
		}
	}
}