return apply_post_function(vec2<f32>(
    z.x * z.x * z.x - z.y * z.y * abs(z.y), 
    2.0 * z.x * z.y
), c) + c;