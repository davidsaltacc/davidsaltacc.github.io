return apply_post_function(c_multiplication(
    c_division(
        c_multiplication(vec2<f32>(1., -1.), z), vec2<f32>(2., 0.)
    ),
    c_division(
        c_multiplication(vec2<f32>(1., 1.), z - vec2<f32>(1., 0.)),
        vec2<f32>(2., 0.)
    )
), c) + c;