let tween_example = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
	[s.size_x, s.size_y] = utils.getSizeFromHash()


    var disturbance = 0.3;
	s.fps = 30;
	s.capture = true;
	s.video_format = "png";
	var loop = 3;
	var drawables = [];
	var fullscreen = false;

	class ColorSquare {
		constructor(x , y, r, g, b) {
			this.x = x;
			this.y = y;
			this.r = r;
			this.g = g;
			this.b = b;
			this.tween = p5.tween.manager.addTween(this)
				.addMotions([
					{ key: 'x', target: utils.randomIn(0, s.width) },
					{ key: 'y', target: utils.randomIn(0, s.height) },
					{ key: 'r', target: utils.randomIn(0, 255), },
					{ key: 'g', target: utils.randomIn(0, 255) },
					{ key: 'b', target: utils.randomIn(0, 255) },
					], loop*1000/4)
				.addMotions([
					{ key: 'x', target: 100 },
					{ key: 'y', target: 100	},
					], loop*1000/4)
				// Second motion: Change x and y to mouse position in 500ms at the same time
				.addMotions([
							{ key: 'x', target: s.mouseX },
							{ key: 'y', target: s.mouseY }
						], loop*1000/4, 'easeInOutQuint')
				.addMotions([
					{ key: 'x', target: this.x },
					{ key: 'y', target: this.y },
					{ key: 'r', target: this.r },
					{ key: 'g', target: this.g },
					{ key: 'b', target: this.b },
				], loop*1000/4, 'easeInOutQuint')
				// Start the tween
				.startLoop()
		}

		step() {
			this.tween.motions[2].actions[0].target = s.mouseX;
			this.tween.motions[2].actions[1].target = s.mouseY;
		}

		draw() {
			const rad = 16.;
			s.fill(s.color(this.r, this.g, this.b))
			s.rect(this.x, this.y, 2 * rad, 2* rad)
		}
	}

	s.drawBg = function() { s.background("#000"); }

	s.prepareNewSeeds = function(){
		drawables = []
		for (let i = 0; i < 50; i++) {
			drawables.push(
				new ColorSquare(
					utils.randomIn(0, s.width),
					utils.randomIn(0, s.height),
					utils.randomIn(0, 255),
					utils.randomIn(0, 255),
					utils.randomIn(0, 255)

				)
			)
		}
	}

	var prev_millis = s.millis();
	s.stepDynamics = function(){
		let millis = s.millis();
		for (var cp of Object.values(drawables)) {
			cp.step();
		}
		p5.tween.manager.update(millis - prev_millis);
		prev_millis = millis;
	}

	s.drawOnce = function(){
		s.background("#000");
		
		s.rectMode(s.CENTER)
		for (var cp of Object.values(drawables)) {
			cp.draw()			
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