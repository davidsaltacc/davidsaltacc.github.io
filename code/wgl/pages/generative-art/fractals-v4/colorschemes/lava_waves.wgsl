var x_var: f32 = x;
x_var = x_var * (2.);
x_var = fract(x_var + 0.5);
return vec4<f32>((128. * sin(6.25 * (x_var + 0.5)) + 128.) / 255., (63. * sin(x_var * 99.72) + 97.) / 255., (128. * sin(6.23 * x_var) + 128.) / 255., 1.);