(function(g) {

var noise = g.noise = {};

var F2 = 0.5 * (Math.sqrt(3) - 1);
var G2 = (3 - Math.sqrt(3)) / 6;
var F3 = (1 / 3);
var G3 = (1 / 6);
var F4 = (Math.sqrt(5.0) - 1.0) / 4.0;
var G4 = (5.0 - Math.sqrt(5.0)) / 20.0;

var p = [151,160,137,91,90,15,
	131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
	190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
	88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
	77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
	102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
	135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
	5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
	223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
	129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
	251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
	49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
	138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

var grad3 = [
	[1, 1, 0],
	[-1, 1, 0],
	[1, -1, 0],
	[-1, -1, 0],
	[1, 0, 1],
	[-1, 0, 1],
	[1, 0, -1],
	[-1, 0, -1],
	[0, 1, 1],
	[0, -1, 1],
	[0, 1, -1],
	[0, -1, -1]
];

var grad4 = [0, 1, 1, 1, 0, 1, 1, - 1, 0, 1, - 1, 1, 0, 1, - 1, - 1,
	0, - 1, 1, 1, 0, - 1, 1, - 1, 0, - 1, - 1, 1, 0, - 1, - 1, - 1,
	1, 0, 1, 1, 1, 0, 1, - 1, 1, 0, - 1, 1, 1, 0, - 1, - 1,
	- 1, 0, 1, 1, - 1, 0, 1, - 1, - 1, 0, - 1, 1, - 1, 0, - 1, - 1,
	1, 1, 0, 1, 1, 1, 0, - 1, 1, - 1, 0, 1, 1, - 1, 0, - 1,
	- 1, 1, 0, 1, - 1, 1, 0, - 1, - 1, - 1, 0, 1, - 1, - 1, 0, - 1,
	1, 1, 1, 0, 1, 1, - 1, 0, 1, - 1, 1, 0, 1, - 1, - 1, 0,
	- 1, 1, 1, 0, - 1, 1, - 1, 0, - 1, - 1, 1, 0, - 1, - 1, - 1, 0]

var dot2 = function(grad, x, y) {
	return grad[0] * x + grad[1] * y;
}
var dot3 = function(grad, x, y, z) {
	return grad[0] * x + grad[1] * y + grad[2] * z;
}

var perm = new Array(512);
var gradP = new Array(512);

noise.seed = function(seed) {
	seed = Math.floor(seed * 65536);
	if (seed < 256) {
		seed = (seed << 8) | seed;
	}
	for (var i = 0; i < 256; i++) {
		var s;
		if (i & 1) {
			s = seed;
		} else {
			s = (seed >> 8);
		}
		var v = p[i] ^ (s & 255);
		perm[i] = perm[i + 256] = v;
		gradP[i] = gradP[i + 256] = grad3[v % 12];
	}
}

noise.seed(0);

noise.simplex2d = function(x, y) {
	var n0 = n1 = n2 = 0;
	var s = (x + y) * F2;
	var i = Math.floor(x + s);
	var j = Math.floor(y + s);
	var t = (i + j) * G2;
	var x0 = x - i + t;
	var y0 = y - j + t;
	var i1, j1;
	if (x0 > y0) {
		i1 = 1; j1 = 0;
	} else {
		i1 = 0; j1 = 1;
	}
	var x1 = x0 - i1 + G2;
	var y1 = y0 - j1 + G2;
    var x2 = x0 - 1 + 2 * G2;
    var y2 = y0 - 1 + 2 * G2;
	i &= 255;
	j &= 255;
	var t0 = 0.5 - x0 ** 2 - y0 ** 2;
	var t1 = 0.5 - x1 ** 2 - y1 ** 2;
	var t2 = 0.5 - x2 ** 2 - y2 ** 2;
	if (t0 > 0) {
		t0 *= t0;
		var gi0 = gradP[i+   perm[j   ]];
		n0 = t0 ** 2 * dot2(gi0, x0, y0);
	}
	if (t1 > 0) {
		t1 *= t1;
		var gi1 = gradP[i+i1+perm[j+j1]];
		n1 = t1 ** 2 * dot2(gi1, x1, y1);
	}
	if (t2 > 0) {
		t2 *= t2;
		var gi2 = gradP[i+1+ perm[j+1 ]];
		n2 = t2 ** 2 * dot2(gi2, x2, y2);
	}
	return 70 * (n0 + n1 + n2)
}

noise.simplex3d = function(x, y, z) {
	var n0 = n1 = n2 = n3 = 0;
	var s = (x + y + z) * F3;
	var i = Math.floor(x + s);
	var j = Math.floor(y + s);
	var k = Math.floor(z + s);
	var t = (i + j + k) * G3;
	var x0 = x - i + t;
	var y0 = y - j + t;
	var z0 = z - k + t;
	var i1, j1, k1, i2, j2, k2;
	if (x0 >= y0) {
		j1 = 0;
		i2 = 1;
		if (y0 >= z0) {
			i1 = 1; k1 = 0; j2 = 1; k2 = 0;
		} else {
			j2 = 0;
			k2 = 1;
			if (x0 >= z0) {
				i1 = 1; k1 = 0;
			} else {
				i1 = 0; k1 = 1;
			}
		}
	} else {
		i1 = 0;
		j2 = 1;
		if (y0 < z0) {
			j1 = 0; k1 = 1; i2 = 0; k2 = 1;
		} else {
			j1 = 1;
			k1 = 0;
			if (x0 < z0) {
				i2 = 0; k2 = 1;
			} else {
				i2 = 1; k2 = 0;
			}
		}
	}
	var x1 = x0 - i1 + G3;
	var y1 = y0 - j1 + G3;
    var z1 = z0 - k1 + G3;
	var x2 = x0 - i2 + 2 * G3;
    var y2 = y0 - j2 + 2 * G3;
    var z2 = z0 - k2 + 2 * G3;
	var x3 = x0 - 1 + 3 * G3;
    var y3 = y0 - 1 + 3 * G3;
    var z3 = z0 - 1 + 3 * G3;
	i &= 255;
    j &= 255;
    k &= 255;
	var t0 = 0.6 - x0 ** 2 - y0 ** 2 - z0 **2;
	var t1 = 0.6 - x1 ** 2 - y1 ** 2 - z1 **2;
	var t2 = 0.6 - x2 ** 2 - y2 ** 2 - z2 **2;
	var t3 = 0.6 - x3 ** 2 - y3 ** 2 - z3 **2;
	if (t0 > 0) {
		t0 *= t0;
		var gi0 = gradP[i+   perm[j+   perm[k   ]]];
		n0 = t0 ** 2 * dot3(gi0, x0, y0, z0);
	}
	if (t1 > 0) {
		t1 *= t1;
		var gi1 = gradP[i+i1+perm[j+j1+perm[k+k1]]];
		n1 = t1 ** 2 * dot3(gi1, x1, y1, z1);
	}
	if (t2 > 0) {
		t2 *= t2;
		var gi2 = gradP[i+i2+perm[j+j2+perm[k+k2]]];
		n2 = t2 ** 2 * dot3(gi2, x2, y2, z2);
	}
	if (t3 > 0) {
		t3 *= t3;
		var gi3 = gradP[i+ 1+perm[j+ 1+perm[k+ 1]]];
		n3 = t3 ** 2 * dot3(gi3, x3, y3, z3);
	}
	return 32 * (n0 + n1 + n2 + n3);
}

noise.simplex4d = function(x, y, z, w) {
	var n0 = n1 = n2 = n3 = n4 = 0;
	var s = (x + y + z + w) * F4;
	var i = Math.floor(x + s);
	var j = Math.floor(y + s);
	var k = Math.floor(z + s);
	var l = Math.floor(w + s);
	var t = (i + j + k + l) * G4;
	var x0 = x - i + t;
	var y0 = y - j + t;
	var z0 = z - k + t;
	var w0 = w - l + t;
	var rx = ry = rz = rw = 0;
	if (x0 > y0) rx++;
    else ry++;
    if (x0 > z0) rx++;
    else rz++;
	if (x0 > w0) rx++;
    else rw++;
    if (y0 > z0) ry++;
    else rz++;
    if (y0 > w0) ry++;
    else rw++;
    if (z0 > w0) rz++;
    else rw++;
	var i1 = rx >= 3 ? 1 : 0;
	var j1 = ry >= 3 ? 1 : 0;
	var k1 = rz >= 3 ? 1 : 0;
	var l1 = rw >= 3 ? 1 : 0;
	var i2 = rx >= 2 ? 1 : 0;
	var j2 = ry >= 2 ? 1 : 0;
	var k2 = rz >= 2 ? 1 : 0;
	var l2 = rw >= 2 ? 1 : 0;
	var i3 = rx >= 1 ? 1 : 0;
	var j3 = ry >= 1 ? 1 : 0;
	var k3 = rz >= 1 ? 1 : 0;
	var l3 = rw >= 1 ? 1 : 0;
	var x1 = x0 - i1 + G4;
    var y1 = y0 - j1 + G4;
    var z1 = z0 - k1 + G4;
    var w1 = w0 - l1 + G4;
    var x2 = x0 - i2 + 2.0 * G4;
    var y2 = y0 - j2 + 2.0 * G4;
    var z2 = z0 - k2 + 2.0 * G4;
    var w2 = w0 - l2 + 2.0 * G4;
    var x3 = x0 - i3 + 3.0 * G4;
    var y3 = y0 - j3 + 3.0 * G4;
    var z3 = z0 - k3 + 3.0 * G4;
    var w3 = w0 - l3 + 3.0 * G4;
    var x4 = x0 - 1.0 + 4.0 * G4;
    var y4 = y0 - 1.0 + 4.0 * G4;
	var z4 = z0 - 1.0 + 4.0 * G4;
	var w4 = w0 - 1.0 + 4.0 * G4;
	i &= 255;
	j &= 255;
	k &= 255;
	l &= 255;
	var t0 = 0.6 - x0 ** 2 - y0 ** 2 - z0 ** 2 - w0 ** 2;
	var t1 = 0.6 - x1 ** 2 - y1 ** 2 - z1 ** 2 - w1 ** 2;
	var t2 = 0.6 - x2 ** 2 - y2 ** 2 - z2 ** 2 - w2 ** 2;
	var t3 = 0.6 - x3 ** 2 - y3 ** 2 - z3 ** 2 - w3 ** 2;
	var t4 = 0.6 - x4 ** 2 - y4 ** 2 - z4 ** 2 - w4 ** 2;
	if (t0 > 0) {
		t0 *= t0;
		var gi0 = (perm[i + perm[j + perm[k + perm[l]]]] % 32) * 4;
		n0 = t0 ** 2 * (grad4[gi0] * x0 + grad4[gi0 + 1] * y0 + grad4[gi0 + 2] * z0 + grad4[gi0 + 3] * w0);
	}
	if (t1 > 0) {
		t1 *= t1;
		var gi1 = (perm[i + i1 + perm[j + j1 + perm[k + k1 + perm[l + l1]]]] % 32) * 4;
		n1 = t1 ** 2 * (grad4[gi1] * x1 + grad4[gi1 + 1] * y1 + grad4[gi1 + 2] * z1 + grad4[gi1 + 3] * w1);
	}
	if (t2 > 0) {
		t2 *= t2;
		var gi2 = (perm[i + i2 + perm[j + j2 + perm[k + k2 + perm[l + l2]]]] % 32) * 4;
		n2 = t2 ** 2 * (grad4[gi2] * x2 + grad4[gi2 + 1] * y2 + grad4[gi2 + 2] * z2 + grad4[gi2 + 3] * w2);
	}
	if (t3 > 0) {
		t3 *= t3;
		var gi3 = (perm[i + i3 + perm[j + j3 + perm[k + k3 + perm[l + l3]]]] % 32) * 4;
		n3 = t3 ** 2 * (grad4[gi3] * x3 + grad4[gi3 + 1] * y3 + grad4[gi3 + 2] * z3 + grad4[gi3 + 3] * w3);
	}
	if (t4 > 0) {
		t4 *= t4;
		var gi4 = (perm[i + 1 + perm[j + 1 + perm[k + 1 + perm[l + 1]]]] % 32) * 4;
		n4 = t4 ** 2 * (grad4[gi4] * x4 + grad4[gi4 + 1] * y4 + grad4[gi4 + 2] * z4 + grad4[gi4 + 3] * w4);
	}
	return 27 * (n0 + n1 + n2 + n3 + n4);
}

var fade = function(t) {
	return t * t * t * (t * (t * 6 - 15) + 10);
}
var lerp = function(a, b, t) {
	return (1 - t) * a + t * b;
}

noise.perlin2d = function(x, y) {
	var X = Math.floor(x);
	var Y = Math.floor(y);
	x -= X;
	y -= Y;
	X &= 255;
	Y &= 255;
    var n00 = dot2(gradP[X+  perm[Y  ]], x,     y);
    var n01 = dot2(gradP[X+  perm[Y+1]], x,   y-1);
    var n10 = dot2(gradP[X+1+perm[Y  ]], x-1,   y);
    var n11 = dot2(gradP[X+1+perm[Y+1]], x-1, y-1);
	var u = fade(x);
	return lerp(
		lerp(n00, n10, u),
		lerp(n01, n11, u),
		fade(y)
	)
}

noise.perlin3d = function(x, y, z) {
	var X = Math.floor(x);
	var Y = Math.floor(y);
	var Z = Math.floor(z);
	x -= X;
	y -= Y;
	z -= Z;
	X &= 255;
	Y &= 255;
	Z &= 255;
    var n000 = dot3(gradP[X+  perm[Y+  perm[Z  ]]], x,   y,     z);
    var n001 = dot3(gradP[X+  perm[Y+  perm[Z+1]]], x,   y,   z-1);
    var n010 = dot3(gradP[X+  perm[Y+1+perm[Z  ]]], x,   y-1,   z);
    var n011 = dot3(gradP[X+  perm[Y+1+perm[Z+1]]], x,   y-1, z-1);
    var n100 = dot3(gradP[X+1+perm[Y+  perm[Z  ]]], x-1,   y,   z);
    var n101 = dot3(gradP[X+1+perm[Y+  perm[Z+1]]], x-1,   y, z-1);
    var n110 = dot3(gradP[X+1+perm[Y+1+perm[Z  ]]], x-1, y-1,   z);
    var n111 = dot3(gradP[X+1+perm[Y+1+perm[Z+1]]], x-1, y-1, z-1);
    var u = fade(x);
    var v = fade(y);
    var w = fade(z);
	return lerp(
		lerp(
			lerp(n000, n100, u),
			lerp(n001, n101, u),
			w
		),
		lerp(
			lerp(n010, n110, u),
			lerp(n011, n111, u),
			w
		),
		v
	)
}
/**
 * Calculates the perlin value for a 0D loopable noise.
 *
 * @param {number} a - The angle value.
 * @param {number} r - The radius value.
 * @param {number} cx - The center x-coordinate.
 * @param {number} cy - The center y-coordinate.
 * @return {number} The Perlin noise value.
 */
noise.perlin0dLoopable = function(a, r, cx, cy) { // not tested i hope it works
	var a_ = a || 0, // defaults
		r_ = r || 1,
		cx_ = cx || 0,
		cy_ = cy || 0;
	var xoff = (Math.cos(a_) + 1) / 2 * r_ + cx_;
	var yoff = (Math.sin(a_) + 1) / 2 * r_ + cy_;
	var v = global.noise.perlin2d(xoff, yoff);
	return v;
}

/**
 * Calculates the simplex value for a 0D loopable noise.
 *
 * @param {number} a - The angle value.
 * @param {number} r - The radius value.
 * @param {number} cx - The center x-coordinate.
 * @param {number} cy - The center y-coordinate.
 * @return {number} The Simplex noise value.
 */
noise.simplex0dLoopable = function(a, r, cx, cy) { // not tested i hope it works
	var a_ = a || 0, // defaults
		r_ = r || 1,
		cx_ = cx || 0,
		cy_ = cy || 0;
	var xoff = (Math.cos(a_) + 1) / 2 * r_ + cx_;
	var yoff = (Math.sin(a_) + 1) / 2 * r_ + cy_;
	var v = global.noise.simplex2d(xoff, yoff);
	return v;
}

/**
 * Calculates the perlin value for a 1D loopable noise.
 *
 * @param {number} a - The angle value.
 * @param {number} r - The radius value.
 * @param {number} x - The x-coordinate.
 * @param {number} cx - The center x-coordinate.
 * @param {number} cy - The center y-coordinate.
 * @param {number} cz - The center z-coordinate.
 * @return {number} The Perlin noise value.
 */
noise.perlin1dLoopable = function(a, r, x, cx, cy, cz) { // not tested i hope it works
	var a_ = a || 0, // defaults
		r_ = r || 1,
		cx_ = cx || 0,
		cy_ = cy || 0,
		cz_ = cz || 0;
	var xoff = (Math.cos(a_) + 1) / 2 * r_ + cx_;
	var yoff = (Math.sin(a_) + 1) / 2 * r_ + cy_;
	var zoff = cz_ + x;
	var v = noise.perlin3d(xoff, yoff, zoff);
    return v;
}

/**
 * Calculates the simplex value for a 1D loopable noise.
 *
 * @param {number} a - The angle parameter.
 * @param {number} r - The radius parameter.
 * @param {number} x - The x-coordinate.
 * @param {number} cx - The center x-coordinate.
 * @param {number} cy - The center y-coordinate.
 * @param {number} cz - The center z-coordinate.
 * @return {number} The simplex noise value.
 */
noise.simplex1dLoopable = function(a, r, x, cx, cy, cz) { // not tested i hope it works
	var a_ = a || 0, // defaults
		r_ = r || 1,
		cx_ = cx || 0,
		cy_ = cy || 0,
		cz_ = cz || 0;
	var xoff = (Math.cos(a_) + 1) / 2 * r_ + cx_;
	var yoff = (Math.sin(a_) + 1) / 2 * r_ + cy_;
    var zoff = cz_ + x;
    var v = noise.simplex3d(xoff, yoff, zoff);
    return v;
}
/**
 * Calculates the simplex value for a 2D loopable noise.
 *
 * @param {number} a - the angle parameter
 * @param {number} x - the x coordinate
 * @param {number} y - the y coordinate
 * @param {number} r - the radius parameter
 * @param {number} cx - the x center coordinate
 * @param {number} cy - the y center coordinate
 * @param {number} cz - the z center coordinate
 * @param {number} cw - the w center coordinate
 * @return {number} the simplex value
 */
noise.simplex2dLoopable = function(a, x, y, r, cx, cy, cz, cw) {
    var a_ = a || 0, // defaults
        x_ = x || 0,
        y_ = y || 0,
        r_ = r || 1,
        cx_ = cx || 0,
        cy_ = cy || 0,
        cz_ = cz || 0,
        cw_ = cw || 0;
	var xoff = (Math.cos(a_) + 1) / 2 * r_ + cx_;
	var yoff = (Math.sin(a_) + 1) / 2 * r_ + cy_;
	var zoff = (Math.cos(a_) + 1) / 2 * r_ + cz_;
	var woff = (Math.sin(a_) + 1) / 2 * r_ + cw_;
	var v = noise.simplex4d(x_ + xoff, y_ + yoff, zoff, woff);
	return v;
}
})(this);