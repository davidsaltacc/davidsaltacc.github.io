if (z.y > 0.5) {
    return apply_post_function(vec2<f32>(2. * z.x, 2. * z.y - 1.), c);
} else if (z.x > 0.5) {
    return apply_post_function(vec2<f32>(2. * z.x - 1., 2. * z.y), c);
} else {
    return apply_post_function(vec2<f32>(2. * z.x, 2. * z.y), c);
}
