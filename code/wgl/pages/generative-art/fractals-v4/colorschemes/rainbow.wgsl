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