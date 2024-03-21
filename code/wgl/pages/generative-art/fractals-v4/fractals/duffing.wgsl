return apply_post_function(vec2<f32>(
    z.y, 
    -1. * c.y * z.x + c.x * z.y - z.y * z.y * z.y
), c);