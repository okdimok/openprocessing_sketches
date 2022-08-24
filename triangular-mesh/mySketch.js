//generativeartistry.com/tutorials/triangular-mesh/
// ty <3 ruth & tim

let triangular_mesh = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
    var [size_x, size_y] = [3840, 2160];
    var [size_x, size_y] = [500, 500];

    var disturbance = 0.3;
	var n_triangles_per_side = 20;

	this.prepareNewGrid = function() {
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
				line.push(new utils.PerlinDynamics(new p5.Vector(
						x + (odd ? gap / 2 : 0),
						y 
					), new p5.Vector(
						disturbance * gap,
						disturbance * gap,
					),
					5
				));
			}
			lines.push(line);
		}
		return lines;
	}

	this.drawPatternOnAGrid = function () {
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
					coords = coords.concat([v.q.x, v.q.y])
				}
				const color = colorByPoint(utils.middle0(vertices.map(pd => pd.q)))
				s.fill(color);
				s.stroke(color);
				s.strokeWeight(1);
				s.triangle(...coords);
			}
		}
	}

	var prev = s.millis(), curr = s.millis();
	this.stepGrid = function (){
		curr = s.millis();
		for (var y = 0; y < lines.length - 1; y++) {
			odd = !odd;
			dotLine = [];
			for (var i = 0; i < lines[y].length; i++) {
				lines[y][i].step(curr/1000, (curr-prev)/1000);
			}
		}
		prev = curr;

	}

	this.draw = function(){
		this.stepGrid();
		this.drawPatternOnAGrid();
	}

	this.drawPatternOnce = function() {
		this.prepareNewGrid();
		this.drawPatternOnAGrid();
	};

	function colorByPoint(point) {
		// return "#ff0000";
		// return color = '#' +
		// 	colorFracToHex(Math.random()) +
		// 	colorFracToHex(point.x/size) +
		// 	colorFracToHex(point.y/size);
		return utils.hslFracToColor(
			// 0.05 + point.x/size/2.5
			// randomIn(0.05, 0.1),
			-0.1 + 0.4 * Math.sin(1*point.x/size_x + (point.y/size_x)**2),
			utils.randomIn(0.8, 1.0),
			utils.randomIn(0.4, 0.7),
		);
	}
	

    s.setup = function() {
        s.createCanvas(size_x, size_y);
        s.background("#000");
		drawPatternOnce()
    }

	s.mouseClicked = function() {
		drawPatternOnce();
	}
	
}



