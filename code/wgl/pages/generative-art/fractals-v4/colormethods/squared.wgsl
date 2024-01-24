if (magnitude(z) > radius) {
    var float_iters: f32 = smooth_iters(iteration, z, last_z);
    stripe += pow(atan2(z.y, z.x), 2.) * fract(float_iters);
    color_v = float_iters / square(log(float_iters)) + 40. * stripe / float_iters;
    color_v /= f32(maxIterations);
    break;
} else if (iteration == maxIterations) {
    color_black = true;
} else {
    stripe += pow(atan2(z.y, z.x), 2.);
}