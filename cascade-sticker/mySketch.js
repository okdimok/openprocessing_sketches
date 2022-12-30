let cascade_sticker = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
	[s.size_x, s.size_y] = utils.getSizeFromHash()

    var disturbance = 0.3;
	s.fps = 30;
	s.capture = true;
	s.video_format = "png";
	s.loop = 3;

	class CascadeCircle {
		constructor() {
			this.n = 30;
			this.r = 220;
			this.phi = s.PI/this.n;
			this.alpha = 0; // the total angle of rotation
			this.light = s.color("#E1D3CA")
			this.dark = s.color("#BDAA9C")
			this.d = 0;
			this.int_gr = s.createGraphics(s.width, s.height);
			this.mask = s.createGraphics(s.width, s.height);
			this.prepare_gradient()
			this.tween = p5.tween.manager.addTween(this)
				.setSketch(s)
				.addMotionsSeconds([
					{ key: 'alpha', target: -0.1*s.TWO_PI },
				], s.loop*0.3, 'easeInOutQuad')
				.addLastMotions([
					{ key: 'alpha', target: 2*this.phi*5 },
				], 'easeInOutQuad')
				.startLoop();
		}

		draw_circle(a) {
			s.fill(this.light)
			s.stroke(this.dark)
			s.strokeWeight(1)
			s.circle(a.x, a.y, this.d)
			s.noStroke()
			s.fill(this.dark.copy().multiply(0.7))
			s.circle(a.x, a.y, this.d/2)
			s.fill(this.dark.copy().multiply(0.1))
			s.circle(a.x, a.y, this.d*0.2)
		}

		prepare_gradient(){
			this.int_gr.clear()
			this.int_gr.resetMatrix()
			this.int_gr.translate(this.int_gr.width/2, this.int_gr.height/2)
			this.int_gr.rotate(-this.phi)

			let n_lines = 40;
			for (let i = 0; i < n_lines; i++) {
				this.int_gr.stroke(s.lerpColor(this.dark, this.light, 1- i/n_lines))
				this.int_gr.strokeWeight(2)
				this.int_gr.line(0, 0, this.r, 0)
				this.int_gr.rotate(2*this.phi/n_lines)
			}

			this.mask.clear()
			this.mask.resetMatrix()
			this.mask.translate(this.mask.width/2, this.mask.height/2)
			let rr = this.r*0.9;
			let a = new p5.Vector(rr, 0);
			let b = a.copy().rotate(this.phi)
			let c = a.copy().rotate(-this.phi)
			let d = p5.Vector.sub(b, c).mag()
			this.mask.noStroke()
			this.mask.fill("white")
			this.mask.circle(a.x, a.y, d)
			let bb = b.copy().mult(3)
			let cc = c.copy().mult(3)
			this.mask.quad(b.x, b.y, bb.x, bb.y, cc.x, cc.y, c.x, c.y)

			this.int_img = this.int_gr.get()
			this.int_img.mask(this.mask.get())

		}

		draw_one () {
			s.push()
			let a = new p5.Vector(this.r, 0);
			let b = a.copy().rotate(this.phi)
			let c = a.copy().rotate(-this.phi)
			s.noStroke()
			s.fill(this.light)
			s.triangle(0, 0, a.x, a.y, b.x, b.y)
			s.fill(this.dark)
			s.triangle(0, 0, a.x, a.y, c.x, c.y)
			// s.image(this.mask, -this.mask.width/2, -this.mask.height/2)
			s.image(this.int_img, -this.mask.width/2, -this.mask.height/2)

			
			this.d = p5.Vector.sub(b, c).mag();
			this.draw_circle(a)
			s.pop()

		}

		draw() {
			s.push()
			s.rotate(this.alpha)
			for (let i = 0; i < this.n; i++) {
				this.draw_one()
				s.rotate(this.phi * 2)
			}
			s.pop()
			this.draw_circle(new p5.Vector(), )
		}
	}
	var cascade_circle;
	
	s.drawBg = function() { s.background("#000"); }

	s.prepareNewSeeds = function(){
		cascade_circle = new CascadeCircle();
		p5.tween.manager.restartAll();
	}

	s.stepDynamics = function(){
		p5.tween.manager.update(s.deltaTime);
		if (s.animLoop.elapsedFrames === 0) { p5.tween.manager.restartAll();}
	}

	s.drawOnce = function(){
		// s.background("#000");
		s.clear()
		s.resetMatrix()
		s.translate(s.width/2, s.height/2)
		cascade_circle.draw()

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