
var plugin = new FRXPlugins.Plugin("mand_var", "Mandelbrot Variants", "Adds a lot of Mandlebrot Set variations. Credit to <a href=\"https://www.youtube.com/watch?v=HeUpSzC1vzU\">this youtube video</a> for discovering/listing/naming these.");
var ui = plugin.createUi();

FRXPlugins.CustomShaderCode.addCustomFractal(
"burn_ship_mand_bar", `
return vec2<f32>(
    z.x * z.x - z.y * z.y,
    2. * abs(z.x) * z.y
) + c;
`, 
1000000,
"Apparently the lower half of the Burning Ship, mirrored horizontally.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"celt_mand_bar", `
return vec2<f32>(
    abs(z.x * z.x - z.y * z.y),
    -2. * z.x * z.y
) + c;
`, 
1000000,
"Like the celtic, but a little different.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"buff_mand_bar", `
return vec2<f32>(
    abs(z.x * z.x - z.y * z.y),
    2. * abs(z.x) * z.y
) + c;
`, 
1000000,
"Its mouth looks a little like the one the celtic fractal has.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"perp_mand", `
return vec2<f32>(
    z.x * z.x - z.y * z.y,
    -2. * abs(z.x) * z.y
) + c;
`, 
1000000,
"Shares a lot of features with the mandelbrot set.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"perp_ship", `
return vec2<f32>(
    z.x * z.x - z.y * z.y,
    2. * z.x * abs(z.y)
) + c;
`, 
1000000,
"Already in the fractal explorer as the \"Duck\" fractal, but I decided to put it in here anyways.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"perp_celt", `
return vec2<f32>(
    abs(z.x * z.x - z.y * z.y),
    -2. * abs(z.x) * z.y
) + c;
`, 
1000000,
"Looks a little similar to the Celtic Mandlebar.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"perp_buff", `
return vec2<f32>(
    abs(z.x * z.x - z.y * z.y),
    -2. * z.x * abs(z.y)
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"airship", `
return vec2<f32>(
    z.x * z.x - abs(z.y) * z.y,
    2. * z.x * abs(z.y)
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"tail", `
return vec2<f32>(
    -1 * abs(z.x) * z.x - abs(z.y) * z.y,
    2. * z.x * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"quill", `
return vec2<f32>(
    abs(z.x) * z.x - abs(z.y) * z.y,
    2. * z.x * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"_sharkfin", `
return vec2<f32>(
    z.x * z.x - abs(z.y) * z.y,
    2. * z.x * z.y
) + c;
`, 
1000000,
"Already Included as a standart fractal. Still put it in here for completeness.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"power_drill", `
return vec2<f32>(
    z.x * z.x - abs(z.y) * z.y,
    -2. * z.x * z.y
) + c;
`, 
1000000,
"Pizza slice near its needle. I wonder how it tastes.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"big_and_little", `
return vec2<f32>(
    -1. * abs(z.x) * z.x - abs(z.y * z.y),
    -2. * abs(z.x * z.y)
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"halo", `
return vec2<f32>(
    -1. * abs(z.x) * z.x + abs(z.y) * z.y,
    2. * abs(z.x * z.y)
) + c;
`, 
1000000,
"Really tiny and hidden halo.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"genie_lamp", `
return vec2<f32>(
    z.x * z.x + abs(z.y) * z.y,
    2. * abs(z.x) * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"hook", `
return vec2<f32>(
    abs(z.x) * z.x - z.y * z.y,
    2. * z.x * abs(z.y)
) + c;
`, 
1000000,
"The head of the duck/perpendicular burning ship?",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"cow", `
return vec2<f32>(
    abs(z.x * z.x + abs(z.y) * z.y),
    -2. * abs(z.x * z.y)
) + vec2<f32>(c.x, -c.y); // flipping c, just so it looks better
`, 
1000000,
"Buffalo but no buffalo.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"sideways_ship", `
return vec2<f32>(
    abs(z.x * abs(z.x) + abs(z.y) * z.y),
    2. * z.x * z.y
) + c;
`, 
1000000,
"Turn it upside down, maybe then you can see it.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"inner_snake", `
return vec2<f32>(
    abs(z.x) * z.x - abs(z.y * z.y),
    -2. * abs(z.x * z.y)
) + c;
`, 
1000000,
"I didn't name it. I also have no idea where there might be a snake.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"outer_snake", `
return vec2<f32>(
    abs(z.x) * z.x + abs(z.y) * z.y,
    -2. * abs(z.x * z.y)
) + c;
`, 
1000000,
"... What snake?",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"sock_puppet", `
return vec2<f32>(
    abs(z.x * abs(z.x) + z.y * z.y),
    -2. * z.x * abs(z.y)
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"speedy_buffalo", `
return vec2<f32>(
    abs(z.x * abs(z.x) - z.y * abs(z.y)),
    -2. * abs(z.x * z.y)
) + c;
`, 
1000000,
"Buffalo go fast. Upside down, for some reason.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"smooth_buffalo", `
return vec2<f32>(
    abs(z.x * z.x + abs(z.y) * z.y),
    2. * abs(z.x * z.y)
) + c;
`, 
1000000,
"Buffalo go even more fast. Also upside down for some reason.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"aerodynamic", `
return vec2<f32>(
    abs(z.x * z.x + z.y * z.y),
    -2. * z.x * abs(z.y)
) + c;
`, 
1000000,
"Aerodynamic. Kind of looks like a buffalo fractal variation.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"pointed_buffalo", `
return vec2<f32>(
    abs(z.x * abs(z.x) + z.y * z.y),
    -2. * abs(z.x * z.y)
) + c;
`, 
1000000,
"Why are they all upside down? Are they stupid?",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"smart_buffalo", `
return vec2<f32>(
    abs(z.x * abs(z.x) - z.y * z.y),
    -2. * abs(z.x * z.y)
) + c;
`, 
1000000,
"\"Smart\"? Is he really? Oh, and its upside down, again.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"mallet", `
return vec2<f32>(
    -1 * abs(z.x) * z.x - abs(z.y * z.y),
    -2. * z.x * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"alien", `
return vec2<f32>(
    -1 * abs(z.x) * z.x - abs(z.y * z.y),
    2 * z.x * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"chainsaw", `
return vec2<f32>(
    abs(z.x) * z.x - abs(z.y) * z.y,
    2 * z.x * abs(z.y)
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"inner_double_snake", `
return vec2<f32>(
    abs(z.x) * z.x - z.y * z.y,
    -2 * abs(z.x) * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"outer_double_snake", `
return vec2<f32>(
    abs(z.x) * z.x - abs(z.y) * z.y,
    -2 * abs(z.x) * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"bat", `
return vec2<f32>(
    abs(z.x) * z.x - abs(z.y * z.y),
    2 * z.x * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"heart_", `
return vec2<f32>(
    abs(z.x) * z.x - z.y * z.y,
    2 * abs(z.x) * z.y
) + c;
`, 
1000000,
"Not to be confused with the other heart fractal.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"rotated_heart", `
return vec2<f32>(
    abs(z.x) * z.x - abs(z.y) * z.y,
    2 * abs(z.x) * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"crown", `
return vec2<f32>(
    abs(abs(z.x) * z.x - z.y * z.y),
    -2 * abs(z.x) * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"boomerang", `
return vec2<f32>(
    abs(z.x) * z.x + abs(z.y * z.y),
    2 * z.x * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"cupids_arrow", `
return vec2<f32>(
    -1 * abs(z.x) * z.x + z.y * z.y,
    2 * abs(z.x) * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"ellipsoid_parallelogram", `
return vec2<f32>(
    abs(z.x) * z.x - abs(z.y) * z.y,
    -2 * z.x * abs(z.y)
) + c;
`, 
1000000,
"A <i>what</i>?",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"bone", `
return vec2<f32>(
    -1 * abs(z.x) * z.x + abs(z.y) * z.y,
    2 * z.x * abs(z.y)
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"pointed_celtic", `
return vec2<f32>(
    abs(abs(z.x) * z.x + z.y * z.y),
    2 * z.x * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"washing_machine", `
return vec2<f32>(
    -1 * abs(z.x) * z.x - abs(z.y) * z.y,
    -2 * abs(z.x) * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"anchor", `
return vec2<f32>(
    abs(abs(z.x) * z.x + z.y * z.y),
    -2 * z.x * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"terminator", `
return vec2<f32>(
    abs(z.x * z.x + z.y * z.y),
    -2 * abs(z.x) * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"double_sector", `
return vec2<f32>(
    abs(abs(z.x) * z.x - z.y * z.y),
    -2 * z.x * z.y
) + c;
`, 
1000000,
"Two pizzas.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"super", `
return vec2<f32>(
    -1 * abs(z.x) * z.x - abs(z.y) * z.y,
    2 * z.x * abs(z.y)
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"wide_celtic", `
return vec2<f32>(
    abs(abs(z.x) * z.x - z.y * z.y),
    2 * z.x * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"spade", `
return vec2<f32>(
    abs(abs(z.x) * z.x + z.y * z.y),
    2 * abs(z.x) * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"umbrella", `
return vec2<f32>(
    abs(abs(z.x) * z.x + z.y * z.y),
    -2 * abs(z.x) * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"temple", `
return vec2<f32>(
    abs(abs(z.x) * z.x - z.y * z.y),
    2 * abs(z.x) * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"sleeping_snake", `
return vec2<f32>(
    -1 * abs(z.x) * z.x - abs(z.y) * z.y,
    2 * abs(z.x) * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"wide_alien", `
return vec2<f32>(
    -1 * abs(z.x) * z.x - z.y * z.y,
    -2 * abs(z.x) * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"titanic", `
return vec2<f32>(
    z.x * z.x - abs(z.y) * z.y,
    -2 * abs(z.x * z.y)
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"mountain", `
return vec2<f32>(
    abs(z.x * z.x + z.y * z.y),
    -2 * abs(z.x * z.y)
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"backwards_ship", `
return vec2<f32>(
    abs(z.x * z.x + abs(z.y) * z.y),
    2 * z.x * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"spaceship", `
return vec2<f32>(
    abs(abs(z.x) * z.x - abs(z.y) * z.y),
    2 * abs(z.x * z.y)
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"fake_ship", `
return vec2<f32>(
    z.x * z.x + abs(z.y) * z.y,
    -2 * abs(z.x * z.y)
) + c;
`, 
1000000,
"Its upside down. Great.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"ray_gun", `
return vec2<f32>(
    z.x * z.x + abs(z.y) * z.y,
    2 * z.x * abs(z.y)
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"claw", `
return vec2<f32>(
    -1 * abs(z.x) * z.x + z.y * z.y,
    2 * z.x * abs(z.y)
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"_fish", `
return vec2<f32>(
    abs(abs(z.x) * z.x + abs(z.y) * z.y),
    -2 * abs(z.x) * z.y
) + c;
`, 
1000000,
"Again, not to be confused with the other fish.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"bike_helmet", `
return vec2<f32>(
    abs(z.x * z.x + abs(z.y) * z.y),
    2 * abs(z.x) * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"boat_motor", `
return vec2<f32>(
    abs(z.x * z.x + abs(z.y) * z.y),
    -2 * z.x * abs(z.y)
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"nail_gun", `
return vec2<f32>(
    abs(z.x * z.x - abs(z.y) * z.y),
    -2 * z.x * z.y
) + c;
`, 
1000000,
"A little like the power drill. IT HAS A PIZZA SLICE!",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"speed_boat", `
return vec2<f32>(
    abs(abs(z.x) * z.x + abs(z.y) * z.y),
    2 * abs(z.x) * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"blow_dryer", `
return vec2<f32>(
    abs(abs(z.x) * z.x - abs(z.y) * z.y),
    -2 * z.x * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"left_rectangle", `
return vec2<f32>(
    abs(abs(z.x) * z.x - z.y * z.y),
    2 * z.x * abs(z.y)
) + c;
`, 
1000000,
"Just a messed up pizza slice.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"right_rectangle", `
return vec2<f32>(
    abs(abs(z.x) * z.x + abs(z.y) * z.y),
    2 * z.x * abs(z.y)
) + c;
`, 
1000000,
"Again just a messed up pizza slice.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"alligator", `
return vec2<f32>(
    abs(abs(z.x) * z.x + abs(z.y) * z.y),
    -2 * z.x * abs(z.y)
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"crocodile", `
return vec2<f32>(
    abs(z.x * z.x - abs(z.y) * z.y),
    -2 * z.x * abs(z.y)
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"tornado", `
return vec2<f32>(
    abs(z.x * z.x - abs(z.y) * z.y),
    -2 * abs(z.x) * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"pitcher", `
return vec2<f32>(
    z.x * z.x - abs(z.y) * z.y,
    -2 * abs(z.x) * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"rhombus", `
return vec2<f32>(
    z.x * z.x + z.y * z.y,
    2 * z.x * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"teardrop", `
return vec2<f32>(
    z.x * z.x + z.y * z.y,
    -2 * z.x * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

FRXPlugins.CustomShaderCode.addCustomFractal(
"pointed_teardrop", `
return vec2<f32>(
    z.x * z.x + z.y * z.y,
    2 * abs(z.x) * z.y
) + c;
`, 
1000000,
"ill add the description later.",
"ill add the formula later."
);

ui.createCustomFractalButton("burn_ship_mand_bar", "Burning Ship Mandlebar");
ui.createCustomFractalButton("celt_mand_bar", "Celtic Mandlebar");
ui.createCustomFractalButton("buff_mand_bar", "Buffalo Mandlebar");
ui.createCustomFractalButton("perp_mand", "Perpendicular Mandelbrot");
ui.createCustomFractalButton("perp_ship", "Perpendicular Burning Ship");
ui.createCustomFractalButton("perp_celt", "Perpendicular Celtic");
ui.createCustomFractalButton("perp_buff", "Perpendicular Buffalo");
ui.createCustomFractalButton("airship", "\"Airship\"");
ui.createCustomFractalButton("tail", "\"Tail\"");
ui.createCustomFractalButton("quill", "\"Quill\"");
ui.createCustomFractalButton("_sharkfin", "\"Shark Fin\"");
ui.createCustomFractalButton("power_drill", "\"Power Drill\"");
ui.createCustomFractalButton("big_and_little", "\"Big and Little\"");
ui.createCustomFractalButton("halo", "\"Halo\"");
ui.createCustomFractalButton("genie_lamp", "\"Genie Lamp\"");
ui.createCustomFractalButton("hook", "\"Hook\"");
ui.createCustomFractalButton("cow", "\"Cow\"");
ui.createCustomFractalButton("sideways_ship", "\"Sideways Ship\"");
ui.createCustomFractalButton("inner_snake", "\"Inner Snake\"");
ui.createCustomFractalButton("outer_snake", "\"Outer Snake\"");
ui.createCustomFractalButton("sock_puppet", "\"Sock Puppet\"");
ui.createCustomFractalButton("speedy_buffalo", "\"Speedy Buffalo\"");
ui.createCustomFractalButton("smooth_buffalo", "\"Smooth Buffalo\"");
ui.createCustomFractalButton("aerodynamic", "\"Aerodynamic\"");
ui.createCustomFractalButton("pointed_buffalo", "\"Pointed Buffalo\"");
ui.createCustomFractalButton("smart_buffalo", "\"Smart Buffalo\"");
ui.createCustomFractalButton("mallet", "\"Mallet\"");
ui.createCustomFractalButton("alien", "\"Alien\"");
ui.createCustomFractalButton("chainsaw", "\"Chainsaw\"");
ui.createCustomFractalButton("inner_double_snake", "\"Inner Double Snake\"");
ui.createCustomFractalButton("outer_double_snake", "\"Outer Double Snake\"");
ui.createCustomFractalButton("bat", "\"Bat\"");
ui.createCustomFractalButton("heart_", "\"Heart\"");
ui.createCustomFractalButton("rotated_heart", "\"Rotated Heart\"");
ui.createCustomFractalButton("crown", "\"Crown\"");
ui.createCustomFractalButton("boomerang", "\"Boomerang\"");
ui.createCustomFractalButton("cupids_arrow", "\"Cupid's Arrow\"");
ui.createCustomFractalButton("ellipsoid_parallelogram", "\"Ellipsoid Parallelogram\"");
ui.createCustomFractalButton("bone", "\"Bone\"");
ui.createCustomFractalButton("pointed_celtic", "\"Pointed Celtic\"");
ui.createCustomFractalButton("washing_machine", "\"Washing Machine\"");
ui.createCustomFractalButton("anchor", "\"Anchor\"");
ui.createCustomFractalButton("terminator", "\"Terminator\"");
ui.createCustomFractalButton("double_sector", "\"Double Sector\"");
ui.createCustomFractalButton("super", "\"Super\"");
ui.createCustomFractalButton("wide_celtic", "\"Wide Celtic\"");
ui.createCustomFractalButton("spade", "\"Spade\"");
ui.createCustomFractalButton("umbrella", "\"Umbrella\"");
ui.createCustomFractalButton("temple", "\"Temple\"");
ui.createCustomFractalButton("sleeping_snake", "\"Sleeping Snake\"");
ui.createCustomFractalButton("wide_alien", "\"Wide Alien\"");
ui.createCustomFractalButton("titanic", "\"Titanic\"");
ui.createCustomFractalButton("mountain", "\"Mountain\"");
ui.createCustomFractalButton("backwards_ship", "\"Backwards Ship\"");
ui.createCustomFractalButton("spaceship", "\"Spaceship\"");
ui.createCustomFractalButton("fake_ship", "\"Fake Ship\"");
ui.createCustomFractalButton("ray_gun", "\"Ray Gun\"");
ui.createCustomFractalButton("claw", "\"Claw\"");
ui.createCustomFractalButton("_fish", "\"Fish\"");
ui.createCustomFractalButton("bike_helmet", "\"Bike Helmet\"");
ui.createCustomFractalButton("boat_motor", "\"Boat Motor\"");
ui.createCustomFractalButton("nail_gun", "\"Nail Gun\"");
ui.createCustomFractalButton("speed_boat", "\"Speed Boat\"");
ui.createCustomFractalButton("blow_dryer", "\"Blow Dryer\"");
ui.createCustomFractalButton("left_rectangle", "\"Left Rectangle\"");
ui.createCustomFractalButton("right_rectangle", "\"Right Rectangle\"");
ui.createCustomFractalButton("alligator", "\"Alligator\"");
ui.createCustomFractalButton("crocodile", "\"Crocodile\"");
ui.createCustomFractalButton("tornado", "\"Tornado\"");
ui.createCustomFractalButton("pitcher", "\"Pitcher\"");
ui.createCustomFractalButton("rhombus", "\"Rhombus\"");
ui.createCustomFractalButton("teardrop", "\"Teardrop\"");
ui.createCustomFractalButton("pointed_teardrop", "\"Pointed Teardrop\"");
