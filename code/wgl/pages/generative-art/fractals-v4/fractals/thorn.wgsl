return apply_post_function(vec2<f32>(
    z.x / cos(z.y), 
    z.y / sin(z.x)
), c) + c;