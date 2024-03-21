var polar: vec2<f32> = to_polar(z);
var r: f32 = pow(polar.x, power);
var theta: f32 = power * abs(polar.y);
return c + apply_post_function(r * vec2(cos(theta), sin(theta)), c);