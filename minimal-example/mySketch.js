let minimal_example = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
	[s.size_x, s.size_y] = [s.windowWidth, s.windowHeight];
    [s.size_x, s.size_y] = [3840, 2160];
    [s.size_x, s.size_y] = [512, 512];

    var disturbance = 0.3;
	var fps = 30;
	var capture = true;
	var loop = 180;
	var colorPoints = [];
	var fullscreen = false;

	s.drawBg = function() { s.background("#000"); }

	s.prepareNewSeeds = function(){
		colorPoints = []
		for (let i = 0; i < 5; i++) {
			colorPoints.push(
				new utils.ColorPoint(
					new utils.LoopNoiseDynamics( new p5.Vector(utils.randomIn(0, s.width),
						utils.randomIn(0, s.height)),
						new p5.Vector(s.width, s.height),
						0.01*loop
					),
					new utils.LoopNoiseDynamics(
						new p5.Vector (
							utils.randomIn(100, 255),
							utils.randomIn(100, 255),
							utils.randomIn(100, 255)
						),
						new p5.Vector(100, 100, 100),
						0.1*loop,
						true
					)
				)
			)
		}
	}

	s.stepDynamics = function(){
		let millis = s.millis();
		for (var cp of Object.values(colorPoints)) {
			cp.p.step(millis);
			cp.c.step(millis);
		}
	}

	s.drawOnce = function(){
		// s.background("#000");
		const rad = 16.;
		s.rectMode(s.CENTER)
		for (var cp of Object.values(colorPoints)) {
			let p = cp.get_point();
			s.fill(cp.get_color())
			s.rect(p.x, p.y, 2 * rad, 2* rad)
		}
	}

    s.setup = function() {
        s.createCanvas(s.size_x, s.size_y);
        s.drawBg();
        s.noStroke();
		s.frameRate(fps);
		s.createLoop(loop);
		s.prepareNewSeeds();
    }


	s.drawFrame = function() {
		s.stepDynamics();
		s.drawOnce();
	}

	utils.add_default_behaviors(this, s);




}