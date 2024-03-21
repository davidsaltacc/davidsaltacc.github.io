return apply_post_function(vec2<f32>(
    sin(z.x) * sinh(z.y), 
    cos(z.y) * cosh(z.x)
), c) + c;