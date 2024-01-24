if (magnitude(z) > radius) {
    color_v = f32(iteration) / f32(maxIterations);
    break;
} else if (iteration == maxIterations) {
    color_black = true;
}