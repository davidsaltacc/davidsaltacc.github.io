return apply_post_function(vec2<f32>(
    z.x + c.x * z.y, 
    z.y + c.y * sin(z.x)
), c);