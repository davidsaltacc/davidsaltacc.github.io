
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
	maxIterations: u32,
	fractalType: u32,
	colorscheme: u32,
    colorMethod: u32,
	juliaset: u32 // no uniform bools 
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

const pi: f32 = 3.1415926535897932384626433832795;
const e: f32 = 2.7182818284590452353602874713527;

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

fn c_division(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
	return vec2<f32>((a.x * b.x + a.y * b.y) / (b.x * b.x + b.y * b.y), (a.y * b.x - a.x * b.y) / (b.x * b.x + b.y * b.y));
} 
fn c_multiplication(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
	return vec2<f32>(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
} 

fn c_collatz(z: vec2<f32>) -> vec2<f32> {
	return 0.25 * (vec2<f32>(1., 0.) + 4. * z - c_multiplication(1. + 2. * z, c_cos(pi * z)));
} 


fn iterate(z: vec2<f32>, c: vec2<f32>) -> vec2<f32> {
	var fractalType: u32 = uniforms.fractalType;
	var power: f32 = uniforms.power;
    if (fractalType == 0) {
        return c_pow(z, power) + c;
    }
    if (fractalType == 1) {
        var zp: vec2<f32> = c_pow(z, power);
        return vec2<f32>(zp.x, abs(zp.y)) + c;
    }
    if (fractalType == 2) {
        var zp: vec2<f32> = c_pow(z, power);
        return vec2<f32>(abs(zp.x), zp.y) + c;
    }
    if (fractalType == 3) {
        var zp: vec2<f32> = c_pow(z, power);
        return vec2<f32>(abs(zp.x), abs(zp.y)) + c;
    }
    if (fractalType == 4) {
        var zp: vec2<f32> = c_pow(z, power);
        return vec2<f32>(zp.x, -zp.y) + c;
    }
    if (fractalType == 5) {
        var polar: vec2<f32> = to_polar(z);
        var r: f32 = pow(polar.x, power);
        var theta: f32 = power * abs(polar.y);
        return c + r * vec2(cos(theta), sin(theta));
    }
    if (fractalType == 6) {
        return vec2<f32>(
            z.x * z.x * z.x - z.y * z.y * abs(z.y) + c.x, 
            2.0 * z.x * z.y + c.y
        );
    }
    if (fractalType == 7) {
        return c_pow(c_sin(z), power) + c;
    }
    if (fractalType == 8) {
        return vec2<f32>(z.x - c.x * (z.y + tan(3. * z.y)), z.y - c.y * (z.x + tan(3. * z.x)));
    }
    if (fractalType == 9) {
        return vec2<f32>(z.x / cos(z.y), z.y / sin(z.x)) + c;
    }
    if (fractalType == 10) {
        return vec2<f32>(1. - c.x * z.x * z.x + z.y, c.y * z.x);
    }
    if (fractalType == 11) {
        return vec2<f32>(z.y, -1. * c.y * z.x + c.x * z.y - z.y * z.y * z.y);
    }
    if (fractalType == 12) {
        return vec2<f32>(z.x + c.x * z.y, c.y + c.y * sin(z.x));
    }
    if (fractalType == 13) {
        var t: f32 = 0.4 - 6. / (1. + z.x * z.x + z.y * z.y);
        var sin_t: f32 = sin(t);
        var cos_t: f32 = cos(t);
        return vec2<f32>(1. + c.x * (z.x * cos_t - z.y * sin_t), c.y * (z.x * sin_t + z.y * cos_t));
    }
    if (fractalType == 14) {
        var dr: f32 = 1. + z.x * z.x;
        var di: f32 = z.y * z.y;
        var p: vec2<f32> = c_pow(z, 3.);
        var zr: f32 = p.x;
        var zi: f32 = p.y;
        var dvr: f32 = (zr * dr + zi * di) / (dr * dr + di * di);
        var dvi: f32 = (zi * dr - zr * di) / (dr * dr + di * di);
        return vec2<f32>(dvr, dvi) + c;
    }
    if (fractalType == 15) {
        return vec2<f32>(c.x, c.y * -1.) + vec2<f32>(2. * z.x * z.y, abs(z.y) - abs(z.x));
    }
    if (fractalType == 16) {
        return c + vec2<f32>(sinh(z.x) * sin(z.y), cosh(z.y) * cos(z.x));
    }
    if (fractalType == 17) {
        return c + vec2<f32>(sin(z.x) * sinh(z.y), cos(z.y) * cosh(z.x));
    }
    if (fractalType == 18) {
        return c + vec2<f32>(z.x * z.x - abs(z.y) * z.y, z.x * z.y * 2.);
    }
    if (fractalType == 19) {
        var re: f32 = z.x * z.x - z.y * z.y + c.x;
        var im: f32 = 2. * re * z.y + c.y;
        return vec2<f32>(re, im);
    }
    if (fractalType == 20) {
        return c_pow(z, power) + c_division(c, z);
    }
    if (fractalType == 21) {
        return c_pow(c_sinh(z), power) + c;
    }
    if (fractalType == 22) {
        return c_pow(z, power) - c_pow(-z, c.x) + vec2<f32>(c.y, 0.);
    }
    if (fractalType == 23) {
        return c_pow(z - c_division(c_pow(z, 3.) - vec2<f32>(1., 0.), 3. * c_pow(z, 2.)), power) + c;
    }
    if (fractalType == 24) {
        return c_pow(c_division(c_pow(z, power) + c - vec2<f32>(1., 0.), c_multiplication(z, vec2<f32>(2., 2.)) + c - vec2<f32>(2., 0.)), power);
    }
    if (fractalType == 25) {
        return c + vec2<f32>(abs(z.x - z.y), 2. * z.x * z.y);
    }
    if (fractalType == 26) {
        var x: f32 = z.y + 1. - (1.4 + sin(z.y * pi) * 0.4 + c.x) * pow(z.x, 2.);
        var y: f32 = (0.3 + cos((z.x + z.y) * pi) * 0.2 + c.y) * x;
        x = (4. + cos(z.x * pi) * 3. + (c.x + c.y)) * x * (1. - x);
        return vec2<f32>(x, y);
    }
    if (fractalType == 27) {
        return c_collatz(z) + c;
    }

    return z;
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

fn classic_colorscheme(x: f32) -> vec4<f32> {
    var xp: f32 = x * pi * 2.;
    return vec4<f32>(
        .5 + sin(xp) / 2.,
        .5 + sin(xp + 1.) / 2.,
        .5 + sin(xp + 2.) / 2.,
        1.
    );
}

fn ultrafractal_colorscheme(x: f32) -> vec4<f32> {
	var x_var: f32 = x;
	var blue: vec3<f32> = vec3<f32>(0., 0.03, 0.39);
	var lightblue: vec3<f32> = vec3<f32>(0.12, 0.42, 0.8);
	var white: vec3<f32> = vec3<f32>(0.93, 1., 1.);
	var orange: vec3<f32> = vec3<f32>(1., 0.66, 0.);
	var black: vec3<f32> = vec3<f32>(0., 0.1, 0.007);
	x_var = fract(x_var) * 5.;
	if (x_var < 1.) {
		return color_interpolate(blue, lightblue, white, orange, fract(x_var));
	}
	if (x_var < 2.) {
		return color_interpolate(lightblue, white, orange, black, fract(x_var));
	}
	if (x_var < 3.) {
		return color_interpolate(white, orange, black, blue, fract(x_var));
	}
	if (x_var < 4.) {
		return color_interpolate(orange, black, blue, lightblue, fract(x_var));
	}
	if (x_var <= 5.) {
		return color_interpolate(black, blue, lightblue, white, fract(x_var));
	}
	return vec4<f32>(black, 1.);
} 

fn red_blue_colorscheme(x: f32) -> vec4<f32> {
	var x_var: f32 = x;
	var red: vec3<f32> = vec3<f32>(1., 0.3, 0.);
	let white: vec3<f32> = vec3<f32>(1., 1., 1.);
	var blue: vec3<f32> = vec3<f32>(0.2, 0.4, 1.);
	let black: vec3<f32> = vec3<f32>(0., 0., 0.);
	x_var = fract(x_var) * 4.;
	if (x_var < 1.) {
		return color_interpolate(black, red, white, blue, fract(x_var));
	}
	if (x_var < 2.) {
		return color_interpolate(red, white, blue, black, fract(x_var));
	}
	if (x_var < 3.) {
		return color_interpolate(white, blue, black, red, fract(x_var));
	}
	if (x_var <= 4.) {
		return color_interpolate(blue, black, red, white, fract(x_var));
	}
	return vec4<f32>(black, 1.);
} 

fn sand_colorscheme(x: f32) -> vec4<f32> {
	var x_var: f32 = x;
	var yellow: vec3<f32> = vec3<f32>(0.97, 0.91, 0.69);
	let orange: vec3<f32> = vec3<f32>(0.88, 0.57, 0.39);
	let cyan: vec3<f32> = vec3<f32>(0.34, 0.6, 0.58);
	var blue: vec3<f32> = vec3<f32>(0.27, 0.32, 0.39);
	x_var = fract(x_var) * 4.;
	if (x_var < 1.) {
		return color_interpolate(blue, yellow, orange, cyan, fract(x_var));
	}
	if (x_var < 2.) {
		return color_interpolate(yellow, orange, cyan, blue, fract(x_var));
	}
	if (x_var < 3.) {
		return color_interpolate(orange, cyan, blue, yellow, fract(x_var));
	}
	if (x_var <= 4.) {
		return color_interpolate(cyan, blue, yellow, orange, fract(x_var));
	}
	return vec4<f32>(0., 0., 0., 1.);
} 

fn rainbow_colorscheme(x: f32) -> vec4<f32> {
	var x_var: f32 = x;
	let red: vec3<f32> = vec3<f32>(1., 0., 0.);
	let yellow: vec3<f32> = vec3<f32>(1., 1., 0.);
	let green: vec3<f32> = vec3<f32>(0., 1., 0.);
	let lightblue: vec3<f32> = vec3<f32>(0., 1., 1.);
	let blue: vec3<f32> = vec3<f32>(0., 0., 1.);
	let pink: vec3<f32> = vec3<f32>(1., 0., 1.);
	x_var = fract(x_var) * 6.;
	if (x_var < 1.) {
		return color_interpolate(pink, red, yellow, green, fract(x_var));
	}
	if (x_var < 2.) {
		return color_interpolate(red, yellow, green, lightblue, fract(x_var));
	}
	if (x_var < 3.) {
		return color_interpolate(yellow, green, lightblue, blue, fract(x_var));
	}
	if (x_var < 4.) {
		return color_interpolate(green, lightblue, blue, pink, fract(x_var));
	}
	if (x_var < 5.) {
		return color_interpolate(lightblue, blue, pink, red, fract(x_var));
	}
	if (x_var <= 6.) {
		return color_interpolate(blue, pink, red, yellow, fract(x_var));
	}
	return vec4<f32>(0., 0., 0., 1.);
} 

fn davids_colorscheme(x: f32) -> vec4<f32> {
	var x_var: f32 = x;
	x_var = x_var * (2.);
	let blue0: vec3<f32> = vec3<f32>(0., 0., 0.);
	let blue1: vec3<f32> = vec3<f32>(0.22, 0.44, 0.87);
	let green0: vec3<f32> = vec3<f32>(0.25, 0.5, 0.);
	let green1: vec3<f32> = vec3<f32>(0.47, 0.93, 0.87);
	let red0: vec3<f32> = vec3<f32>(0.5, 0., 0.);
	let red1: vec3<f32> = vec3<f32>(0.71, 0.44, 0.87);
	let yellow0: vec3<f32> = vec3<f32>(0.75, 0.5, 0.);
	let yellow1: vec3<f32> = vec3<f32>(0.96, 0.93, 0.87);
	x_var = fract(x_var) * 4.;
	if (x_var < 1.) {
		return color_lerp(blue0, blue1, fract(x_var));
	}
	if (x_var < 2.) {
		return color_lerp(green0, green1, fract(x_var));
	}
	if (x_var < 3.) {
		return color_lerp(red0, red1, fract(x_var));
	}
	if (x_var <= 4.) {
		return color_lerp(yellow0, yellow1, fract(x_var));
	}
	return vec4<f32>(0., 0., 0., 1.);
} 

fn lava_waves_colorscheme(x: f32) -> vec4<f32> {
	var x_var: f32 = x;
	x_var = x_var * (2.);
	x_var = fract(x_var + 0.5);
	return vec4<f32>((128. * sin(6.25 * (x_var + 0.5)) + 128.) / 255., (63. * sin(x_var * 99.72) + 97.) / 255., (128. * sin(6.23 * x_var) + 128.) / 255., 1.);
} 

fn morning_glory_colorscheme(x: f32) -> vec4<f32> {
	var x_var: f32 = x;
	x_var = x_var * (2.);
	x_var = fract(x_var);
	var xx: f32 = 270.9 * x_var + 0.7703;
	var r: f32 = 0.;
	if (xx > 255.) {
		r = (510. - xx) / 266.;
	} else { 
		r = xx / 255.;
	}
	xx = 180. * sin(x_var * 3.97 + 9.46) + 131.;
	var g: f32 = 0.;
	if (xx < 0.) {
		g = abs(xx) / 255.;
	} else { 	
        if (xx > 255.) {
            g = (510. - xx) / 255.;
        } else { 
            g = xx / 255.;
        }
	}
	let b: f32 = (95. * sin((x_var - 0.041) * 7.46) + 106.9) / 255.;
	return vec4<f32>(r, g, b, 1.);
} 

fn chocolate_colormap(x: f32) -> vec4<f32> {
	return vec4<f32>((sin(x * pi * 200.) + 1.) / 2., (sin(x * pi * 204.) + 0.8) / 2., (sin(x * pi * 208.) + 0.6) / 2., 1.);
} 

fn color(x: f32) -> vec4<f32> {
	var xv: f32 = x;
	xv = xv + uniforms.colorOffset;
    var colorscheme: u32 = uniforms.colorscheme;
	if (colorscheme == 0) {
		return classic_colorscheme(xv);
	}
	if (colorscheme == 1) {
		return ultrafractal_colorscheme(xv);
	}
	if (colorscheme == 2) {
		return red_blue_colorscheme(xv);
	}
	if (colorscheme == 3) {
		return sand_colorscheme(xv);
	}
	if (colorscheme == 4) {
		return rainbow_colorscheme(xv);
	}
	if (colorscheme == 5) {
		return davids_colorscheme(xv);
	}
	if (colorscheme == 6) {
		return lava_waves_colorscheme(xv);
	}
	if (colorscheme == 7) {
		return morning_glory_colorscheme(xv);
	}
	if (colorscheme == 8) {
		return chocolate_colormap(xv);
	}
    return vec4<f32>(0., 0., 0., 1.); 
} 

fn stripe_func(z: vec2<f32>) -> f32 {
	var colorMethod: u32 = uniforms.colorMethod;
	if (colorMethod == 4) {
		return weierstrass(atan2(z.y, z.x));
	}
	if (colorMethod == 6) {
		return cos(atan2(z.y, z.x));
	}
	if (colorMethod == 7) {
		return pow(e, -0.5 * atan2(z.y, z.x));
	}
	if (colorMethod == 8) {
		return floor(atan2(z.y, z.x) * pi);
	}
	if (colorMethod == 9) {
		return pow(atan2(z.y, z.x), 2.);
	}
	if (colorMethod == 10) {
		return 4. * sin(6. * cos(atan2(z.y, z.x)));
	}
	if (colorMethod == 12) {
		return pow(weierstrass(magnitude(z) * 2.), 2.) + pow(weierstrass(atan2(z.y, z.x)), 2.);
	}
    return 0.;
} 


@fragment
fn fragment(input: VertexOutput) -> @location(0) vec4<f32> { 
	var window: vec2<f32> = uniforms.canvasDimensions / min(uniforms.canvasDimensions.x, uniforms.canvasDimensions.y);
	var c: vec2<f32> = input.fragmentPosition * window / uniforms.zoom + uniforms.center;
    c = vec2<f32>(c.x, -c.y);
	var z: vec2<f32> = c;
	var last_z: vec2<f32> = z;
	var iteration: u32 = 0u;
	var maxIterations: u32 = uniforms.maxIterations;
	var colorMethod: u32 = uniforms.colorMethod;
	var zx2: f32;
	var zy2: f32;
    var color_v: f32;
    var color_black: bool = false;
    var distance_to_orbit_trap: f32 = 100000000.;
    var stripe: f32 = 0.;
    var radius: f32 = uniforms.radius;

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
        last_z = z;
        z = iterate(z, c);

        if (colorMethod == 0) {
            if (magnitude(z) > radius) {
                color_v = f32(iteration) / f32(maxIterations);
                break;
            } else if (iteration == maxIterations) {
                color_black = true;
            }
        }
        if (colorMethod == 1) {
            if (magnitude(z) > radius) {
                var float_iters: f32 = smooth_iters(iteration, z, last_z);
                color_v = float_iters / f32(maxIterations);
                break;
            } else if (iteration == maxIterations) {
                color_black = true;
            }
        }
        if (colorMethod == 2) {
            if (magnitude(z) > radius) {
                color_black = true;
                break;
            } else {
                color_v = log(magnitude(z));
            }
        }
        if (colorMethod == 3) {
            distance_to_orbit_trap = min(distance_to_orbit_trap, abs(magnitude(z) - radius));
            color_v = -log(log(distance_to_orbit_trap));
        }
        if (colorMethod == 4 || colorMethod == 6 || colorMethod == 7 || colorMethod == 8 || colorMethod == 9 || colorMethod == 10 || colorMethod == 12) { // stripes
            if (magnitude(z) > radius) {
                var float_iters: f32 = smooth_iters(iteration, z, last_z);
                stripe += stripe_func(z) * fract(float_iters);
                color_v = float_iters / square(log(float_iters)) + 40. * stripe / float_iters;
                color_v /= f32(maxIterations);
                break;
            } else if (iteration == maxIterations) {
                color_black = true;
            } else {
                stripe += stripe_func(z);
            }
        }
        if (colorMethod == 5) {
            if (magnitude(z) > radius) {
                color_v = 0.;
                break;
            } else if (iteration == maxIterations) {
                color_black = true;
            }
        }
        if (colorMethod == 11) {
            if (sqrt(z.x * last_z.x + z.y * last_z.y) > radius) {
                color_v = f32(iteration) / f32(maxIterations);
                break;
            } else if (iteration == maxIterations) {
                color_black = true;
            }
        }
	}

	if (color_black) {
		return vec4<f32>(
			0.0,
			0.0,
			0.0,
			1.0,
		);
	} else {
		return color(color_v);
	}
}