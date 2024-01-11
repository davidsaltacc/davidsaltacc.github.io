
struct VertexOutput {
	@builtin(position) position: vec4<f32>,
	@location(0) fragmentPosition: vec2<f32>,
}

struct Uniforms {
	center: vec2<f32>,
	canvasDimensions: vec2<f32>,
	zoom: f32,
	a: f32,
	b: f32,
	c: f32,
	d: f32,
	e: f32,
	f: f32,
	g: f32,
	h: f32,
	i: f32,
	j: f32,
	maxIterations: u32,
    radius: u32,
	sampleCount: u32
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

const pi: f32 = 3.1415926535897932;

@vertex
fn vertex(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
	var output: VertexOutput;
	var positions: array<vec2<f32>, 4> = array<vec2<f32>, 4>(
		vec2<f32>(1.0, -1.0),
		vec2<f32>(1.0, 1.0),
		vec2<f32>(-1.0, -1.0),
		vec2<f32>(-1.0, 1.0),
	);
	let position2d: vec2<f32> = positions[vertexIndex];
	output.position = 0.5 * vec4<f32>(position2d, 0.0, 1.0);
	output.fragmentPosition = position2d;
	return output;
}

fn rand(c: vec2<f32>) -> f32 {
	return fract(sin(dot(c, vec2<f32>(12.9898, 78.233))) * 43758.547);
} 

@fragment
fn fragment(input: VertexOutput) -> @location(0) vec4<f32> { 

	var a: f32 = uniforms.a;
	var b: f32 = uniforms.b;
	var c: f32 = uniforms.c;
	var d: f32 = uniforms.d;
	var e: f32 = uniforms.e;
	var f: f32 = uniforms.f;
	var g: f32 = uniforms.g;
	var h: f32 = uniforms.h;
	var i: f32 = uniforms.i;
	var j: f32 = uniforms.j;

	var sampleCount: f32 = f32(uniforms.sampleCount);

	var rc: vec2<f32> = input.fragmentPosition / uniforms.zoom + uniforms.center;
    
	var color: vec3<f32> = vec3<f32>(0., 0., 0.);  

	for (var sample: f32 = 0.0; sample < sampleCount; sample += 1) {
		var pos: vec2<f32> = vec2<f32>(
			rand(rc + sample),
			rand(100. + rc + sample)
		) / uniforms.zoom / uniforms.canvasDimensions;
		pos += rc;
		var cx: f32 = pos.x;
		var cy: f32 = -pos.y;
		var cz: f32 = a;
		var cr: f32 = b;
		for (var it: u32 = 0; it < uniforms.maxIterations; it++) {
			var fi: f32 = f32(it);
			var r2: f32 = cx * cx + cy * cy + cz * cz;
			if (r2 > f32(uniforms.radius)) {
				break;
			} 
			var th: f32 = atan2(sqrt(cx * cx + cy * cy + h * (cz * cz)), cz * f);
			var ph: f32 = atan2(cy, cx) * g + cz * i;
			var div: f32 = 1.;
			if (j != 0) {
				div = th * j;
			}
			var r: f32 = cr * pow(r2, e / c) / div;
			cx = r * sin(th * c + fi / d) * cos(ph * c + fi / d) + cx;
			cy = r * sin(th * c + fi / d) * sin(ph * c + fi / d) + cy;
			cz = r * cos(th * c + fi / d) + cz;
		}
		color += vec3(cx, cy, cz);
	}
	
    return vec4<f32>(
		color / sampleCount,
		1.0
	);
}

