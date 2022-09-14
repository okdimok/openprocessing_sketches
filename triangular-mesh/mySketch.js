//generativeartistry.com/tutorials/triangular-mesh/
// ty <3 ruth & tim

let triangular_mesh = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
    var [size_x, size_y] = [3840, 2160];
    var [size_x, size_y] = [512, 512];

    var disturbance = 0.3;
	var n_triangles_per_side = 7;
	var noise_radius_pose = 0.2;
	var noise_radius_color = 0.1;
	var fps = 30;

	var lines=[];

	s.prepareNewGrid = function() {
		var line, dot,
		odd = false,
		gap = size_x / n_triangles_per_side;
		lines=[];
	
		for (var y = - gap / 2; y <= size_y + 3*gap; y += gap) {
			odd = !odd;
			line = [];
			for (var x = gap / 4 - 2 * gap; x <= size_x + 2*gap; x += gap) {
				dot = {
					x: x + (odd ? gap / 2 : 0),
					y: y
				};
				line.push(new utils.LoopNoiseDynamics(new p5.Vector(
						x + (odd ? gap / 2 : 0),
						y 
					), new p5.Vector(
						disturbance * gap,
						disturbance * gap,
					),
					noise_radius_pose
				));
			}
			lines.push(line);
		}
		return lines;
	}

	s.drawPatternOnAGrid = function () {
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
				// if (i < 5 || i > 7 ) continue;
				var vertices = [dotLine[i], dotLine[i + 1], dotLine[i + 2]];
				var coords = [];
				for (let v of vertices.values()) {
					coords = coords.concat([v.q.x, v.q.y])
				}
				const color = colorByPoint(utils.middle(vertices.map(pd => pd.q)), i, y)
				s.fill(color);
				s.stroke(color);
				s.strokeWeight(1);
				s.triangle(...coords);
			}
		}
	}

	s.addPearls = function (){
		for (var y = 0; y < lines.length - 1; y++) {
			for (var i = 0; i < lines[y].length; i++) {
				let p = lines[y][i].q;
				if (Math.random() < 0.99) {
					s.fill("#fff")
					// s.fill(yashaMiaColor())
					// s.stroke(yashaMiaColor())
					// s.strokeWeight(dpi/200)
					s.noStroke()
					s.circle(p.x, p.y, 0.15*gap)
				}
			}
		}
	}

	s.stepGrid = function (){
		let millis = s.millis();
		for (var y = 0; y < lines.length - 1; y++) {
			odd = !odd;
			dotLine = [];
			for (var i = 0; i < lines[y].length; i++) {
				lines[y][i].step(millis);
			}
		}
	}

	var saved = false;
	// https://github.com/spite/ccapture.js/#:~:text=The%20complete%20list%20of%20parameters%20is%3A
	// WebM image quality from 0.0 (worst) to 0.99999 (best), 1.00 (VP8L lossless) is not supported
	var capturer = new CCapture({ format: 'webm', framerate: fps, name: "triangularMesh", display: true, quality: 0.95 });
	s.draw = function(){
		if (s.animLoop.elapsedFramesTotal === 0) {
			capturer.start()
		}
		this.stepGrid();
		this.drawPatternOnAGrid();
		if (s.animLoop.elapsedLoops == 0) {
			capturer.capture(s.canvas);
		} else if (!saved) {
			capturer.stop();
			capturer.save();
			saved = true;
		}
	}

	s.drawPatternOnce = function() {
		lines = s.prepareNewGrid();
		s.drawPatternOnAGrid();
	};

	function colorByPoint(point, i ,j) {
		// return "#ff0000";
		// return color = '#' +
		// 	colorFracToHex(Math.random()) +
		// 	colorFracToHex(point.x/size) +
		// 	colorFracToHex(point.y/size);
		return utils.hslFracToColor(
			// 0.05 + point.x/size/2.5
			// randomIn(0.05, 0.1),
			-0.1 + 0.4 * Math.sin(1*point.x/size_x + (point.y/size_x)**2),
			s.map(s.animLoop.noise({seed: j*n_triangles_per_side + i + 0.5, radius: noise_radius_color}), -1, 1, 0.8, 1.0),
			s.map(s.animLoop.noise({seed: j*n_triangles_per_side + i, radius: noise_radius_color}), -1, 1, 0.4, 0.7),
		);		
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
		s.frameRate(fps);
		// https://github.com/mrchantey/p5.createLoop/tree/master/p5.createLoop#gif-options
		// https://github.com/jnordberg/gif.js#user-content-options
		s.createLoop(3,
            {
				noise: {},
                // gif: { fileName: "triangularMesh.gif", options: {workers:10, dither: "Stucki-serpentine", quality:1}, open: true, download: true, render: false, startLoop: 0, endLoop: 1 }
            })
		s.background("#000");
		s.drawPatternOnce()
    }

	s.mouseClicked = function() {
		s.drawPatternOnce();
	}
	
}



