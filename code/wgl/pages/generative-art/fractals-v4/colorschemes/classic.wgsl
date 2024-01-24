var xp: f32 = x * pi * 2.;
return vec4<f32>(
    .5 + sin(xp) / 2.,
    .5 + sin(xp + 1.) / 2.,
    .5 + sin(xp + 2.) / 2.,
    1.
);