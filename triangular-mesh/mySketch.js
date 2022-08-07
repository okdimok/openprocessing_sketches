//generativeartistry.com/tutorials/triangular-mesh/
// ty <3 ruth & tim


// var canvas = document.querySelector('canvas');
// var ctx = canvas.getContext('2d');

var [size_x, size_y] = [3840, 2160];
var [size_x, size_y] = [500, 500];
// var size = size_x;
var disturbance = 0.3;
var n_triangles_per_side = 20;
var dpr = window.devicePixelRatio;
// canvas.width = size_x * dpr;
// canvas.height = size_y * dpr;
// ctx.scale(dpr, dpr);
// ctx.lineJoin = 'bevel';

// let noise = p5.prototype.noise;

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

function colorByPoint(point) {
	// return "#ff0000";
	// return color = '#' +
	// 	colorFracToHex(Math.random()) +
	// 	colorFracToHex(point.x/size) +
	// 	colorFracToHex(point.y/size);
	return hslFracToColor(
		// 0.05 + point.x/size/2.5
		// randomIn(0.05, 0.1),
		-0.1 + 0.4 * Math.sin(1*point.x/size_x + (point.y/size_x)**2),
		randomIn(0.8, 1.0),
		randomIn(0.4, 0.7),
	);
}

function middle(vertices){
	var middle = {};
	const s = 1.0/vertices.length;
	for (const v in vertices) {
		for (const k in vertices[v]) {
			if (!(k in middle)) middle[k] = 0.0;
			middle[k] += s * vertices[v][k];
		}
	}
	return middle;
}

function randomIn(left, right) {
	return left + Math.random()*(right - left);
}

function drawPatternOnce() {
	var line, dot,
	odd = false,
	lines = [],
	gap = size_x / n_triangles_per_side;

	for (var y = - gap / 2; y <= size_x + 3*gap; y += gap) {
		odd = !odd;
		line = [];
		for (var x = gap / 4 - 2 * gap; x <= size_x + gap; x += gap) {
			dot = {
				x: x + (odd ? gap / 2 : 0),
				y: y
			};
			line.push({
				x: x + (2 * Math.random() - 1.0) * disturbance * gap + (odd ? gap / 2 : 0),
				y: y + (2 * Math.random() - 1.0) * disturbance * gap
			});
		}
		lines.push(line);
	}

	var dotLine;
	odd = true;





	for (var y = 0; y < lines.length - 1; y++) {
		odd = !odd;
		dotLine = [];
		for (var i = 0; i < lines[y].length; i++) {
			dotLine.push(odd ? lines[y][i] : lines[y + 1][i]);
			dotLine.push(odd ? lines[y + 1][i] : lines[y][i]);
		}
		for (var i = 0; i < dotLine.length - 2; i++) {
			var vertices = [dotLine[i], dotLine[i + 1], dotLine[i + 2]];
			var coords = [];
			for (let v of vertices.values()) {
				coords = coords.concat([v.x, v.y])
			}
			const color = colorByPoint(middle(vertices))
			fill(color);
			stroke(color);
			strokeWeight(1);
			triangle(...coords);
			// drawTriangle(vertices, colorByPoint(middle(vertices)));
		}
	}
}

function setup() {
	createCanvas(size_x, size_y);
	background("#000");
	drawPatternOnce();
}

function mouseClicked(){
	drawPatternOnce();
}