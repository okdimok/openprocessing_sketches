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
		shifts_grid.forEach(function(p, ij) {
			s.push()
			s.translate(p.x, p.y);
			s.fill("red")
			s.ellipse(0, 0, 3, 3)
			s.pop()

		});
	}

	s.prepareNewSeeds = function(){
		shifts_grid = new utils.Grid([-10, 10], [-4, 4], [10, 10], [1, 1])
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