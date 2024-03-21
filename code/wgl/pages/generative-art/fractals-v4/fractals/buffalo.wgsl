var zp: vec2<f32> = c_pow(z, power);
return apply_post_function(vec2<f32>(abs(zp.x), abs(zp.y)), c) + c;