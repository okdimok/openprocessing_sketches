let circles_overlapping = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
	[s.size_x, s.size_y] = [s.windowWidth, s.windowHeight];
    [s.size_x, s.size_y] = [3840, 2160];
    [s.size_x, s.size_y] = [512, 512];
	[s.size_x, s.size_y] = utils.getScreenSize();

    var disturbance = 0.3;
	s.fps = 30;
	s.capture = true;
	var loop = 3;
	var colorPoints = [];
	var fullscreen = false;
	const n_concentric = 20;
	const alpha = 20;


	s.drawBg = function() { s.background("#000"); }

	s.prepareNewSeeds = function(){
		colorPoints = []
		for (let i = 0; i < 3; i++) {
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
						0.03*loop,
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
		s.drawBg();
		// s.background(0, 0, 0, 30)
		const rad = s.width/n_concentric/2*2;
		s.rectMode(s.CENTER)
		for (var cp of Object.values(colorPoints)) {
			let p = cp.get_point();
			let c = cp.get_color();
			c.setAlpha(alpha);
			s.fill(c);
			for (let i = 1; i <= n_concentric; i++) {
				s.circle(p.x, p.y, 2 * rad*i)
			}
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

	utils.add_default_behaviors(this, s);




}