let grid_example = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
	[s.size_x, s.size_y] = utils.getSizeFromHash()

    var disturbance = 0.3;
	s.fps = 30;
	s.capture = true;
	s.video_format = "png";
	s.loop = 3;
	var shifts_grid;	

	s.drawBg = function() { s.background("#000"); }

	s.drawPatternOnce = function(){
		let t = shifts_grid.getTriangleVertices()
		shifts_grid.forEachTranslateRotate(function(p, ij) {
			let h = (s.noise(ij[0]*40, ij[1]*40) - 0.5 ) * 1.7 + 0.5
			s.fill(utils.newUnitColor(s.HSL, [h, 1., 0.5]))
			s.triangle(...t)
			s.fill("green")
			s.ellipse(0, 0, 3, 3)
		});
	}

	s.prepareNewSeeds = function(){
		s.noiseSeed(s.millis())
		shifts_grid = new utils.Grid([-10, 10], [-4, 4], [20, 20]).prepareForTriangles()
		p5.tween.manager.restartAll();
	}

	s.stepDynamics = function(){
		p5.tween.manager.update(s.deltaTime);
		if (s.animLoop.elapsedFrames === 0) { p5.tween.manager.restartAll();}
	}

	s.drawOnce = function(){
		s.clear();
		// s.background("#000");
		s.translate(s.width/2, s.height/2)
		s.drawPatternOnce()



	}

    s.setup = function() {
        s.createCanvas(s.size_x, s.size_y);
        // s.drawBg();
        s.noStroke();
		s.frameRate(s.fps);
		s.createLoop(s.loop);
		s.prepareNewSeeds();

    }

	s.drawFrame = function() {
		s.clear()
		s.stepDynamics();
		s.drawOnce();
	}

	utils.add_default_behaviors(this, s);




}