var xp: f32 = x * pi * 2.;
return vec4<f32>(
    .2 + sin(xp + 2.) / 1.5,
    .65 + sin(xp + 2.) / 2.,
    .2 + sin(xp + 2.) / 1.5,
    1.
);