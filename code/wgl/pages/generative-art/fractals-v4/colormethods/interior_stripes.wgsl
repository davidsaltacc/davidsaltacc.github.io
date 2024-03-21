if (magnitude(z) > radius) {
	color_black = true;
} else if (iteration == maxIterations) {
	var float_iters: f32 = magnitude(z);
	stripe += weierstrass(atan2(z.y, z.x)) * fract(float_iters);
	color_v = log(float_iters / square(log(float_iters)) + 40. * abs(stripe) / float_iters);
} else {
	stripe += weierstrass(atan2(z.y, z.x));
}