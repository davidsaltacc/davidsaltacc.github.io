if (magnitude(z) > radius) {
    var float_iters: f32 = smooth_iters(iteration, z, last_z);
    color_v = float_iters / f32(maxIterations);
    break;
} else if (iteration == maxIterations) {
    color_black = true;
}