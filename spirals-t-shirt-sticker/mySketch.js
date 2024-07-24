let spirals_t_shirt = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
	// In this sketch we predict size from spirals
	[s.size_x, s.size_y] = utils.getSizeFromHash()

	s.fps = 30;
	s.capture = true;
	s.video_format = "png";
	s.loop = 3;

	class Spirals {
		constructor(){
			this.c = "#ff9900" // orange from fluor t-shirt
			this.c_inverted = "#06f"
			// this.c = "#ff00aa"
			// this.c_inverted = "#0f5"
			// this.c = "#ff6a00" // orange from fluor
			// this.c_inverted = "#0095ff"
			this.c = "#b0ea00" // green from fluor
			this.c_inverted = "#E1341E"
			this.fg = "#fff"
			this.bg = "#000"
			// this.fg = "#00da00"
			this.c1 = "#00da00"
			this.c3 = "#ffec00"
			this.petals_per_circle = 6*4
			this.default_canvas = 512

			this.angle = 0;
			this.tween = p5.tween.manager.addTween(this)
				.setSketch(s)
				.addMotionsSeconds([
					{ key: 'angle', target: 0 },
				], s.loop*0.7, 'easeInOutQuad')
				.addLastMotions([
					{ key: 'angle', target: -Math.PI/24*2 },
					], 'easeInOutQuad')
				.startLoop();
		}

		draw_one_layer(rmin) {
			let xd = rmin*0.1;
			// let xd = rmin*s.TWO_PI/this.petals_per_circle
			let yd = xd * 2;
			// let rect_w = 1.6*xd;
			let rect_w = rmin*s.TWO_PI/this.petals_per_circle/2;
			let r = rmin + yd/2;
			let rmax = r + yd/2;
			s.push()
			for (var i = 0; i < this.petals_per_circle; i++) {
				s.rectMode(s.CORNER)
				s.fill(this.fg)
				s.push()
				s.translate(-rect_w/2, 0)
				s.rect(0, -r-yd/2, rect_w, yd)
				s.fill(this.c_inverted)
				s.ellipse(0, -r, xd, yd)
				s.fill(this.c)
				s.ellipse(rect_w, -r, xd, yd)
				s.pop()
				s.rotate(s.TWO_PI/this.petals_per_circle)
			}
			s.pop()
			return [r, rmax]
		}

		draw_one_spiral(rmax) {
			s.push()
			let r = 1.
			let r_distance = 1.
			let draw_and_rotate = () => {
				[r_distance, r] = this.draw_one_layer(r)
				s.rotate(s.TWO_PI/this.petals_per_circle/2)
			}
			draw_and_rotate()
			while (r < rmax) {
				draw_and_rotate()
				// draw_and_rotate()
			}
			s.pop()
			return [r_distance, r]
		}

		draw_two_spirals(rmax) {
			let [r_distance, r] = this.draw_one_spiral(rmax)
			s.translate(0, 2*r_distance)
			s.scale(-1, 1)
			this.draw_one_spiral(rmax)

		}

		draw_7_spirals(rmax) {
			let [r_distance, r] = this.draw_one_spiral(rmax)
			for (var i = 0; i < 6; i++) {
				s.push()
				s.rotate(i*s.TWO_PI/6)
				s.translate(0, 2*r_distance)
				s.scale(-1, 1)
				this.draw_one_spiral(rmax)
				s.pop()
			}
			let target_scale = 1 / (4 * r_distance + 0 * r) * this.default_canvas;
			return target_scale;

		}

		draw () {
			s.push()
			s.clear()
			s.fill(this.bg);
			s.rotate(this.angle);
			let d = 2*255;
			s.ellipse(0, 0, d, d);
			// s.background(this.bg);
			this.draw_one_spiral(200)
			// s.fill()
			s.pop()
		}

		getPreferredCanvasSize() {
			return [this.default_canvas*(s.sqrt(3)/2), this.default_canvas]
		}
	}
	var spirals = new Spirals();
	// [s.size_x, s.size_y] = spirals.getPreferredCanvasSize()

	s.drawBg = function() { s.background("#000"); }

	s.prepareNewSeeds = function(){
		spirals = new Spirals();
	}

	s.stepDynamics = function(){
		p5.tween.manager.update(s.deltaTime);
		if (s.animLoop.elapsedFrames === 0) { p5.tween.manager.restartAll();}
	}

	s.drawOnce = function(){
		s.drawBg()
		s.resetMatrix()
		s.translate(s.width/2, s.height/2)
		spirals.draw();
	}

    s.setup = function() {
        s.createCanvas(s.size_x, s.size_y);
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