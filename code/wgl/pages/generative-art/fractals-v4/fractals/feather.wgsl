return apply_post_function(
    c_division(c_pow(z, 3.), vec2<f32>(1., 0.) + vec2<f32>(z.x * z.x, z.y * z.y))
, c) + c;