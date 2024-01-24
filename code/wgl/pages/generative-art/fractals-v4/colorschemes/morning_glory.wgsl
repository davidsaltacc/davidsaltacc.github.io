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