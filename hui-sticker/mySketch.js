let hui_sticker = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
	[s.size_x, s.size_y] = utils.getSizeFromHash()

    var disturbance = 0.3;
	s.fps = 30;
	s.capture = true;
	s.video_format = "png";
	s.loop = 3;

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

	class ColorLoop {
		constructor() {
			this.r = 0;
			this.g = 255;
			this.b = 0;
			this.n = 4; // how many times per period?
			this.tween = p5.tween.manager.addTween(this)
				.setSketch(s)
				.addMotionsSeconds([
					{ key: 'r', target: 255 },
					{ key: 'g', target: 0 },
					{ key: 'b', target: 0 },
				], s.loop/3/this.n, 'linear')
				.addMotionsSeconds([
					{ key: 'r', target: 0 },
					{ key: 'g', target: 0 },
					{ key: 'b', target: 255 },
				], s.loop/3/this.n, 'linear')
				.addMotionsSeconds([
					{ key: 'r', target: this.r },
					{ key: 'g', target: this.g },
					{ key: 'b', target: this.b },
				], s.loop/3/this.n, 'linear')
				.startLoop()
			// this.canvas = s.createGraphics(s.width, s.height);
		}

		get_color() {
			return s.color(this.r, this.g, this.b)
		}
	}
	var cl_past, cl_present, cl_future;
	var n_frames = 5; // the time difference in frames

	class SinColorLoop extends ColorLoop{
		constructor() {
			super()
			this.t = 0;
			this.tween = p5.tween.manager.addTween(this)
				.setSketch(s)
				.addMotionsSeconds([
					{ key: 't', target: s.TWO_PI },
				], s.loop/this.n, 'linear')
				.startLoop()
			// this.canvas = s.createGraphics(s.width, s.height);
		}

		c_from_ph(ph) {
			return s.map(s.cos(this.t + ph), -1, 1, 0, 255)
		}

		get_color() {
			let ph = s.TWO_PI/3
			return s.color(this.c_from_ph(0),
				this.c_from_ph(ph),
				this.c_from_ph(2*ph),
			)
		}

	}

	s.getSinColorLoopColorAtT = function (t) {
		 let c_from_ph = function (ph) {
			return s.map(s.cos(t + ph), -1, 1, 0, 255)
		}
		let ph = s.TWO_PI/3
		return s.color(c_from_ph(1.5*s.PI),
			c_from_ph(0),
			c_from_ph(s.PI),
		)
	}

	
	
	class Hui {
		constructor(){
			this.n_pixels = 5;
			this.total_phase_shift = s.PI/3;
			this.t = 0;
			this.n_per_period = 4;
			this.tween = p5.tween.manager.addTween(this)
				.setSketch(s)
				.addMotionsSeconds([
					{ key: 't', target: s.TWO_PI },
				], s.loop/this.n_per_period, 'linear')
				.startLoop()
			
		}

		draw_past() {
			s.push()
			s.translate(this.n_pixels, 0)
			for (let i = this.n_pixels; i >= 1; i--) {
				s.translate(-1, 0)
				s.fill(s.getSinColorLoopColorAtT(this.t - i*this.total_phase_shift/this.n_pixels))
				s.drawPlane()
			}
			s.pop()
		}

		draw_future() {
			s.push()
			s.translate(-this.n_pixels, 0)
			for (let i = this.n_pixels; i >= 1; i--) {
				s.translate(1, 0)
				s.fill(s.getSinColorLoopColorAtT(this.t + i*this.total_phase_shift/this.n_pixels))
				s.drawPlane()
			}
			s.pop()
		}
		draw () {
			this.draw_past();
			this.draw_future();
			s.fill(s.getSinColorLoopColorAtT(this.t))
			s.drawPlane()
		}
	}
	var hui;

	s.drawBg = function() { s.background("#000"); }

	s.prepareNewSeeds = function(){
		let cls = SinColorLoop;
		cl_past = new cls()
		cl_present = new cls()
		cl_future = new cls()
		hui = new Hui();
	}

	s.stepDynamics = function(){
		p5.tween.manager.update(s.deltaTime);
		// if (s.animLoop.elapsedFrames === 0) { cl_past.tween.restart()}
		// if (s.animLoop.elapsedFrames === n_frames) { cl_present.tween.restart()}
		// if (s.animLoop.elapsedFrames === 2*n_frames) { cl_future.tween.restart()}
		if (s.animLoop.elapsedFrames === 0) { p5.tween.manager.restartAll();}
	}

	s.drawOnce = function(){
		s.background("#888");
		s.resetMatrix()
		s.translate(s.width/2, s.height/2)
		hui.draw();


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