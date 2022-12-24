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
		}

		draw () {
			s.tint(this.r, this.g, this.b);
			s.image(this.canvas, -s.width/2, -s.height/2);
			s.tint(255, 255, 255)
		}

	}
	var svetlitsatint; // = new SvetlitsaTint();
	class BackgroundSpot {
		constructor(graphics, tinter) {
			this.gr = graphics
			this.tinter = tinter
			this.w = 450
			this.h = 300
			this.int_gr = s.createGraphics(s.width, s.height);
			this.base = 1.;
			this.opacity = 0.1*255;
		}

		draw_one_spot() {
			this.int_gr.noStroke()
			let n_concentric = 100;
			let w = 450, h = 300;
			for (let i = 1; i <= n_concentric; i++) {
				this.int_gr.ellipse(0, 0, w*i/n_concentric, h*i/n_concentric,)
			}
		}

		draw_red_spot() {
			this.int_gr.push()
			this.int_gr.fill(s.color(
				this.base * this.tinter.r,
				0,
				0,
				this.opacity
			));
			this.int_gr.translate(0, -50);
			this.draw_one_spot()
			this.int_gr.pop()
		}

		draw_green_spot() {
			this.int_gr.push()
			this.int_gr.fill(s.color(
				0,
				this.base * this.tinter.g,
				0,
				this.opacity
			));
			this.int_gr.translate(30, 30);
			this.draw_one_spot()
			this.int_gr.pop()
		}

		draw_blue_spot() {
			this.int_gr.push()
			this.int_gr.fill(s.color(
				0,
				0,
				this.base * this.tinter.b,
				this.opacity
			));
			this.int_gr.translate(-30, 30);
			this.draw_one_spot()
			this.int_gr.pop()
		}

		draw() {
			this.int_gr.clear()
			this.int_gr.resetMatrix()
			this.int_gr.translate(s.width/2, s.height/2)
			this.int_gr.blendMode(s.ADD)

			this.draw_red_spot()
			this.draw_green_spot()
			this.draw_blue_spot()
			
			this.gr.blendMode(s.ADD)
			this.gr.image(this.int_gr, -s.width/2, -s.height/2)
			this.gr.blendMode(s.BLEND)
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
			this.text = "Svetlitsa"
			this.ws = [55, 54, 45, 30,
				28, 25, 28, 39,
				 45]
		    this.colors = new Array(this.ws.length).fill(0).map(() => 
			utils.newUnitColor(s.HSL,
			[
			   utils.randomIn(0., 1.),
			   utils.randomIn(0.8, 1.),
			   utils.randomIn(0.5, 0.6),
			   1.
		   ]))
		   this.colors = ["#0FF", "#0FF", "#0FF", "#0F0",
		   	 	"#F0F", "#F00", "#F00", "#DD0",
				"#F0F"
		   ]
		}

		draw() {
			this.int_gr.clear()
			this.int_gr.resetMatrix()
			this.mask.clear()
			this.mask.resetMatrix()
			this.mask.translate(this.w/2, this.h/2)
			this.draw_text_overlay()
			// this.draw_line("Svetlitsa")
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
			this.int_gr.rectMode(s.CORNER)
			
			let x = 0;
			this.ws.map((w, i) => {
				this.int_gr.fill(this.colors[i])
				this.int_gr.rect(x, 0, w, this.h)
				x += w
			})
			

			this.mask.fill("white")
			this.mask.rectMode(s.CENTER)
			this.mask.textAlign(s.CENTER, s.CENTER)
			this.mask.textSize(100)
			this.mask.textFont("serif")
			this.mask.text("Svetlitsa", 0, 0, this.w, this.h)
			
			
			let int_gr_img = this.int_gr.get()
			int_gr_img.mask( this.mask.get() )

			// this.gr.rectMode(s.CENTER)
			// this.gr.fill("red")
			// this.gr.rect(0, 0, 30, 30)

			// this.gr.image(int_gr_img, -this.w/2, -this.h/2)
			let scale = 0.8
			this.gr.image(int_gr_img, -this.w/2*scale, -this.h/2*scale, this.w*scale, this.h*scale)
			// this.gr.image(int_gr_img, 0, 0)

		}

		draw_line(line, colors){
			this.gr.textAlign(s.LEFT, s.CENTER)
			this.gr.textSize(100)
			this.gr.textFont("serif")
			this.gr.fill("white")
			this.gr.rectMode(s.CENTER)
			let total_w = this.gr.textWidth(line)
			let x = -total_w/2;
			let ws =[];
			for (let c of line) {
				let w = this.gr.textWidth(c);
				this.gr.text(c, x, 0, w, 200)
				x += w;
				ws.push(w)
			}
			// console.log(ws)
			
		}
	}
	var svetlitsa_text;

	s.drawBg = function() { s.background("#000"); }

	s.prepareNewSeeds = function(){
		svetlitsatint = new SvetlitsaTint()
		background_spot = new BackgroundSpot(s, svetlitsatint);
		svetlitsa_text = new SvetlitsaText(svetlitsatint.canvas);
		// iso_cubes_pattern = new IsoCubesPattern(s);
		p5.tween.manager.restartAll();
	}

	s.stepDynamics = function(){
		p5.tween.manager.update(s.deltaTime);
		if (s.animLoop.elapsedFrames === 0) { p5.tween.manager.restartAll();}
	}

	s.drawOnce = function(){
		// s.background("#000");
		// iso_cubes_pattern.draw()
		svetlitsatint.canvas.clear()
		svetlitsatint.canvas.resetMatrix()
		svetlitsatint.canvas.translate(s.width/2, s.height/2)
		s.clear()
		s.resetMatrix()
		s.translate(s.width/2, s.height/2)
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