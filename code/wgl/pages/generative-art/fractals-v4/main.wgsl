struct VertexOutput {
	@builtin(position) position: vec4<f32>,
	@location(0) fragmentPosition: vec2<f32>,
}

struct Uniforms {
	center: vec2<f32>,
	juliasetConstant: vec2<f32>,
	canvasDimensions: vec2<f32>,
	zoom: f32,
    radius: f32,
    power: f32,
    colorOffset: f32,
    juliasetInterpolation: f32,
	colorfulness: f32,
	cloudSeed: f32,
	cloudAmplitude: f32,
	cloudMultiplier: f32,
	maxIterations: u32,
	sampleCount: u32,
	juliaset: u32 // no uniform bools 
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

const pi: f32 = 3.1415926535897932384626433832795;
const e: f32 = 2.7182818284590452353602874713527;
const ln2: f32 = 0.6931471805599453094172321214581;
const phi: f32 = (sqrt(5.) - 1.) / 2.;

fn complex(r: f32, i: f32) -> vec2<f32> {
	return vec2<f32>(r, i);
}

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
	output.position = vec4<f32>(position2d, 0.0, 1.0);
	output.fragmentPosition = position2d;
	return output;
}

fn magnitude(z: vec2<f32>) -> f32 {
    return sqrt(z.x * z.x + z.y * z.y);
}
fn square(x: f32) -> f32 {
    return x * x;
}

fn c_sin(z: vec2<f32>) -> vec2<f32> {
    return vec2(sin(z.x) * cosh(z.y), cos(z.x) * sinh(z.y));
}
fn c_sinh(z: vec2<f32>) -> vec2<f32> {
	return vec2<f32>(sinh(z.x) * cos(z.y), cosh(z.x) * sin(z.y));
} 
fn c_cos(z: vec2<f32>) -> vec2<f32> {
	return vec2<f32>(cos(z.x) * cosh(z.y), -sin(z.x) * sinh(z.y));
} 
fn c_cosh(z: vec2<f32>) -> vec2<f32> {
	return vec2<f32>(cosh(z.x) * cos(z.y), sinh(z.x) * sin(z.y));
} 
fn c_tan(z: vec2<f32>) -> vec2<f32> {
	let cosx: f32 = cos(z.x);
	let sinx: f32 = sin(z.x);
	let sinhy: f32 = sinh(z.y);
	let coshy: f32 = cosh(z.y);
	let d: f32 = cosx * coshy - sinx * sinhy;
	var re: f32 = sinx * coshy / d;
	var im: f32 = cosx * sinhy / d;
	return vec2<f32>(re, im);
} 
fn c_tanh(z: vec2<f32>) -> vec2<f32> {
	return c_division(c_sinh(z), c_cosh(z));
} 
fn c_log(z: vec2<f32>) -> vec2<f32> {
	var re: f32 = sqrt(z.x * z.x + z.y * z.y);
	var im: f32 = atan2(z.y, z.x);
	if (im > pi) {
		im = im - 2. * pi;
	}
	return vec2<f32>(log(re), im);
} 
fn c_sqrt(z: vec2<f32>) -> vec2<f32> {
	let r: f32 = length(z);
	let re: f32 = sqrt(0.5 * (r + z.x));
	var im: f32 = sqrt(0.5 * (r - z.x));
	if (z.y < 0.) {
		im = -im;
	}
	return vec2<f32>(re, im);
} 
fn c_abs(z: vec2<f32>) -> vec2<f32> {
	return vec2<f32>(abs(z.x), abs(z.y));
} 
fn c_inv(c: vec2<f32>) -> vec2<f32> {
	let n: f32 = length(c);
	return vec2<f32>(c.x, -c.y) / (n * n);
}

fn c_exp(z: vec2<f32>) -> vec2<f32> {
	var w: vec2<f32> = vec2<f32>(cos(z.y), sin(z.y));
	w = w * exp(z.x);
	return w;
} 

fn c_atan(c: vec2<f32>) -> vec2<f32> {
	var i: vec2<f32> = vec2<f32>(0., 1.);
	let o: vec2<f32> = vec2<f32>(1., 0.);
	let t: vec2<f32> = o + o;
	if (c.x == i.x && c.y == i.y) {
		return vec2<f32>(0., 1. / 0.0000000001);
	} else { 	
		if (c.x == -i.x && c.y == -i.y) {
			return vec2<f32>(0., -1. / 0.0000000001);
		}
	}
	return c_division(c_log(o + c_multiplication(i, c)) - c_log(o - c_multiplication(i, c)), c_multiplication(t, i));
} 

fn c_asin(c: vec2<f32>) -> vec2<f32> {
	var i: vec2<f32> = vec2<f32>(0., 1.);
	var one: vec2<f32> = vec2<f32>(1., 0.);
	return c_multiplication(-i, c_log(c_sqrt(vec2<f32>(1., 0.) - c_multiplication(c, c)) + c_multiplication(i, c)));
} 

fn c_acos(c: vec2<f32>) -> vec2<f32> {
	let i: vec2<f32> = vec2<f32>(0., 1.);
	return c_multiplication(-i, c_log(c_multiplication(i, c_sqrt(vec2<f32>(1., 0.) - c_multiplication(c, c))) + c));
} 

fn c_asinh(c: vec2<f32>) -> vec2<f32> {
	var one: vec2<f32> = vec2<f32>(1., 0.);
	return c_log(c + c_sqrt(one + c_multiplication(c, c)));
} 

fn c_acosh(c: vec2<f32>) -> vec2<f32> {
	var one: vec2<f32> = vec2<f32>(1., 0.);
	var two: vec2<f32> = one + one;
	return c_multiplication(two, c_log(c_sqrt(c_division(c + one, two)) + c_sqrt(c_division(c - one, two))));
} 

fn c_atanh(c: vec2<f32>) -> vec2<f32> {
	let one: vec2<f32> = vec2<f32>(1., 0.);
	let two: vec2<f32> = one + one;
	if (c.x == one.x && c.y == one.y) {
		return vec2<f32>(1. / 0.0000000001, 0.);
	} else { 	
		if (c.x == -one.x && c.y == -one.y) {
			return vec2<f32>(-1. / 0.0000000001, 0.);
		}
	}
	return c_division(c_log(one + c) - c_log(one - c), two);
}

fn weierstrass(x: f32) -> f32 {
	var x_var = x;
	x_var = x_var * (2.);
	return cos(x_var) + cos(3. * x_var) / 2. + cos(9. * x_var) / 4. + cos(27. * x_var) / 8. + cos(81. * x_var) / 16. + cos(243. * x_var) / 32.;
} 

fn to_polar(z: vec2<f32>) -> vec2<f32> {
	let r: f32 = length(z);
	let theta: f32 = atan2(z.y, z.x);
	return vec2<f32>(r, theta);
} 
fn c_pow(z: vec2<f32>, n: f32) -> vec2<f32> {
	let polar: vec2<f32> = to_polar(z);
	let r: f32 = pow(polar.x, n);
	let theta: f32 = n * polar.y;
	return r * vec2<f32>(cos(theta), sin(theta));
}
fn c_cpow(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    var at2: f32 = atan2(a.y, a.x);
	var a2: vec2<f32> = vec2<f32>(a.x / 2., a.y / 2.);
    var loh: f32 = 0.5 * log(a2.x * a2.x + a2.y * a2.y) + ln2;
    var x: f32 = exp(b.x * loh - b.y * at2);
    var y: f32 = b.y * loh + b.x * at2;
    return vec2<f32>(
        x * cos(y),
        x * sin(y)
    );
}

fn c_division(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
	return vec2<f32>((a.x * b.x + a.y * b.y) / (b.x * b.x + b.y * b.y), (a.y * b.x - a.x * b.y) / (b.x * b.x + b.y * b.y));
} 
fn c_multiplication(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
	return vec2<f32>(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
} 

fn c_collatz(z: vec2<f32>) -> vec2<f32> {
	return 0.25 * (vec2<f32>(1., 0.) + 4. * z - c_multiplication(1. + 2. * z, c_cos(pi * z)));
} 

fn apply_post_function(z: vec2<f32>) -> vec2<f32> {
	///POST_FUNC
}

fn iterate(z: vec2<f32>, c: vec2<f32>, power: f32) -> vec2<f32> {
	///ITER_FUNC
}

fn lerp(a: f32, b: f32, t: f32) -> f32 {
	return (1. - t) * a + t * b;
} 

fn smooth_iters(i: u32, z: vec2<f32>, last_z: vec2<f32>) -> f32 {
    return f32(i) + log(uniforms.radius / magnitude(last_z)) / log(magnitude(z) / magnitude(last_z));
}

fn cubic_interpolation(a: f32, b: f32, c: f32, d: f32, x: f32) -> f32 {
	return b + x * (0.5 * c - 0.5 * a) + x * x * (a - 2.5 * b + 2. * c - 0.5 * d) + x * x * x * (-0.5 * a + 1.5 * b - 1.5 * c + 0.5 * d);
} 

fn color_interpolate(color0: vec3<f32>, color1: vec3<f32>, color2: vec3<f32>, color3: vec3<f32>, x: f32) -> vec4<f32> {
	return vec4<f32>(cubic_interpolation(color0.r, color1.r, color2.r, color3.r, x), cubic_interpolation(color0.g, color1.g, color2.g, color3.g, x), cubic_interpolation(color0.b, color1.b, color2.b, color3.b, x), 1.);
} 

fn color_lerp(c0: vec3<f32>, c1: vec3<f32>, x: f32) -> vec4<f32> {
	return vec4<f32>(lerp(c0.r, c1.r, x), lerp(c0.g, c1.g, x), lerp(c0.b, c1.b, x), 1.);
} 

fn colorscheme(x: f32) -> vec4<f32> {
	///COLORSCHEME
}

fn rand2d(pos: vec2<f32>) -> f32 {

	var p: vec2<f32> = vec2<f32>(pos.x % 1000, pos.y % 1000);
	return fract(sin(dot(p.xy, vec2<f32>(12.9898, 78.233))) * uniforms.cloudSeed);
}

fn sm_noise(pos: vec2<f32>) -> f32 {
	var i: vec2<f32> = floor(pos);
	var f: vec2<f32> = fract(pos);
	var a: f32 = rand2d(i);
	var b: f32 = rand2d(i + vec2<f32>(1., 0.));
	var c: f32 = rand2d(i + vec2<f32>(0., 1.));
	var d: f32 = rand2d(i + vec2<f32>(1., 1.));
	var u: vec2<f32> = f * f * (3. - 2. * f);
	return mix(a, b, u.x) + 
		(c - a) * u.y * (1. - u.x) +
		(d - b) * u.x * u.y - .5;
}

fn clouds(pos: vec2<f32>) -> f32 {

	var p: vec2<f32> = pos + 5.;
	var v: f32 = 0.;
	if (uniforms.cloudAmplitude == 0.) {
		return 0.;
	}
	var a: f32 = uniforms.cloudAmplitude * (1.3 - uniforms.cloudMultiplier);
	for (var i: i32; i < 20; i++) {
		v += a * sm_noise(p);
		var m: mat2x2<f32> = mat2x2<f32>(
			vec2<f32>(1.2, 0.9),
			vec2<f32>(-0.9, 1.2)
		);
		p = m * p;
		a *= uniforms.cloudMultiplier;
	}
	return v;
}

fn color(x: f32, pos: vec2<f32>) -> vec4<f32> {
	return colorscheme(x * uniforms.colorfulness * (f32(uniforms.maxIterations) / 100.) + clouds(pos) + uniforms.colorOffset);
} 

fn ms_rand(c: vec2<f32>) -> f32 {
	return fract(sin(dot(c, vec2<f32>(12.9898, 78.233))) * 43758.547);
} 

@fragment
fn fragment(input: VertexOutput) -> @location(0) vec4<f32> { 
	var pos: vec2<f32> = input.fragmentPosition / uniforms.zoom + uniforms.center;
	var rcolor: vec4<f32> = vec4<f32>(0., 0., 0., 0.);  
	var sampleCount: f32 = f32(uniforms.sampleCount);

	for (var sample: f32 = 0.0; sample < sampleCount; sample += 1) {
		var c: vec2<f32> = vec2<f32>(
			ms_rand(pos + sample),
			ms_rand(100. + pos + sample)
		) / uniforms.zoom / uniforms.canvasDimensions;
		c += pos;

		c = vec2<f32>(c.x, -c.y);
		var z: vec2<f32> = c;
		var last_z: vec2<f32> = z;
		var iteration: u32 = 0;
		var maxIterations: u32 = uniforms.maxIterations;
		var zx2: f32;
		var zy2: f32;
		var color_v: f32;
		var color_black: bool = false;
		var distance_to_orbit_trap: f32 = 100000000.;
		var stripe: f32 = 0.;
		var radius: f32 = uniforms.radius;
		var power: f32 = uniforms.power;

		if (uniforms.juliaset == 1) {
			var jconst: vec2<f32> = uniforms.juliasetConstant;
			if (uniforms.juliasetInterpolation == 1.) {
				c = vec2<f32>(jconst.x, jconst.y * -1.);
			} else if (uniforms.juliasetInterpolation == 0.) {
				c = z;
			} else {
				c = (1. - uniforms.juliasetInterpolation) * z + uniforms.juliasetInterpolation * vec2<f32>(jconst.x, jconst.y * -1.);
			}
		}

		for (; iteration <= maxIterations; iteration++) {

			z = iterate(z, c, power); 

			///COLORING_METHOD
			
			last_z = z;
		}

		if (color_black) {
			rcolor += vec4<f32>(
				0.0,
				0.0,
				0.0,
				1.0,
			);
		} else {
			rcolor += color(color_v, input.fragmentPosition);
		}
	}
	return rcolor / sampleCount;
}

