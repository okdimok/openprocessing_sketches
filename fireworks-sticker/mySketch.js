let fireworks_sticker = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
	[s.size_x, s.size_y] = utils.getSizeFromHash()


    var disturbance = 0.3;
	s.fps = 30;
	s.capture = true;
	s.video_format = "png";
	s.loop = 3;
	var drawables = [];
	var fullscreen = false;

	s.drawConcetric = function(x, y, rref, cref) {
		let c = cref.copy();
		let dr = 1, maxr = 1.5*rref, minr = 2 ;
		let n = s.floor((maxr-minr)/dr);
		c.setAlpha(cref._array[3]/n*2);
		for (let i = minr; i < maxr; i+=dr) {
			s.fill(c)
			s.circle(x, y, 2*i);
		}
		c.setAlpha(cref._array[3]/255);
		s.fill(c)
		s.circle(x, y, 0.99*rref);
	}

	class ColorSphere {
		constructor() {
			this.rad = 16;
			this.x = s.width/2;
			this.y = s.height + 3*this.rad;
			this.alpha = 1.
			this.color = utils.newUnitColor(s.HSL, [
				utils.randomIn(0., 1.),
				utils.randomIn(0.8, 1.),
				utils.randomIn(0.5, 0.6),
				1.
			])
			this.target = new p5.Vector(s.width)
				.rotate(s.random(0, s.TWO_PI))
				.mult(s.random(0.3, 2.))
				.add(new p5.Vector(s.width/2, s.height/2))
			// see also yesno_sticker for TweenDynamics and bare pause
			this.tween = p5.tween.manager.addTween(this)
				.setSketch(s)
				.addMotionsSeconds([
					{ key: 'x', target: s.height/2 },
					{ key: 'y', target: s.width/2 }
				], s.loop/4)
				.addLastMotions([
					{ key: 'x', target: this.target.x },
					{ key: 'y', target: this.target.y },
					])
				// Start the tween
				.startLoop()
			this.tween_alpha = p5.tween.manager.addTween(this)
				.setSketch(s)
				.addMotionsSeconds([
					{ key: 'alpha', target: 1 },
				], 0 )
				.addMotionsSeconds([
					], s.loop/2)
				.addLastMotions([
					{ key: 'alpha', target: 0 },
				])
				// Start the tween
				.startLoop()
		}

		step() {

		}

		draw() {
			this.color.setAlpha(this.alpha)
			s.fill(this.color)
			// s.rect(this.x, this.y, 2 * rad, 2* rad)
			let p = new p5.Vector(this.x, this.y)
			let c = new p5.Vector(s.width/2, s.height/2)
			if (p.sub(c).mag() < 1.5* s.rref) {
				s.drawConcetric(this.x, this.y, this.rad, this.color)
			}
		}
	}

	s.drawBg = function() { s.background("#000"); }

	s.prepareNewSeeds = function(){
		drawables = []
		for (let i = 0; i < 100; i++) {
			drawables.push(
				new ColorSphere(
				)
			)
		}
		p5.tween.manager.restartAll();
	}

	s.stepDynamics = function(){
		for (var cp of Object.values(drawables)) {
			cp.step();
		}
		p5.tween.manager.update(s.deltaTime);
		if (s.animLoop.elapsedFrames === 0) { p5.tween.manager.restartAll();}
	}

	s.drawOnce = function(){
		s.clear();
		s.rectMode(s.CENTER)
		let gray = utils.newUnitColor(s.HSL, [0.5, 0., 0.1, 0.5])
		s.rref = s.width/3*0.9
		s.drawConcetric(s.width/2, s.height/2, s.rref , gray)
		for (var cp of Object.values(drawables)) {
			cp.draw()			
		}
	}

    s.setup = function() {
        s.createCanvas(s.size_x, s.size_y);
        s.drawBg();
        s.noStroke();
		s.frameRate(s.fps);
		s.createLoop(s.loop);
		s.prepareNewSeeds();
    }


	s.drawFrame = function() {
		s.stepDynamics();
		s.drawOnce();
	}

	utils.add_default_behaviors(this, s);




}