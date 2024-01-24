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