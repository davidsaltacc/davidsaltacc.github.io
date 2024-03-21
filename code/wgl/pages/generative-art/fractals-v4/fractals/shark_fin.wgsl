return apply_post_function(vec2<f32>(
    z.x * z.x - abs(z.y) * z.y,
    z.x * z.y * 2.
), c) + c;