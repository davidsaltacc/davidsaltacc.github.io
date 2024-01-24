if (sqrt(z.x * last_z.x + z.y * last_z.y) > radius) {
    color_v = f32(iteration) / f32(maxIterations);
    break;
} else if (iteration == maxIterations) {
    color_black = true;
}