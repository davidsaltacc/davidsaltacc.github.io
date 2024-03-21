return apply_post_function(
    c_pow(vec2<f32>(
        z.y - sign(z.x) * sqrt(abs(c.y * z.x - (c.x + c.y))), 
        c.x - z.x
    ), power
), c);