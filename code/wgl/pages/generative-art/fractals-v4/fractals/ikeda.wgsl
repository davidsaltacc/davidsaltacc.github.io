var t: f32 = 0.4 - 6. / (1. + z.x * z.x + z.y * z.y);
return apply_post_function(vec2<f32>(
    1. + c.x * (z.x * cos(t) - z.y * sin(t)), 
    c.y * (z.x * sin(t) + z.y * cos(t))
), c);