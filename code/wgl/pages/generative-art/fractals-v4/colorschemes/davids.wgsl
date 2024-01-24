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