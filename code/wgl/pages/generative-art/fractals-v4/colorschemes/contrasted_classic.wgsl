var xp: f32 = x * pi * 2.;
return vec4<f32>(
    sin(xp),
    sin(xp + 1.),
    sin(xp + 2.),
    1.
);