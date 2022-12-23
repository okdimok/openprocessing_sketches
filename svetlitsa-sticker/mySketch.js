let svetlitsa_sticker = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
	[s.size_x, s.size_y] = utils.getSizeFromHash()

    var disturbance = 0.3;
	s.fps = 30;
	s.capture = true;
	s.video_format = "png";
	s.loop = 3;
	
	class SvetlitsaTint {
		constructor() {
			this.r = 255;
			this.g = 255;
			this.b = 255;
			this.tween = p5.tween.manager.addTween(this)
				.setSketch(s)
				.addMotionsSeconds([
					{ key: 'r', target: 255 },
					{ key: 'g', target: 0 },
					{ key: 'b', target: 0 },
				], s.loop*0.3, 'easeInOutQuad')
				.addMotionsSeconds([
					{ key: 'r', target: 0 },
					{ key: 'g', target: 255 },
					{ key: 'b', target: 0 },
				], s.loop*0.2, 'easeInOutQuad')
				.addMotionsSeconds([
					{ key: 'r', target: 0 },
					{ key: 'g', target: 0 },
					{ key: 'b', target: 255 },
				], s.loop*0.2, 'easeInOutQuad')
				.addLastMotions([
					{ key: 'r', target: this.r },
					{ key: 'g', target: this.g },
					{ key: 'b', target: this.b },
				], 'easeInOutQuad')
				.startLoop();
			this.canvas = s.createGraphics(s.width, s.height);
			this.canvas.translate(s.width/2, s.height/2)
		}

		draw () {
			s.tint(this.r, this.g, this.b);
			s.image(this.canvas, 0, 0);
		}

	}

	var svetlitsatint; // = new SvetlitsaTint();
	class BackgroundSpot {
		constructor(graphics) {
			this.gr = graphics
		}

		draw() {
			this.gr.noStroke()
			let base = 1., opacity = 0.1;
			this.gr.fill(utils.newUnitColor(s.RGB, [base, base, base, opacity]));
			let n_concentric = 100;
			let w = 400, h = 300;
			for (let i = 1; i <= n_concentric; i++) {
				this.gr.ellipse(0, 0, w*i/n_concentric, h*i/n_concentric,)
			}
		}
	}
	var background_spot;

	class SvetlitsaText {
		constructor(graphics) {
			this.gr = graphics
			this.w = 350
			this.h = 200
			this.int_gr = s.createGraphics(this.w, this.h);
			this.mask = s.createGraphics(this.w, this.h);
		}

		draw() {
			this.int_gr.clear()
			this.int_gr.resetMatrix()
			this.int_gr.translate(this.w/2, this.h/2)
			this.mask.clear()
			this.mask.resetMatrix()
			this.mask.translate(this.w/2, this.h/2)
			this.draw_text_overlay()
		}

		draw_text_simple(){
			this.gr.noStroke()
			this.gr.fill("white")
			this.gr.textAlign(s.CENTER, s.CENTER)
			this.gr.textSize(100)
			this.gr.textFont("serif")
			this.gr.rectMode(s.CENTER)
			this.gr.text("Svetlitsa", 0, 0, 300, 200)
		}

		draw_text_overlay(){
			this.int_gr.noStroke()
			this.int_gr.rectMode(s.CENTER)
			this.int_gr.fill("red")
			this.int_gr.rect(0, 0, 100, 100)

			this.mask.fill("white")
			this.mask.rectMode(s.CENTER)
			this.mask.textAlign(s.CENTER, s.CENTER)
			this.mask.textSize(100)
			this.mask.textFont("serif")
			this.mask.text("Svetlitsa", 0, 0, this.w, this.h)

			let int_gr_img = this.int_gr.get()
			int_gr_img.mask( this.mask.get() )

			this.gr.image(int_gr_img, -this.w/2, -this.h/2)

		}

		draw_line(line, colors){
			this.gr.textAlign(s.LEFT, s.CENTER)
			this.gr.textSize(100)
			this.gr.textFont("serif")
			this.gr.fill("white")
			this.gr.rectMode(s.CENTER)
			let total_w = this.gr.textWidth(line)
			let x = -total_w/2;
			for (let c of line) {
				let w = this.gr.textWidth(c);
				this.gr.text(c, x, 0, w, 200)
				x += w;
			}
			
		}
	}
	var svetlitsa_text;

	s.drawBg = function() { s.background("#000"); }

	s.prepareNewSeeds = function(){
		svetlitsatint = new SvetlitsaTint()
		svetlitsa_text = new SvetlitsaText(svetlitsatint.canvas);
		background_spot = new BackgroundSpot(svetlitsatint.canvas);
		// iso_cubes_pattern = new IsoCubesPattern(s);
		p5.tween.manager.restartAll();
	}

	s.stepDynamics = function(){
		p5.tween.manager.update(s.deltaTime);
		if (s.animLoop.elapsedFrames === 0) { p5.tween.manager.restartAll();}
	}

	s.drawOnce = function(){
		s.clear();
		// s.background("#000");
		// iso_cubes_pattern.draw()
		svetlitsatint.canvas.clear()
		background_spot.draw()
		svetlitsa_text.draw()
		svetlitsatint.draw();

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