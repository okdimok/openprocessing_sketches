let object_background_t_shirt = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
	// In this sketch we predict size from triangles
	// [s.size_x, s.size_y] = utils.getSizeFromHash()

	s.fps = 1;
	s.capture = false;
	s.video_format = "png";
	s.loop = 3;

	class Triangles {
		constructor(){
			this.ymax = 10
			this.d = 30
			this.a = this.d * 2
			this.h = this.a * s.sqrt(3) /2
			this.shifts_grid = new utils.Grid([-40, 40], [0, this.ymax+2], [this.d, this.d]).prepareForTriangles()
			this.shifts_grid_red = new utils.Grid([-40, 40], [-this.ymax-2, -1], [this.d, this.d]).prepareForTriangles()
		}

		draw_one_set(shifts_grid, mod_2, inner_fill, stroke) {
			let t = shifts_grid.getCenteredTriangleVertices()
			shifts_grid.forEachTranslateRotate(function(p, ij) {
				if (Math.abs((ij[0] + ij[1]) % 2) === mod_2) return
				let rotate_from = 2 // 2
				let rotate_n = 4*2 // 4*2;
				let rotate_angle = s.PI/3./rotate_n;
				if (ij[1] > rotate_from) {
					if (ij[1] < rotate_from + rotate_n){
						s.rotate((ij[1] - rotate_from) * rotate_angle)
					} else {
						s.rotate(s.PI);
					}
				}
				if (ij[1] < -rotate_from) {
					if (ij[1] > -rotate_from - rotate_n) {
						s.rotate((ij[1] + rotate_from) * rotate_angle)
					} else {
						s.rotate(s.PI);
					}
				}
				let scale = 1.3;
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
			let inner_2 = "#ff9900"
			let stroke = "#ffec00"
			s.fill(inner_1)
			s.rect(-s.size_x, -s.size_y, 2*s.size_x, s.size_y - this.h/3)
			this.draw_one_set(this.shifts_grid_red, 0, inner_2, stroke)
			s.translate(0, -this.h/3)
			s.fill(inner_2)
			s.rect(-s.size_x, -this.h/3, 2*s.size_x, s.size_y)
			this.draw_one_set(this.shifts_grid, 1, inner_1, stroke)

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
	[s.size_x, s.size_y] = triangles.getPreferredCanvasSize()

	s.drawBg = function() { s.background("#000"); }

	s.prepareNewSeeds = function(){
		triangles = new Triangles();
	}


	s.drawOnce = function(){
		s.drawBg()
		s.resetMatrix()
		s.translate(s.width/2, s.height/2)
		triangles.draw();
		s.noLoop()
	}

    s.setup = function() {
        s.createCanvas(s.size_x, s.size_y, s.SVG);
        s.noStroke();
		// s.frameRate(s.fps);
		// s.createLoop(s.loop);
		s.prepareNewSeeds();

    }

	s.drawFrame = function() {
		s.clear()
		s.drawOnce();
	}

	utils.add_default_behaviors(this, s);

}