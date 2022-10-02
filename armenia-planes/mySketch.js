let armenia_planes = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
	[s.size_x, s.size_y] = [s.windowWidth, s.windowHeight];
    // [s.size_x, s.size_y] = [3840, 2160];
    // [s.size_x, s.size_y] = [512, 512];

    var disturbance = 0.3;
	s.fps = 30;
	s.capture = true;
	var loop = 10;
	var planes = [];
	const n_planes = 50;
	const plane_sz = 100;
	var fullscreen = false;
	var planeSVG;

	s.drawBg = function() { s.background("#000"); }

	s.prepareNewSeeds = function () {
		planes = []
		for (let i = 0; i < n_planes; i++) {
			planes.push(
				new utils.LoopNoiseDynamics(new p5.Vector(utils.randomIn(0, s.width),
					utils.randomIn(0, s.height)),
					new p5.Vector(s.width, s.height).mult(2.),
					0.01 * loop
				)
			)
		}
	}

	s.stepDynamics = function(){
		let millis = s.millis();
		for (var p of Object.values(planes)) {
			p.step(millis);
		}
	}

	s.drawOnce = function(){
		s.clear();
		s.background("#000");
		const rad = 2.;
		const x_axis = new p5.Vector(1, 0, 0)
		s.rectMode(s.CENTER)
		for (const i in Object.values(planes)) {
			let p = planes[i];
			let c = p.q;
			let n = p5.Vector.add(p.q, p.dq);
			s.push()
			s.translate(c.x, c.y);
			s.rotate(x_axis.angleBetween(p.dq)+s.PI/4)
			if (i % 3 == 0) {
				s.tint(217, 0, 18);
			} else if (i % 3 == 1) {
				s.tint(0, 51, 160);
			} else if (i % 3 == 2) {
				s.tint(242, 168, 0);
			}
			s.image(planeSVG, -plane_sz/2, -plane_sz/2, plane_sz, plane_sz);
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
		planeSVG = s.loadImage('./plane-icon.svg')
    }


	s.drawFrame = function() {
		s.stepDynamics();
		s.drawOnce();
	}

	utils.add_default_behaviors(this, s, "armenia_planes");

}