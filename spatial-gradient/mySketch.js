var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

var [size_x, size_y] = [3840, 2160];
var [size_x, size_y] = [500, 500];
var size = size_x;
var disturbance = 0.3;
var n_triangles_per_side = 20;
var dpr = window.devicePixelRatio;
canvas.width = size_x * dpr;
canvas.height = size_y * dpr;
ctx.scale(dpr, dpr);
ctx.lineJoin = 'bevel';
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

function clip(v, minv, maxv) {
	if (v < minv) return minv;
	if (v > maxv) return maxv;
	return v;
}

let realMod = v => v - Math.floor(v);

function hslFracToColor(h, s, l) {
	return "hsl(" +
		realMod(h) * 360 + ", " +
		clip(s, 0, 1) * 100 + "%, " +
		clip(l, 0, 1) * 100 + "%" +
		")";
}

function colorFracToHex(frac_orig) {
	var frac = clip(frac_orig, 0, 0.999)
	var s = Math.floor(frac * 256).toString(16);
	if (s.length == 1) return "0" + s;
	if (s.length == 2) return s;
	return "00";
}

class ColorPoint {
	constructor(point, color) {
		this.p = point;
		this.c = color;
	}
}

class Color {
	constructor(r, g, b) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.channels = ["r", "g", "b"];
	}

	mix(other, ratio) {
		if (ratio == undefined) ratio = 0.5;
		let result = new Color();
		for (let c in this.channels) {
			result[c] = this[c] * (1 - ratio) + other[c] * ratio;
		}
	}

	getHex() {
		return "#" +
			colorFracToHex(this.r) +
			colorFracToHex(this.g) +
			colorFracToHex(this.b);
	}

	static mixMany(...colors) {
		let result = new Color();
		var ratios = colors.map(c => c[1]);
		var total = ratios.reduce((partialSum, r) => partialSum + r, 0);
		ratios = ratios.map(r => r/total);
		for (var ch of Object.values(result.channels)) {
			result[ch] = 0.0;
			for (let i = 0; i < colors.length; i++) {
				result[ch] += ratios[i] * colors[i][0][ch];
			}
		}
		return result;
	}
}

class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	distance(other) {
		return Math.sqrt(this.distanceSqr(other));
	}
	
	distanceSqr(other) {
		return ((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
	}
}

function circle(point, radius, color) {
	ctx.beginPath();
	ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
	ctx.closePath();
	if (color !== undefined) {
		ctx.fillStyle = color;
		ctx.fill();
	}
}

// Takes an array and a number of needed minimal values
// returns an array of pairs [[min_index, value_at_that_index]]
function argminN(ar, n) {
	let minPairs = [];
	for (var [k, v] of Object.entries(ar)) {
		if (minPairs.length < n) {
			minPairs.push([k, v])
		} else {
			if (v < minPairs[n - 1][1]) {
				minPairs[n - 1] = [k, v];
			} else {
				continue;
			}
		}
		minPairs.sort((a, b) => a[1] - b[1]);
	}
	return minPairs;
}

function getPointColor(point, colorPoints) {
	let distances = colorPoints.map(cp => cp.p.distanceSqr(point));
	let closest = argminN(distances, 3);
	// let pairs = closest.map (v => [colorPoints[v[0]].c, size_x + size_y - v[1]]);
	let pairs = closest.map (v => [colorPoints[v[0]].c, v[1]**(-1)]);
	return Color.mixMany(...pairs);

}

function draw() {
	var colorPoints = [
		new ColorPoint(new Point(10, 10), new Color(0.1, 0.2, 0.3)),
		new ColorPoint(new Point(100, 10), new Color(0.1, 0.7, 0.3)),
		new ColorPoint(new Point(10, 200), new Color(0.7, 0.2, 0.3)),
		new ColorPoint(new Point(200, 200), new Color(1.1, 0.2, 0.3)),
		new ColorPoint(new Point(500, 200), new Color(0, 1.2, 1.3)),
		new ColorPoint(new Point(300, 500), new Color(0, 0., 1.3)),
	];
	// for (const cp of Object.values(colorPoints)) {
	// 	circle(cp.p, 10, cp.c.getHex());
	// }
	const rad = 10;
	for (var x = -rad; x <= size_x + 2 * rad; x += 2 * rad) {
		for (var y = -rad; y <= size_y + 2 * rad; y += 2 * rad) {
			let p = new Point(x, y)
			circle(p, rad, getPointColor(p, colorPoints).getHex());
		}
	}
	
	// let p = new Point(200, 300);
	// circle(p, rad, getPointColor(p, colorPoints).getHex());
}

draw();
canvas.onclick = draw;