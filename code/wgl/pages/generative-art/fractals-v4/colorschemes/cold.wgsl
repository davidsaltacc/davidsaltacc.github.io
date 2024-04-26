var xv: f32 = x;
var red: vec3<f32> = vec3<f32>(1., 1., 1.);
var yellow: vec3<f32> = vec3<f32>(0., 1., 0.5);
var green: vec3<f32> = vec3<f32>(0.2, 0.5, 1.);
var lightblue: vec3<f32> = vec3<f32>(0.5, 1., 1.);
var blue: vec3<f32> = vec3<f32>(0.5, 0., 1.);
var pink: vec3<f32> = vec3<f32>(1., 0., 1.);
xv = fract(xv) * 6.;
if (xv < 1.) {
    return color_interpolate(pink, red, yellow, green, fract(xv));
}
if (xv < 2.) {
    return color_interpolate(red, yellow, green, lightblue, fract(xv));
}
if (xv < 3.) {
    return color_interpolate(yellow, green, lightblue, blue, fract(xv));
}
if (xv < 4.) {
    return color_interpolate(green, lightblue, blue, pink, fract(xv));
}
if (xv < 5.) {
    return color_interpolate(lightblue, blue, pink, red, fract(xv));
}
if (xv <= 6.) {
    return color_interpolate(blue, pink, red, yellow, fract(xv));
}
return vec4<f32>(0., 0., 0., 1.);