if (magnitude(z) > radius) {
    color_black = true;
    break;
} else if (iteration == maxIterations) {
    color_v = log(magnitude(z));
}