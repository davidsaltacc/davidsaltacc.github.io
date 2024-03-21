return apply_post_function(vec2<f32>(
    abs(z.x - z.y), 
    2. * z.x * z.y
), c) + c;