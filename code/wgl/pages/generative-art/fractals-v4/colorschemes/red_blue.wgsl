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