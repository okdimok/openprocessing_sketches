let armenia_planes = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
	[s.size_x, s.size_y] = [s.windowWidth, s.windowHeight];
    [s.size_x, s.size_y] = [3840, 2160];
    [s.size_x, s.size_y] = [512, 512];

    var disturbance = 0.3;
	s.fps = 30;
	s.capture = true;
	s.video_format = "png";
	var loop = 3;
	var planes = [];
	const n_planes = 6;
	const plane_sz = 100;
	var fullscreen = false;

	s.drawBg = function() { s.background("#000"); }

	s.prepareNewSeeds = function () {
		planes = []
		for (let i = 0; i < n_planes; i++) {
			// planes.push(
			// 	new utils.LoopNoiseDynamics(new p5.Vector(utils.randomIn(0, s.width),
			// 		utils.randomIn(0, s.height)),
			// 		new p5.Vector(s.width, s.height).mult(2.),
			// 		0.01 * loop
			// 	)
			// )
			planes.push(
				new utils.LoopNoiseDynamics(new p5.Vector(s.width/2,
					s.height/2),
					new p5.Vector(s.width, s.height).mult(0.4),
					0.05 * loop
				)
			);
		}
	}

	s.stepDynamics = function(){
		let millis = s.millis();
		for (var p of Object.values(planes)) {
			p.step(millis);
		}
	}

	s.drawPlane = function(scale) {
		// https://svg2p5.com/ 
		s.push()
		// s.translate(-20, -87);
		s.scale(scale??1);
		s.translate(20, -87);
		s.rotate(s.PI/4)
		s.strokeCap(s.PROJECT);
		s.strokeJoin(s.MITER);
		s.beginShape();
		s.vertex(16.63,105.75);
		s.bezierVertex(16.64,101.72,18.93,97.78,22.66,93.37);
		s.vertex(1.09,79.73);
		s.bezierVertex(-0.27,79.14,-0.24,78.31,0.55,77.33);
		s.vertex(5.12,73.429);
		s.bezierVertex(5.95,72.919,6.83,72.69,7.78,72.96);
		s.vertex(34.4,77.46);
		s.vertex(56.58,53.44);
		s.vertex(4.8,18.41);
		s.bezierVertex(3.489,17.64,3.38,16.77,4.729,15.76);
		s.vertex(12.2,9.8);
		s.vertex(79.7,28.77);
		s.vertex(99.64,7.45);
		s.bezierVertex(106.33,1.66,112.83,-0.93,117.82,0.29);
		s.bezierVertex(120.57,0.979,121.539,1.79,122.389,4.38);
		s.bezierVertex(124.039,9.44,121.479,16.24,115.429,23.24);
		s.vertex(94.11,43.18);
		s.vertex(113.08,110.68);
		s.vertex(107.12,118.15);
		s.bezierVertex(106.11,119.49,105.24,119.38,104.47,118.08);
		s.vertex(69.43,66.31);
		s.vertex(45.41,88.48);
		s.vertex(49.91,115.1);
		s.bezierVertex(50.169,116.04,49.959,116.92,49.44,117.76);
		s.vertex(45.54,122.33);
		s.bezierVertex(44.57,123.12,43.73,123.15,43.14,121.79);
		s.vertex(29.5,100.22);
		s.bezierVertex(25.07,103.96,21.13,106.25,17.08,106.25);
		s.bezierVertex(16.71,106.24,16.63,106.11,16.63,105.75);
		s.vertex(16.63,105.75);
		s.endShape(s.CLOSE);
		s.pop()

	}

	s.drawOnce = function(){
		s.clear();
		// s.background("#000");
		const rad = 2.;
		const x_axis = new p5.Vector(1, 0, 0)
		s.rectMode(s.CENTER);
		s.noStroke();
		for (const i in Object.values(planes)) {
			let p = planes[i];
			let c = p.q;
			// c = new p5.Vector(100, 100);
			let n = p5.Vector.add(p.q, p.dq);
			s.push()
			s.translate(c.x, c.y);
			s.rotate(x_axis.angleBetween(p.dq))
			if (i % 3 == 0) {
				s.fill(s.color(217, 0, 18));
			} else if (i % 3 == 1) {
				s.fill(s.color(0, 51, 160));
			} else if (i % 3 == 2) {
				s.fill(s.color(242, 168, 0));
			}
			// s.fill("white");
			// s.stroke("red");
			s.drawPlane(0.7);
			// s.fill("black")
			// s.circle(0, 0, 2);
			// s.image(img, -plane_sz/2, -plane_sz/2, plane_sz, plane_sz);
			s.pop()
			// s.fill("red")
			// s.rect(c.x, c.y, 2 * rad, 2* rad)
			// s.fill("green")
			// s.rect(n.x, n.y, 2 * rad, 2* rad)
		}
	}

    s.setup = function() {
        s.createCanvas(s.size_x, s.size_y);
        s.drawBg();
        s.noStroke();
		s.frameRate(s.fps);
		s.createLoop(loop);
		s.prepareNewSeeds();
    }


	s.drawFrame = function() {
		s.stepDynamics();
		s.drawOnce();
	}

	utils.add_default_behaviors(this, s, "armenia_planes");

}