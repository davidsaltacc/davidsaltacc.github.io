var x_var: f32 = x;
var white: vec3<f32> = vec3<f32>(0.83, 0.81, 0.84);
var blue: vec3<f32> = vec3<f32>(0.42, 0.55, 0.75);
var purple: vec3<f32> = vec3<f32>(0.31, 0.1, 0.44);
var red: vec3<f32> = vec3<f32>(0.45, 0.12, 0.31);
var orange: vec3<f32> = vec3<f32>(0.71, 0.49, 0.38);
x_var = fract(x_var) * 5.;
if (x_var < 1.) {
	return color_interpolate(orange, white, blue, purple, fract(x_var));
}
if (x_var < 2.) {
	return color_interpolate(white, blue, purple, red, fract(x_var));
}
if (x_var < 3.) {
	return color_interpolate(blue, purple, red, orange, fract(x_var));
}
if (x_var < 4.) {
	return color_interpolate(purple, red, orange, white, fract(x_var));
}
if (x_var <= 5.) {
	return color_interpolate(red, orange, white, blue, fract(x_var));
}
return vec4<f32>(0., 0., 0., 1.);