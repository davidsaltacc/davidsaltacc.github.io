var x: f32 = z.y + 1. - (1.4 + sin(z.y * pi) * 0.4 + c.x) * pow(z.x, 2.);
var y: f32 = (0.3 + cos((z.x + z.y) * pi) * 0.2 + c.y) * x;
x = (4. + cos(z.x * pi) * 3. + (c.x + c.y)) * x * (1. - x);
return apply_post_function(vec2<f32>(x, y), c);