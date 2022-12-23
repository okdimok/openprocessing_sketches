let cuboids_sticker = function ( sketch ) {
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
				], s.loop/5, 'easeInOutQuad')
				.addMotionsSeconds([
					{ key: 'r', target: 0 },
					{ key: 'g', target: 255 },
					{ key: 'b', target: 0 },
				], s.loop/5, 'easeInOutQuad')
				.addMotionsSeconds([
					{ key: 'r', target: 0 },
					{ key: 'g', target: 0 },
					{ key: 'b', target: 255 },
				], s.loop/5, 'easeInOutQuad')
				.addMotionsSeconds([
					{ key: 'r', target: 255 },
					{ key: 'g', target: 0 },
					{ key: 'b', target: 0 },
				], s.loop/5, 'easeInOutQuad')
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

	class IsoCubesPattern {
		constructor(graphics) {
			this.graphics = graphics
			this.a = 64;
			this.r = 2 * this.a / s.sqrt(3);
			this.grid = new utils.Grid([-10, 10], [-4, 4], [2*this.a, 1.5*this.r], [this.a,0]);
		}

		draw(s) {
			this.draw_cuboids()
			// this.grid.forEachTranslate((p, ij) => {
			// 	this.graphics.fill("red")
			// 	this.graphics.ellipse(0, 0, 3, 3)
			// }, this.graphics);
		}

		draw_one_cuboid(sz, colors) {
			// sz *= 1.01
			let up = new p5.Vector(0, -sz)
			let right = up.copy().rotate(s.PI/3)
			let bottom = up.copy().rotate(s.TWO_PI/3)
			for (let i = 0; i < 3; i++){
				this.graphics.fill(colors[i]);
				this.graphics.quad(0, 0, up.x, up.y, right.x, right.y, bottom.x, bottom.y);
				this.graphics.rotate(s.TWO_PI/3);
			}
		}

		draw_cuboids() {
			this.graphics.noStroke();
			// outer_right, outer_floor, outer_left
			let colors = ["#0000F0", "#FF0000", "#00DD00"];
			// inner_top, inner_left, inner_right
			let colors_small = ["#33AA00", "#0000E0", "#FF2200"];
			// int [] colors_small = {0xFF33AA00, 0xFF0000F0, 0xFFFF2200};

			this.grid.forEachTranslate(() => {
				this.draw_one_cuboid(this.r, colors)
				this.graphics.rotate(s.PI/3)
				this.draw_one_cuboid(this.r/2, colors_small)

			}, this.graphics)
		}

	}
	var iso_cubes_pattern; // = new IsoCubesPattern();

	s.drawBg = function() { s.background("#000"); }

	s.prepareNewSeeds = function(){
		svetlitsatint = new SvetlitsaTint()
		iso_cubes_pattern = new IsoCubesPattern(svetlitsatint.canvas);
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
		iso_cubes_pattern.draw()
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