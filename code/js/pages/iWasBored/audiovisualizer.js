var WAVEFORM_AMPLIFIER = 1;
var FFT_SIZE = 1024;
var WAVEFORM_LINEWIDTH = 3;
var FADEOUT = 1;
var container = document.getElementById("container");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.addEventListener("resize", (e) => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
})
navigator.mediaDevices.getUserMedia({ "audio": true }).then((microphone) => {
	
	var audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // MICROPHONE
	var audioSource = audioCtx.createMediaStreamSource(microphone);
	var analyser = audioCtx.createAnalyser();
	audioSource.connect(analyser);
	
	analyser.fftSize = FFT_SIZE;
	
	var bufferLength = analyser.frequencyBinCount;
	var dataArray = new Uint8Array(bufferLength);
	var barWidth = canvas.width / bufferLength;
	function frequencybars() {
		
		analyser.getByteFrequencyData(dataArray);
		var x = 0;
		for (var i = 0; i < bufferLength; i++) {
			var barHeight = dataArray[i] / 128;
			ctx.fillStyle = `rgb(${barHeight * 255}, ${barHeight * 30 + 20}, ${barHeight * 30 + 20})`;
			ctx.fillRect(x, canvas.height - barHeight * (canvas.height / 4), barWidth, barHeight * (canvas.height / 4));
			x += barWidth;
		}
	}
	function waveform() {
		analyser.getByteTimeDomainData(dataArray);
		
		ctx.beginPath();
		ctx.lineWidth = WAVEFORM_LINEWIDTH;
		var s = Math.min(canvas.width, canvas.height);
		var radius = s / 2 - s / 8;
		var centerX = canvas.width / 2;
		var centerY = canvas.height / 2;
		for (var i = 0; i < dataArray.length; i++) {
			var v = (dataArray[i] / 128) ** WAVEFORM_AMPLIFIER;
			var angle = (Math.PI * 2 * i) / dataArray.length;
			var r = radius * v;
			var x = centerX + r * Math.cos(angle + Math.PI / 2);
			var y = centerY + r * Math.sin(angle + Math.PI / 2);
			if (i === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		}
		var x = centerX + r * Math.cos(Math.PI * 2 + Math.PI / 2);
		var y = centerY + r * Math.sin(Math.PI * 2 + Math.PI / 2);
		ctx.lineTo(x, y);
		ctx.closePath();
		ctx.strokeStyle = "rgba(200, 50, 50)";
		ctx.stroke();
	}
	function waveform_smoothed() {
		analyser.getByteTimeDomainData(dataArray);
		
		ctx.lineWidth = WAVEFORM_LINEWIDTH;
		ctx.strokeStyle = "rgba(200, 50, 50, 1)";
		var s = Math.min(canvas.width, canvas.height);
		var radius = s / 2 - s / 8;
		var centerX = canvas.width / 2;
		var centerY = canvas.height / 2;
		var points = [];
		for (var i = 0; i < dataArray.length; i++) {
			var v = (dataArray[i] / 128) ** WAVEFORM_AMPLIFIER;
			var angle = (Math.PI * 2 * i) / dataArray.length;
			var r = radius * v;
			var x = centerX + r * Math.cos(angle + Math.PI / 2);
			var y = centerY + r * Math.sin(angle + Math.PI / 2);
			points.push([x, y]);
		}
		bezier(points, 0.2, 1);
	}
	function visualize() {
		requestAnimationFrame(visualize);
		ctx.fillStyle = `rgba(0, 0, 0, ${FADEOUT})`;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		frequencybars();
		waveform();
	}
	visualize();
});