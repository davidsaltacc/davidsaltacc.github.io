
struct VertexOutput {
	@builtin(position) position: vec4<f32>,
	@location(0) fragmentPosition: vec2<f32>,
}

struct Uniforms {
    offsX: f32, 
    offsY: f32, 
    offsZ: f32,
    zoom: f32,
    windowRatio: f32
}

struct Perm {
    contents: array<i32, 512>
}

struct GradP {
    contents: array<vec3<f32>, 512>
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage, read> perm: Perm;
@group(0) @binding(2) var<storage, read> gradP: GradP;

const pi: f32 = 3.1415926535;

fn dot3(grad: vec3<f32>, x: f32, y: f32, z: f32) -> f32 {
    return grad[0] * x + grad[1] * y + grad[2] * z;
}

fn fade(t: f32) -> f32 {
    return t * t * t * (t * (t * 6. - 15.) + 10.);
}

fn lerp(a: f32, b: f32, t: f32) -> f32 {
    return (1. - t) * a + t * b;
}

fn noise3d(x_: f32, y_: f32, z_: f32) -> f32 {
    var x: f32 = x_ + 50.;
    var y: f32 = y_ + 50.;
    var z: f32 = z_ + 50.;
    var X: i32 = i32(floor(x));
    var Y: i32 = i32(floor(y));
    var Z: i32 = i32(floor(z));
    x -= f32(X);
    y -= f32(Y);
    z -= f32(Z);
    var n000: f32 = dot3(gradP.contents[X + perm.contents[Y + perm.contents[Z]]], x, y, z);
    var n001: f32 = dot3(gradP.contents[X + perm.contents[Y + perm.contents[Z + 1]]], x, y, z - 1.);
    var n010: f32 = dot3(gradP.contents[X + perm.contents[Y + 1 + perm.contents[Z]]], x, y - 1., z);
    var n011: f32 = dot3(gradP.contents[X + perm.contents[Y + 1 + perm.contents[Z + 1]]], x, y - 1., z - 1.);
    var n100: f32 = dot3(gradP.contents[X + 1 + perm.contents[Y + perm.contents[Z]]], x - 1., y, z);
    var n101: f32 = dot3(gradP.contents[X + 1 + perm.contents[Y + perm.contents[Z + 1]]], x - 1., y, z - 1.);
    var n110: f32 = dot3(gradP.contents[X + 1 + perm.contents[Y + 1 + perm.contents[Z]]], x - 1., y - 1., z);
    var n111: f32 = dot3(gradP.contents[X + 1 + perm.contents[Y + 1 + perm.contents[Z + 1]]], x - 1., y - 1., z - 1.);
    var u: f32 = fade(x);
    var v: f32 = fade(y);
    var w: f32 = fade(z);
    return lerp(
        lerp(
            lerp(n000, n100, u),
            lerp(n001, n101, u),
            w
        ),
        lerp(
            lerp(n010, n110, u),
            lerp(n011, n111, u),
            w
        ),
        v
    );
}

fn fbm(x: f32, y: f32, z: f32, amp_: f32, freq_: f32, oct: f32, pers: f32, lac: f32) -> f32 {
    var amp: f32 = amp_;
    var freq: f32 = freq_;
    var v: f32 = 0;
    var m: f32 = 0;
    for (var i: f32 = 0.; i < oct; i += 1.) {
        v += amp * noise3d(x * freq, y * freq, z * freq);
        m += amp;
        amp *= pers;
        freq *= lac;
    }
    return v / m;
}

fn domainWarp(x_: f32, y_: f32, z: f32, amp: f32, freq: f32, oct: f32, pers: f32, lac: f32, warpAmt: f32, warpFalloff: f32, warpScale_: f32) -> vec3<f32> {
    var x: f32 = x_;
    var y: f32 = y_;
    var warpScale: f32 = warpScale_;
	for (var i: f32 = 0.; i < warpAmt; i += 1.) {
        x += warpScale * fbm(x, y, z, amp, freq, oct, pers, lac);
        y += warpScale * fbm(-x, -y, -z, amp, freq, oct, pers, lac);
        warpScale *= warpFalloff;
    }
    return vec3<f32>(x, y, z);
}

fn getNoise(x: f32, y: f32, z: f32, amp: f32, freq: f32, oct: f32, pers: f32, lac: f32, warpAmt: f32, warpFalloff: f32, warpScale: f32) -> f32 {
    var w: vec3<f32> = domainWarp(x, y, z, amp, freq, oct, pers, lac, warpAmt, warpFalloff, warpScale);
    return (fbm(w.x, w.y, w.z, amp, freq, oct, pers, lac) + 1.) / 2.;
}


fn colormap(x_: f32) -> vec4<f32> {
    var blue: vec3<f32> = vec3<f32>(0.29, 0.98, 0.95);
    var black: vec3<f32> = vec3<f32>(0.02, 0.02, 0.02);
    var yellow: vec3<f32> = vec3<f32>(0.99, 0.91, 0.24);
    var x = fract(x_);
    x *= 2.;
    if (x < 1.) {
        return vec4<f32>(
            lerp(blue.x, black.x, fract(x)),
            lerp(blue.y, black.y, fract(x)),
            lerp(blue.z, black.z, fract(x)),
            1.
        );
    }
    if (x < 2.) {
        return vec4<f32>(
            lerp(black.x, yellow.x, fract(x)),
            lerp(black.y, yellow.y, fract(x)),
            lerp(black.z, yellow.z, fract(x)),
            1.
        );
    }
    return vec4<f32>(0.);
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
	var position2d: vec2<f32> = positions[vertexIndex];
	output.position = 0.5 * vec4<f32>(position2d, 0.0, 1.0);
	output.fragmentPosition = position2d;
	return output;
}

@fragment
fn fragment(input: VertexOutput) -> @location(0) vec4<f32> { 

    var pos: vec2<f32> = input.fragmentPosition;

    return colormap(getNoise((pos.x + uniforms.offsX) * uniforms.zoom, ((pos.y + uniforms.offsY) * uniforms.zoom) / uniforms.windowRatio, uniforms.offsZ, 
        2., 0.5, 6., 0.45, 2.25, 2., 0.8, 0.8
    ));

    //return colormap((pos.x+1.)/2.);

}
