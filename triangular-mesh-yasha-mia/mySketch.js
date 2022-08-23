//generativeartistry.com/tutorials/triangular-mesh/
// ty <3 ruth & tim

let triangular_mesh_yasha_mia = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
    var [size_x, size_y] = [3840, 2160];
    var [size_x, size_y] = [500, 500];

    var disturbance = 0.8;
	var n_triangles_per_side = 20;
	var n_points = 100;
	var spatialGradient = undefined;

	this.drawPatternOnce = function() {
		let colorPoints = [];
		for (var i = 0; i < n_points/2; i++){
			colorPoints.push(new utils.ColorPoint(new p5.Vector(
					utils.randomIn(0, size_x),
					utils.randomIn(0, size_y)
				),
				new utils.Color(0, 0.8, 0.6)
			))
		}
		for (var i = 0; i < n_points/2; i++){
			colorPoints.push(new utils.ColorPoint(new p5.Vector(
					utils.randomIn(0, size_x),
					utils.randomIn(0, size_y)
				),
				new utils.Color(1., 1., 1.)
			))
		}
		spatialGradient = new utils.SpatialGradient(colorPoints, 3);


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
				const color = colorByPoint(utils.middle(vertices.map(pd => pd.q)))
				s.fill(color);
				s.stroke(color);
				s.strokeWeight(1);
				s.triangle(...coords);
			}
		}

		// const rad = 3;
		// for (var x = -rad; x <= size_x + 2 * rad; x += 2 * rad) {
		// 	for (var y = -rad; y <= size_y + 2 * rad; y += 2 * rad) {
		// 		let p = new p5.Vector(x, y);
		// 		s.fill(colorByPoint(utils.middle([p, p])))
		// 		s.circle(x, y, 2*rad);
		// 	}
		// }
	};

	function colorByPoint(point) {
		// return "#ff0000";
		// return color = '#' +
		// 	colorFracToHex(Math.random()) +
		// 	colorFracToHex(point.x/size) +
		// 	colorFracToHex(point.y/size);
		return spatialGradient.getPointColor(point).getHex();
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

	s.mouseClicked = function(){
		drawPatternOnce();
	}
	
}



