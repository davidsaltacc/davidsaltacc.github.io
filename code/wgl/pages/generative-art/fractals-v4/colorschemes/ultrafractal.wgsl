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