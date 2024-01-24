#version 300 es
#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
#else
    precision mediump float;
#endif

in vec2 vertex_position;
out vec4 fragmentColor;

uniform vec2 canvas_dimensions;
uniform vec2 center;
uniform vec2 julia_constant;
uniform float scale_factor;
uniform float radius;
uniform int juliaset;
uniform int max_iterations;
uniform int fractal_type;
uniform int colorscheme;
uniform float color_offset;
uniform int color_method;
uniform float main_juliaset_lerp;
uniform float mandelbrot_power;
uniform int post_function;
uniform int pixelate;
uniform int pixelate_resolution;

#define pi 3.141592653589793
#define e 2.718281828459045

float square(float x) {
    return x * x;
}
float magnitude(vec2 z) {
    return sqrt(square(z.x) + square(z.y));
}
vec2 to_polar(vec2 z) {
    float r = length(z);
    float theta = atan(z.y, z.x);
    return vec2(r, theta);
}
float lerp(float a, float b, float t) {
    return (1. - t) * a + t * b;
}

vec2 c_multiplication(vec2 a, vec2 b) {
    return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}
vec2 c_division(vec2 a, vec2 b) {
    return vec2(((a.x * b.x + a.y * b.y) / (b.x * b.x + b.y * b.y)), ((a.y * b.x - a.x * b.y) / (b.x * b.x + b.y * b.y)));
}
vec2 c_sin(vec2 z) {
    return vec2(sin(z.x) * cosh(z.y), cos(z.x) * sinh(z.y));
}
vec2 c_sinh(vec2 z) {
    return vec2(sinh(z.x) * cos(z.y), cosh(z.x) * sin(z.y)); 
}
vec2 c_cos(vec2 z) {
    return vec2(cos(z.x) * cosh(z.y), -sin(z.x) * sinh(z.y));
}
vec2 c_cosh(vec2 z) {
    return vec2(cosh(z.x) * cos(z.y), sinh(z.x) * sin(z.y)); 
}
vec2 c_tan(vec2 z) {
    float cosx = cos(z.x);
    float sinx = sin(z.x);
    float sinhy = sinh(z.y);
    float coshy = cosh(z.y);
    float d = (cosx * coshy - sinx * sinhy);
    float re = (sinx * coshy) / d;
    float im = (cosx * sinhy) / d;
    return vec2(re, im);
}
vec2 c_tanh(vec2 z) {
    return c_division(c_sinh(z), c_cosh(z));
}
vec2 c_log(vec2 z) {
    float re = sqrt((z.x * z.x) + (z.y * z.y));
    float im = atan(z.y, z.x);
    if (im > pi) {
        im = im - (2. * pi);
    }
    return vec2(log(re), im);
}
vec2 c_sqrt(vec2 z) {
    float r = length(z);
    float re = sqrt(0.5 * (r + z.x));
    float im = sqrt(0.5 * (r - z.x));
    if (z.y < 0.) {
        im = -im;
    }
    return vec2(re, im);
}
vec2 c_abs(vec2 z) {
    return vec2(abs(z.x), abs(z.y));
}
vec2 c_floor(vec2 z) {
    return vec2(floor(z.x), floor(z.y));
}
vec2 c_pow(vec2 z, float n) {
    vec2 polar = to_polar(z);
    float r = pow(polar.x, n);
    float theta = n * polar.y;
    return r * vec2(cos(theta), sin(theta));
}

float weierstrass(float x) {
    x *= 2.;
    return cos(x) + cos(3. * x) / 2. + cos(9. * x) / 4. + cos(27. * x) / 8. + cos(81. * x) / 16. + cos(243. * x) / 32.;
}
float cubic_interpolation(float a, float b, float c, float d, float x) {
    return b +
           x * (.5 * c - .5 * a) +
           x * x * (a - 2.5 * b + 2. * c - .5 * d) +
           x * x * x * (-.5 * a + 1.5 * b - 1.5 * c + .5 * d);
}
vec4 color_interpolate(vec3 color0, vec3 color1, vec3 color2, vec3 color3, float x) {
    return vec4(
        cubic_interpolation(color0.r, color1.r, color2.r, color3.r, x),
        cubic_interpolation(color0.g, color1.g, color2.g, color3.g, x),
        cubic_interpolation(color0.b, color1.b, color2.b, color3.b, x),
        1.
    );
}
vec4 color_lerp(vec3 c0, vec3 c1, float x) {
    return vec4(
        lerp(c0.r, c1.r, x),
        lerp(c0.g, c1.g, x),
        lerp(c0.b, c1.b, x),
        1.
    );
}

vec4 classic_colorscheme(float x) {
    x *= pi * 2.;
    return vec4(
        .5 + sin(x) / 2.,
        .5 + sin(x + 1.) / 2.,
        .5 + sin(x + 2.) / 2.,
        1.
    );
}
vec4 ultrafractal_colorscheme(float x) {
    vec3 blue      = vec3(0., 0.03, 0.39);
    vec3 lightblue = vec3(0.12, 0.42, 0.8);
    vec3 white     = vec3(0.93, 1., 1.);
    vec3 orange    = vec3(1., 0.66, 0.);
    vec3 black     = vec3(0., 0.1, 0.007);
    x = fract(x) * 5.;
    if (x < 1.) {
        return color_interpolate(blue, lightblue, white, orange, fract(x));
    }
    if (x < 2.) {
        return color_interpolate(lightblue, white, orange, black, fract(x));
    }
    if (x < 3.) {
        return color_interpolate(white, orange, black, blue, fract(x));
    }
    if (x < 4.) {
        return color_interpolate(orange, black, blue, lightblue, fract(x));
    }
    if (x <= 5.) {
        return color_interpolate(black, blue, lightblue, white, fract(x));
    }
    return vec4(black, 1.);
}
vec4 red_blue_colorscheme(float x) {
    vec3 red   = vec3(1., .3, 0.);
    vec3 white = vec3(1., 1., 1.);
    vec3 blue  = vec3(0.2, 0.4, 1.);
    vec3 black = vec3(0., 0., 0.);
    x = fract(x) * 4.;
    if (x < 1.) {
        return color_interpolate(black, red, white, blue, fract(x));
    }
    if (x < 2.) {
        return color_interpolate(red, white, blue, black, fract(x));
    }
    if (x < 3.) {
        return color_interpolate(white, blue, black, red, fract(x));
    }
    if (x <= 4.) {
        return color_interpolate(blue, black, red, white, fract(x));
    }
    return vec4(black, 1.);
}
vec4 sand_colorscheme(float x) {
    vec3 yellow = vec3(0.97, 0.91, 0.69);
    vec3 orange = vec3(0.88, 0.57, 0.39);
    vec3 cyan   = vec3(0.34, 0.6,  0.58);
    vec3 blue   = vec3(0.27, 0.32, 0.39);
    x = fract(x) * 4.;
    if (x < 1.) {
        return color_interpolate(blue, yellow, orange, cyan, fract(x));
    }
    if (x < 2.) {
        return color_interpolate(yellow, orange, cyan, blue, fract(x));
    }
    if (x < 3.) {
        return color_interpolate(orange, cyan, blue, yellow, fract(x));
    }
    if (x <= 4.) {
        return color_interpolate(cyan, blue, yellow, orange, fract(x));
    }
    return vec4(0., 0., 0., 1.);
}
vec4 rainbow_colorscheme(float x) {
    vec3 red       = vec3(1., 0., 0.);
    vec3 yellow    = vec3(1., 1., 0.);
    vec3 green     = vec3(0., 1., 0.);
    vec3 lightblue = vec3(0., 1., 1.);
    vec3 blue      = vec3(0., 0., 1.);
    vec3 pink      = vec3(1., 0., 1.);
    x = fract(x) * 6.;
    if (x < 1.) {
        return color_interpolate(pink, red, yellow, green, fract(x));
    }
    if (x < 2.) {
        return color_interpolate(red, yellow, green, lightblue, fract(x));
    }
    if (x < 3.) {
        return color_interpolate(yellow, green, lightblue, blue, fract(x));
    }
    if (x < 4.) {
        return color_interpolate(green, lightblue, blue, pink, fract(x));
    }
    if (x < 5.) {
        return color_interpolate(lightblue, blue, pink, red, fract(x));
    }
    if (x <= 6.) {
        return color_interpolate(blue, pink, red, yellow, fract(x));
    }
    return vec4(0., 0., 0., 1.);
}
vec4 davids_colorscheme(float x) {
    x *= 2.;
    vec3 blue0 = vec3(0.  , 0.  , 0.  );
    vec3 blue1 = vec3(0.22, 0.44, 0.87);
    
    vec3 green0 = vec3(0.25, 0.5 , 0.  );
    vec3 green1 = vec3(0.47, 0.93, 0.87);
    
    vec3 red0 = vec3(0.5 , 0.  , 0.  );
    vec3 red1 = vec3(0.71, 0.44, 0.87);
    
    vec3 yellow0 = vec3(0.75, 0.5 , 0.  );
    vec3 yellow1 = vec3(0.96, 0.93, 0.87);
    x = fract(x) * 4.;
    if (x < 1.) {
        return color_lerp(blue0, blue1, fract(x));
    }
    if (x < 2.) {
        return color_lerp(green0, green1, fract(x));
    }
    if (x < 3.) {
        return color_lerp(red0, red1, fract(x));
    }
    if (x <= 4.) {
        return color_lerp(yellow0, yellow1, fract(x));
    }
}
vec4 lava_waves_colorscheme(float x) {
    x *= 2.;
    x = fract(x + 0.5);
    return vec4(
        (128. * sin(6.25 * (x + 0.5)) + 128.) / 255.,
        (63. * sin(x * 99.72) + 97.) / 255.,
        (128. * sin(6.23 *x) + 128.) / 255.,
        1.
    );
}

vec4 morning_glory_colorscheme(float x) {
    x *= 2.;
    x = fract(x);
    float xx = 270.9 * x + 0.7703;
    float r = 0.;
    if (xx > 255.) {
        r = (510. - xx) / 266.;
    } else {
        r = xx / 255.;
    }
    xx = 180. * sin(x * 3.97 + 9.46) + 131.;
    float g = 0.;
    if (xx < 0.) {
        g = abs(xx) / 255.;
    } else if (xx > 255.) {
        g = (510. - xx) / 255.;
    } else {
        g = xx / 255.;
    }
    float b = (95. * sin((x - 0.041) * 7.46) + 106.9) / 255.;
    return vec4(
        r, g, b,
        1.
    );
}

vec4 chocolate_colormap(float x) {
    return vec4(
        (sin(x * pi * 200.) + 1.) / 2.,
        (sin(x * pi * 204.) + 0.8) / 2.,
        (sin(x * pi * 208.) + 0.6) / 2.,
        1.
    );
}

vec4 color(float x) {
    x += color_offset;
    if (colorscheme == 0) {
        return classic_colorscheme(x);
    }
    if (colorscheme == 1) {
        return ultrafractal_colorscheme(x);
    } 
    if (colorscheme == 2) {
        return red_blue_colorscheme(x);
    }
    if (colorscheme == 3) {
        return sand_colorscheme(x);
    }
    if (colorscheme == 4) {
        return rainbow_colorscheme(x);
    }
    if (colorscheme == 5) {
        return davids_colorscheme(x);
    }
    if (colorscheme == 6) {
        return lava_waves_colorscheme(x);
    }
    if (colorscheme == 7) {
        return morning_glory_colorscheme(x);
    }
    if (colorscheme == 8) {
        return chocolate_colormap(x);
    }
}

vec2 apply_post_function_2(vec2 z) {
    if (post_function == 0) {
        return z;
    }
    if (post_function == 1) {
        return c_sin(z);
    }
    if (post_function == 2) {
        return c_sinh(z);
    }
    if (post_function == 3) {
        return c_cos(z);
    }
    if (post_function == 4) {
        return c_cosh(z);
    }
    if (post_function == 5) {
        return c_tan(z);
    }
    if (post_function == 6) {
        return c_tanh(z);
    }
    if (post_function == 7) {
        return c_log(z);
    }
    if (post_function == 8) {
        return c_sqrt(z);
    }
    if (post_function == 9) {
        return c_abs(z);
    }
}
vec2 apply_post_function(vec2 z_) {
    vec2 z = apply_post_function_2(z_);
    if (pixelate == 1) {
        return c_floor(z * float(pixelate_resolution)) / float(pixelate_resolution);
    }
    return z;
}

vec2 iteration(vec2 z, vec2 c, int type) {
    if (type == 0) {
        // Mandelbrot
        return c + apply_post_function(c_pow(z, mandelbrot_power));
    } 
    if (type == 1) {
        // Burning ship
        vec2 power = c_pow(z, mandelbrot_power);
        return c + apply_post_function(vec2(power.x, abs(power.y)));
    }
    if (type == 2) {
        // Celtic
        vec2 power = c_pow(z, mandelbrot_power);
        return c + apply_post_function(vec2(abs(power.x), power.y));
    }
    if (type == 3) {
        // Buffalo
        vec2 power = c_pow(z, mandelbrot_power);
        return c + apply_post_function(vec2(abs(power.x), abs(power.y)));
    }
    if (type == 4) {
        // Tricorn
        vec2 power = c_pow(z, mandelbrot_power);
        return c + apply_post_function(vec2(power.x, -power.y));
    }
    if (type == 5) {
        // Duck
        // own custom polar coordinate formula, because it needs to be modified
        vec2 polar = to_polar(z);
        float r = pow(polar.x, mandelbrot_power);
        float theta = mandelbrot_power * abs(polar.y);
        return c + apply_post_function(r * vec2(cos(theta), sin(theta)));
    }
    if (type == 6) {
        // Butt
        return c + apply_post_function(vec2(z.x * z.x * z.x - z.y * z.y * abs(z.y), 2. * z.x * z.y));
    }
    if (type == 7) {
        // Juliaset Sine (radius ~20)
        return apply_post_function(c + c_pow(c_sin(z), mandelbrot_power));
    }
    if (type == 8) {
        // Popcorn (ideal radius ca ~2)
        return apply_post_function(vec2(z.x - c.x * (z.y + tan(3. * z.y)), z.y - c.y * (z.x + tan(3. * z.x))));
    }
    if (type == 9) {
        // Thorn (very high radius required)
        return apply_post_function(vec2(z.x / cos(z.y), z.y / sin(z.x))) + c;
    }
    if (type == 10) {
        // Henon (radius rather high, ~20000)
        return apply_post_function(vec2(1. - c.x * z.x * z.x + z.y, c.y * z.x));
    }
    if (type == 11) {
        // Duffing (radius not too important, ~200)
        return apply_post_function(vec2(z.y, -1. * c.y * z.x + c.x * z.y - z.y * z.y * z.y));
    }
    if (type == 12) {
        // Chirikov (low radius, ~3)
        return apply_post_function(vec2(z.x + c.x * z.y, c.y + c.y * sin(z.x)));
    }
    if (type == 13) {
        // Ikeda (radius rather high, ~20000)
        float t = 0.4 - 6. / (1. + square(z.x) + square(z.y));
        float sin_t = sin(t);
        float cos_t = cos(t);
        return apply_post_function(vec2(1. + c.x * (z.x * cos_t - z.y * sin_t), c.y * (z.x * sin_t + z.y * cos_t)));
    }
    if (type == 14) {
        // Feather (radius around ~200 or lower)
        float dr = 1. + z.x * z.x;
        float di = z.y * z.y;
        vec2 p = c_pow(z, 3.);
        float zr = p.x;
        float zi = p.y;
        float dvr = (zr * dr + zi * di) / (dr * dr + di * di);
        float dvi = (zi * dr - zr * di) / (dr * dr + di * di);
        return apply_post_function(vec2(dvr, dvi)) + c;
    }
    if (type == 15) {
        // Heart
        return vec2(c.x, c.y * -1.) + apply_post_function(vec2(2. * z.x * z.y, abs(z.y) - abs(z.x)));
    }
    if (type == 16) {
        // Ass 2
        return c + apply_post_function(vec2(sinh(z.x) * sin(z.y), cosh(z.y) * cos(z.x)));
    }
    if (type == 17) {
        // Triangle
        return c + apply_post_function(vec2(sin(z.x) * sinh(z.y), cos(z.y) * cosh(z.x)));
    }
    if (type == 18) {
        // Shark fin
        return c + apply_post_function(vec2(z.x * z.x - abs(z.y) * z.y, z.x * z.y * 2.));
    }
    if (type == 19) {
        // Tippets
        float re = z.x * z.x - z.y * z.y + c.x;
        float im = 2. * re * z.y + c.y;
        return apply_post_function(vec2(re, im));
    }
    if (type == 20) {
        // Zubiet
        return apply_post_function(c_pow(z, mandelbrot_power)) + c_division(c, z);
    }
    if (type == 21) {
        // Sinh julia
        return apply_post_function(c_pow(c_sinh(z), float(mandelbrot_power))) + c;
    }
    if (type == 22) {
        // Unnamed 1
        return apply_post_function(c_pow(z, mandelbrot_power) - c_pow(-z, c.x) + vec2(c.y, 0.));
    }
    if (type == 23) {
        // Unnamed 2
        return apply_post_function(c_pow(z - c_division(c_pow(z, 3.) - vec2(1., 0.), 3. * c_pow(z, 2.)), mandelbrot_power)) + c;
    }
    if (type == 24) {
        // Unnamed 3
        return apply_post_function(c_pow(c_division(c_pow(z, mandelbrot_power) + c - vec2(1., 0.), c_multiplication(z, vec2(2., 2.)) + c - vec2(2., 0.)), mandelbrot_power));
    }
    if (type == 25) {
        // Fish
        return apply_post_function(vec2(abs(z.x - z.y), 2. * z.x * z.y)) + c;
    }
    if (type == 26) {
        // Wavy 
        float x = z.y + 1. - (1.4 + sin(z.y * pi) * 0.4 + c.x) * pow(z.x, 2.);
        float y = (0.3 + cos((z.x + z.y) * pi) * 0.2 + c.y) * x;
        x = (4. + cos(z.x * pi) * 3. + (c.x + c.y)) * x * (1. - x);
        return apply_post_function(vec2(x, y));
    }
}

float stripe_func(vec2 z) {
    if (color_method == 4) { // normal stripes
        return weierstrass(atan(z.y, z.x));
    }
    if (color_method == 6) { // smooth stripes
        return cos(atan(z.y, z.x));
    }
    if (color_method == 7) { // edgy stripes
        return pow(e, -0.5 * atan(z.y, z.x));
    }
    if (color_method == 8) { // floor stripes
        return floor(atan(z.y, z.x) * pi);
    }
    if (color_method == 9) { // squared stripes
        return pow(atan(z.y, z.x), 2.);
    }
    if (color_method == 10) { // stripier stripes
        return 4. * sin(6. * cos(atan(z.y, z.x)));
    }
    if (color_method == 14) { // stripy rings
        return pow(weierstrass(magnitude(z) * 2.), 2.) + pow(weierstrass(atan(z.y, z.x)), 2.);
    }
}

float smooth_iters(int i, vec2 z, vec2 last_z) {
    return float(i) + log(radius / magnitude(last_z)) / log(magnitude(z) / magnitude(last_z));
}

void main() {
    vec2 window = canvas_dimensions / min(canvas_dimensions.x, canvas_dimensions.y);
    vec2 original_z = vertex_position * window / scale_factor + center;
    original_z = vec2(original_z.x, original_z.y * -1.);
    vec2 last_z = original_z;
    vec2 z = original_z;
    vec2 c = original_z;
    if (juliaset == 1) {
        if (main_juliaset_lerp == 1.) {
            c = vec2(julia_constant.x, julia_constant.y * -1.);
        } else if (main_juliaset_lerp == 0.) {
            c = original_z;
        } else {
            c = (1. - main_juliaset_lerp) * original_z + main_juliaset_lerp * vec2(julia_constant.x, julia_constant.y * -1.);
        }
    }
    float distance_to_orbit_trap = 100000000.;
    float color_v = 0.;
    bool color_black = false;
    float stripe = 0.;
    
    for (int i = 0; i <= max_iterations; i++) {
        z = iteration(z, c, fractal_type);
        if (color_method == 0) {
            if (magnitude(z) > radius) {
                color_v = float(i) / float(max_iterations);
                break;
            } else if (i == max_iterations) {
                color_black = true;
            }
        } else if (color_method == 1) {
            if (magnitude(z) > radius) {
                float float_iters = smooth_iters(i, z, last_z);
                color_v = float_iters / float(max_iterations);
                break;
            } else if (i == max_iterations) {
                color_black = true;
            }
        } else if (color_method == 2) {
            if (magnitude(z) > radius) {
                color_black = true;
                break;
            } else {
                color_v = log(magnitude(z));
            }
        } else if (color_method == 3) {
            distance_to_orbit_trap = min(distance_to_orbit_trap, abs(magnitude(z) - radius));
            color_v = -log(log(distance_to_orbit_trap));
        } else if (color_method == 4 || color_method == 6 || color_method == 7 || color_method == 8 || color_method == 9 || color_method == 10 || color_method == 14) { // stripes
            if (magnitude(z) > radius) {
                float float_iters = smooth_iters(i, z, last_z);
                stripe += stripe_func(z) * fract(float_iters);
                color_v = float_iters / square(log(float_iters)) + 40. * stripe / float_iters;
                color_v /= float(max_iterations);
                break;
            } else if (i == max_iterations) {
                color_black = true;
            } else {
                stripe += stripe_func(z);
            }
        } else if (color_method == 5) {
            if (magnitude(z) > radius) {
                color_v = 0.;
                break;
            } else if (i == max_iterations) {
                color_black = true;
            }
        } else if (color_method == 11 || color_method == 12) { // transparent
            if (magnitude(z) > radius) {
                break;
            } else if (i == max_iterations) {
                color_black = true;
            }
        } else if (color_method == 13) { // something spiky
            if (sqrt(z.x * last_z.x + z.y * last_z.y) > radius) {
                color_v = float(i) / float(max_iterations);
                break;
            } else if (i == max_iterations) {
                color_black = true;
            }
        }
        last_z = z;
    }
    if (color_black) {
        if (color_method == 12) {
            fragmentColor = vec4(0., 0., 0., 0.); 
        } else {
            fragmentColor = vec4(0., 0., 0., 1.);
        }
    } else {
        if (color_method == 11) {
            fragmentColor = vec4(0., 0., 0., 0.);
        } else {
            fragmentColor = color(color_v);
        }
    }
}