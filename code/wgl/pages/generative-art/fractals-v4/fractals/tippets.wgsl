var re: f32 = z.x * z.x - z.y * z.y + c.x;
var im: f32 = 2. * re * z.y + c.y;
return apply_post_function(vec2<f32>(re, im));