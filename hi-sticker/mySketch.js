let hi_sticker = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
	[s.size_x, s.size_y] = utils.getSizeFromHash()

    var disturbance = 0.3;
	s.fps = 30;
	s.capture = true;
	s.video_format = "png";
	s.loop = 3;
	var colorPoints = [];
	var fullscreen = false;
	var spatialGradient;
	var gridSize = 30;
	var drawables = [];
	
	class HPath {
		constructor() {
			this.path = new utils.Path()
				.addPoint(new p5.Vector(200, 200))
				.addPoint(new p5.Vector(200, 400))
				.addPoint(new p5.Vector(100, 400))
				.close()
		}

		draw () {
			s.noFill();
			this.path.display()
			for (var i = 0.1; i < 1; i+=0.1) {
				let p = this.path.getPosAtT(i);
				s.fill("green")
				s.circle(p.x, p.y, 10);
			}
		}

	}


	s.drawBg = function() { s.background("#000"); }

	s.prepareNewSpatialGradient = function(){
	}

	s.stepGradient = function(){

	}

	s.drawGradientOnce = function(s){

	}

	s.prepareNewSeeds = function(){
		s.prepareNewSpatialGradient();
		drawables = [new HPath()]
		p5.tween.manager.restartAll();
	}

	s.stepDynamics = function(){
		s.stepGradient();
		p5.tween.manager.update(s.deltaTime);
		if (s.animLoop.elapsedFrames === 0) { p5.tween.manager.restartAll();}

	}

	s.drawOnce = function(){
		s.clear();
		// s.background("#000");
		for (var d of Object.values(drawables)) {
			d.draw()			
		}

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