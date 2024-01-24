var xp: f32 = x * pi * 1.6;
return vec4<f32>(
    .5 + sin(xp + 1.) / 2.,
    .5 + sin(xp + 1.) / 2.,
    .5 + sin(xp + 1.) / 2.,
    1.
);