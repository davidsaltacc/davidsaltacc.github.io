(function(global) {
global.noise = {};

var F3 = (1 / 3);
var G3 = (1 / 6);
var F2 = 0.5 * (Math.sqrt(3) - 1);
var G2 = (3 - Math.sqrt(3)) / 6;

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

var dot2 = function(grad, x, y) {
	return grad[0] * x + grad[1] * y;
}
var dot3 = function(grad, x, y, z) {
	return grad[0] * x + grad[1] * y + grad[2] * z;
}

var perm = new Array(512);
var gradP = new Array(512);

global.noise.seed = function(seed) {
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

global.noise.seed(0);

global.noise.simplex2d = function(x, y) {
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
    var gi0 = gradP[i+   perm[j   ]];
    var gi1 = gradP[i+i1+perm[j+j1]];
    var gi2 = gradP[i+1+ perm[j+1 ]];
	var t0 = 0.5 - x0 ** 2 - y0 ** 2;
	var t1 = 0.5 - x1 ** 2 - y1 ** 2;
	var t2 = 0.5 - x2 ** 2 - y2 ** 2;
	var t3 = 0.5 - x3 ** 2 - y3 ** 2;
	if (t0 > 0) {
		t0 *= t0;
		n0 = t0 ** 2 * dot2(gi0, x0, y0);
	}
	if (t1 > 0) {
		t1 *= t1;
		n1 = t1 ** 2 * dot2(gi1, x1, y1);
	}
	if (t2 > 0) {
		t2 *= t2;
		n2 = t2 ** 2 * dot2(gi2, x2, y2);
	}
	return 70 * (n0 + n1 + n2)
}

global.noise.simplex3d = function(x, y, z) {
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
	var gi0 = gradP[i+   perm[j+   perm[k   ]]];
    var gi1 = gradP[i+i1+perm[j+j1+perm[k+k1]]];
    var gi2 = gradP[i+i2+perm[j+j2+perm[k+k2]]];
    var gi3 = gradP[i+ 1+perm[j+ 1+perm[k+ 1]]];
	var t0 = 0.6 - x0 ** 2 - y0 ** 2 - z0 **2;
	var t1 = 0.6 - x1 ** 2 - y1 ** 2 - z1 **2;
	var t2 = 0.6 - x2 ** 2 - y2 ** 2 - z2 **2;
	var t3 = 0.6 - x3 ** 2 - y3 ** 2 - z3 **2;
	if (t0 > 0) {
		t0 *= t0;
		n0 = t0 ** 2 * dot3(gi0, x0, y0, z0);
	}
	if (t1 > 0) {
		t1 *= t1;
		n1 = t1 ** 2 * dot3(gi1, x1, y1, z1);
	}
	if (t2 > 0) {
		t2 *= t2;
		n2 = t2 ** 2 * dot3(gi2, x2, y2, z2);
	}
	if (t3 > 0) {
		t3 *= t3;
		n3 = t3 ** 2 * dot3(gi3, x3, y3, z3);
	}
	return 32 * (n0 + n1 + n2 + n3);
}

var fade = function(t) {
	t * t * t * (t * (t * 6 - 15) + 10);
}
var lerp = function(a, b, t) {
	return (1 - t) * a + t * b;
}

global.noise.perlin2d = function(x, y) {
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

global.noise.perlin3d = function(x, y, z) {
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


})(this);