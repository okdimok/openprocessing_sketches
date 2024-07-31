let object_background_t_shirt = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
	// In this sketch we predict size from triangles
	[s.size_x, s.size_y] = utils.getSizeFromHash()

	s.fps = 30;
	s.capture = true;
	s.video_format = "png";
	s.loop = 3;

	class Triangles {
		constructor(){
			this.enabled_grid_id = 0
			this.base_alpha = 0
			this.ymax = 10
			this.d = 60
			this.a = this.d * 2
			this.h = this.a * s.sqrt(3) /2
			this.shifts_grid = new utils.Grid([-10, 10], [-this.ymax, this.ymax], [this.d, this.d]).prepareForTriangles()
			this.shifts_grid_red = new utils.Grid([-10, 10], [-this.ymax, this.ymax], [this.d, this.d]).prepareForTriangles()
			this.tween = p5.tween.manager.addTween(this)
				.setSketch(s)
				.addMotionsSeconds([
					{ key: 'base_alpha', target: 0 },
					{ key: 'enabled_grid_id', target: 0 },
					], s.loop*0.3, 'easeInOutQuad')
				.addMotionsSeconds([
					{ key: 'base_alpha', target: 4 },
					{ key: 'enabled_grid_id', target: 0 },
					], s.loop*0.15, 'easeInOutQuad')
				.addMotionsSeconds([
					{ key: 'base_alpha', target: 0 },
					{ key: 'enabled_grid_id', target: 0 },
					], s.loop*0.15, 'easeInQuad')
				.addMotionsSeconds([
					{ key: 'base_alpha', target: 0 },
					{ key: 'enabled_grid_id', target: 1 },
					], s.loop*0.0, 'linear')
				.addMotionsSeconds([
					{ key: 'base_alpha', target: -4 },
					{ key: 'enabled_grid_id', target: 1 },
				], s.loop*0.15, 'easeOutQuad')
				.addLastMotions([
					{ key: 'base_alpha', target: 0 },
					{ key: 'enabled_grid_id', target: 1 },
					], 'easeInOutQuad')
				.startLoop();
		}

		draw_one_set(shifts_grid, mod_2, inner_fill, stroke) {
			let t = shifts_grid.getCenteredTriangleVertices()
			let base_alpha = this.base_alpha
			shifts_grid.forEachTranslateRotate(function(p, ij) {
				if (Math.abs((ij[0] + ij[1]) % 2) === mod_2) return
				let rotate_from = 1;
				let rotate_n = 4*2 // 4*2;
				let rotate_angle = s.PI/3./rotate_n * base_alpha;
				s.rotate(rotate_angle);
				let scale = 1;
				s.push()
				s.scale(scale)
				s.fill(stroke)
				s.triangle(...t)
				s.pop()
				s.fill(inner_fill)
				s.scale(2 - scale)
				s.triangle(...t)
				// s.fill("#FF0")
				// s.ellipse(0, 0, 10., 10)
			});
		}

		draw () {
			s.push()
			let inner_1 = "#00da00"
			inner_1 = "#00da00"
			let inner_2 = "#ff9900"
			inner_2 = "#b08"
			let stroke  = "#000"
			if (this.enabled_grid_id >= 1 - 0.001) {
				s.fill(inner_1)
				s.rect(-s.size_x, -s.size_y, 2*s.size_x, 2*s.size_y)
				this.draw_one_set(this.shifts_grid_red, 0, inner_2, stroke)
			} else {
				s.fill(inner_2)
				s.rect(-s.size_x, -s.size_y, 2*s.size_x, 2*s.size_y)
				s.translate(0, -this.h/3)			
				this.draw_one_set(this.shifts_grid, 1, inner_1, stroke)
			}
			s.pop()
		}

		getPreferredCanvasSize() {
			let n = this.ymax * 2 + 1;
			let w = n * this.a;
			// need this to be even for parity of lines if no rotation, thus (n + 1)
			// with rotation, there is h/3 missing + parity works other way (n + 1/3)
			let h = (n + 1/3) * this.h 

			return [w, h]
		}
	}
	var triangles = new Triangles();
	// [s.size_x, s.size_y] = triangles.getPreferredCanvasSize()

	s.drawBg = function() { s.background("#000"); }

	s.prepareNewSeeds = function(){
		triangles = new Triangles();
	}

	s.stepDynamics = function(){
		p5.tween.manager.update(s.deltaTime);
		if (s.animLoop.elapsedFrames === 0) { p5.tween.manager.restartAll();}
	}

	s.drawOnce = function(){
		s.drawBg()
		s.resetMatrix()
		s.translate(s.width/2, s.height/2)
		triangles.draw();
		// s.noLoop()
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