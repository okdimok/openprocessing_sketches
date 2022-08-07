
var [size_x, size_y] = [3840, 2160];
var [size_x, size_y] = [500, 500];

var disturbance = 0.3;

function setup() {
	createCanvas(size_x, size_y);
	background("#000");
	noStroke();
}

function clip(v, minv, maxv) {
	if (v < minv) return minv;
	if (v > maxv) return maxv;
	return v;
}

let realMod = v => v - Math.floor(v);

function hslFracToColor(h, s, l) {
	return color("hsl(" +
		(realMod(h) * 360).toFixed(0) + ", " +
		(clip(s, 0, 1)*100).toFixed(0) + "%, " +
		(clip(l, 0, 1)*100).toFixed(0) + "%" +
		")");	
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
		ratios = ratios.map(r => r / total);
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
	constructor (x, y) {
		this.x = x;
		this.y = y;
	}

	distance (other) {
		return Math.sqrt(this.distanceSqr(other));
	}
	
	distanceSqr (other) {
		return ((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
	}
	
	add (other) {
		this.x += other.x;
		this.y += other.y;
		return this
	}
	
	scale (s) {
		this.x *= s;
		this.y *= s;
		return this;
	}
	
	getProjectedToCanvas(){
		return new Point(this.x % size_x, this.y % size_y);
	}
	
	copy() {
		return new Point(this.x, this.y);
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
	let distances = colorPoints.map(cp => p5.Vector.sub(cp.p, point).magSq());
	let closest = argminN(distances, 3);
	let pairs = closest.map(v => [colorPoints[v[0]].c, v[1] ** (-2)]);
	return Color.mixMany(...pairs);

}
class Dynamics {
	constructor(q, qdot) {
		this.q = q;
		this.qdot = qdot;
	}
	
	step(frame_s, elapsed_s) {
		console.assert(frame_s !== undefined);
		let dq = this.qdot.copy().mult(frame_s);
		this.q.add(dq);
	}
}

class PerlinDynamics {
	constructor(q, qdot) {
		this.qinit = q;
		this.q = q.copy();
		this.qdot = qdot;
	}
	
	step(frame_s, elapsed_s) {
		console.assert(frame_s !== undefined);
		this.q.x = this.qinit.x + map(noise(elapsed_s*0.2), 0, 1, -1, 1)*100;
		this.q.y = this.qinit.y + map(noise(elapsed_s*0.2, 20), 0, 1, -1, 1)*100;
	}
}

// Initialization
let d = new PerlinDynamics(new p5.Vector(100, 200), new p5.Vector(10, 300));

var start, previousTimeStamp;
function draw() {
	var timestamp = millis();
	if (start === undefined) {
		start = timestamp;
		previousTimeStamp = timestamp;
		return;
	}
	const elapsed_ms = timestamp - start;
	const elapsed_s = elapsed_ms / 1000;
	const frame_s = (timestamp - previousTimeStamp)/1000;
	
	// main function body
	if (previousTimeStamp !== undefined) {
		d.step(frame_s, elapsed_s);
	}
	background("#00000001");
	fill( "#ffff00");
	var center = d.q;
	ellipse(center.x, center.y, 10, 10);
	
	// final housekeeping
	previousTimeStamp = timestamp;
}