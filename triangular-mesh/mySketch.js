//generativeartistry.com/tutorials/triangular-mesh/
// ty <3 ruth & tim


var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');

var [size_x, size_y] = [3840 , 2160];
var [size_x, size_y] = [500, 500];
var size =  size_x;
var disturbance = 0.3;
var n_triangles_per_side = 20;
var dpr = window.devicePixelRatio;
canvas.width = size_x * dpr;
canvas.height = size_y * dpr;
context.scale(dpr, dpr);
context.lineJoin = 'bevel';

function draw() {

	var line, dot,
		odd = false,
		lines = [],
		gap = size / n_triangles_per_side;

	for (var y = - gap / 2; y <= size + 3*gap; y += gap) {
		odd = !odd;
		line = [];
		for (var x = gap / 4 - 2 * gap; x <= size + gap; x += gap) {
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

	function drawTriangle(vertices, color) {
		var [pointA, pointB, pointC] = vertices;
		context.beginPath();
		context.moveTo(pointA.x, pointA.y);
		context.lineTo(pointB.x, pointB.y);
		context.lineTo(pointC.x, pointC.y);
		context.lineTo(pointA.x, pointA.y);
		context.closePath();
		// context.lineWidth = 5;
		context.lineWidth = 0;
		context.strokeStyle = color;
		context.fillStyle = color;
		context.fill();
		context.stroke();

	}

	var dotLine;
	odd = true;

	function clip(v, minv, maxv) {
		if (v < minv) return minv;
		if (v > maxv) return maxv;
		return v;
	}

	let realMod = v => v - Math.floor(v);

	function hslFracToColor(h, s, l) {
		return "hsl(" +
			realMod(h) * 360 + ", " +
			clip(s, 0, 1)*100 + "%, " +
			clip(l, 0, 1)*100 + "%" +
			")";	
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
			-0.1 + 0.4 * Math.sin(1*point.x/size + (point.y/size)**2),
			randomIn(0.8, 1.0),
			randomIn(0.4, 0.7),
		);
	}

	function middle(vertices){
		var middle = {};
		const scale = 1.0/vertices.length;
		for (const v in vertices) {
			for (const k in vertices[v]) {
				if (!(k in middle)) middle[k] = 0.0;
				middle[k] += scale * vertices[v][k];
			}
		}
		return middle;
	}

	function randomIn(left, right) {
		return left + Math.random()*(right - left);
	}



	for (var y = 0; y < lines.length - 1; y++) {
		odd = !odd;
		dotLine = [];
		for (var i = 0; i < lines[y].length; i++) {
			dotLine.push(odd ? lines[y][i] : lines[y + 1][i]);
			dotLine.push(odd ? lines[y + 1][i] : lines[y][i]);
		}
		for (var i = 0; i < dotLine.length - 2; i++) {
			var vertices = [dotLine[i], dotLine[i + 1], dotLine[i + 2]];
			drawTriangle(vertices, colorByPoint(middle(vertices)));
		}
	}
	
}

draw();
canvas.onclick = draw;

//
//
/*

color shapes on grid

*/