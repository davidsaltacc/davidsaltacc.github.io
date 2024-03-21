return apply_post_function(vec2<f32>(
    z.x - c.x * (z.y + tan(3. * z.y)), 
    z.y - c.y * (z.x + tan(3. * z.x))
), c);