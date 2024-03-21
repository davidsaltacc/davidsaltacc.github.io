return apply_post_function(vec2<f32>(
    sinh(z.x) * sin(z.y), 
    cosh(z.y) * cos(z.x)
), c) + c;