let climbing_sticker = function ( sketch ) {
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

	class ImageRoling {
		constructor(img) {
			this.y = 0;
			this.img = s.loadImage(img, () => {
				this.tween = p5.tween.manager.addTween(this)
				.setSketch(s)
				.addLastMotion('y', this.img.height)
				.startLoop();
			});
		}

		draw() {
			s.image(this.img, 0, this.y);
			s.image(this.img, 0, this.y-this.img.height);
		}
	}



	s.drawBg = function() { s.background("#000"); }

	s.prepareNewSeeds = function(){
		drawables = [new ImageRoling(utils.parsedHash.get("img") ?? "wall.jpg")]
		p5.tween.manager.restartAll();
	}

	s.stepDynamics = function(){
		p5.tween.manager.update(s.deltaTime);
		if (s.animLoop.elapsedFrames === 0) { p5.tween.manager.restartAll(); }
	}

	s.drawOnce = function(){
		s.clear();
		// s.background("#0f0");
		// s.text(s.millis(), 0, 0)
		// s.text(s.deltaTime, 0, 30)
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