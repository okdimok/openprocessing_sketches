let hi_sticker = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
	[s.size_x, s.size_y] = utils.getSizeFromHash()

    var disturbance = 0.3;
	s.fps = 30;
	s.capture = true;
	s.video_format = "png";
	s.loop = 3;
	var colorPoints = [];
	var fullscreen = false;
	var spatialGradient;
	var gridSize = 30;
	var drawables = [];
	
	class HPath {
		constructor() {
			this.rad = 10;
			// h is the total height  in diameters
			// w is the width of the middle bar in diameters
			let r = this.rad;
			let h = 10, w = 3;
			this.path = new utils.Path()
				.addPoint(new p5.Vector(-w*r, r))
				.addPoint(new p5.Vector(w*r, r))
				.addPoint(new p5.Vector(w*r, r*h))
				.addPoint(new p5.Vector((w+2)*r, r*h))
				.addPoint(new p5.Vector((w+2)*r, -r*h))
				.addPoint(new p5.Vector(w*r, -r*h))
				.addPoint(new p5.Vector(w*r, -h))
				.addPoint(new p5.Vector(-w*r, -h))
				.addPoint(new p5.Vector(-w*r, -r*h))
				.addPoint(new p5.Vector(-(w+2)*r, -r*h))
				.addPoint(new p5.Vector(-(w+2)*r, r*h))
				.addPoint(new p5.Vector(-w*r, r*h))
				.close();
			this.total_n = s.floor(this.path.getTotalLength()/2/r/1.3);

		}

		draw () {
			s.push();
			s.noFill();
			s.translate(-10*this.rad, 0);
			this.path.display()
			for (var i = 0.; i < 1; i+=1./this.total_n) {
				let p = this.path.getPosAtT(i + s.animLoop.progress/3);
				s.fill("green")
				s.circle(p.x, p.y, 20);
				// s.rectMode(s.CENTER)
				// s.rect(p.x, p.y, 20, 20);
			}
			s.pop()
		}
	}

	class IPath {
		constructor() {
			this.rad = 10;
			// hb is the height of the bottom in diameters
			// ht is the height of the top in diameters
			let r = this.rad;
			let hb = 10, ht = 5;
			this.path = new utils.Path()
				.addPoint(new p5.Vector(-r, -ht*r))
				.addPoint(new p5.Vector(r, -ht*r))
				.addPoint(new p5.Vector(r, hb*r))
				.addPoint(new p5.Vector(-r, hb*r))
				.close();
			this.total_n = s.floor(this.path.getTotalLength()/2/r/1.3);

		}

		draw () {
			s.push();
			s.noFill();
			this.path.display()
			for (var i = 0.; i < 1; i+=1./this.total_n) {
				let p = this.path.getPosAtT(i + s.animLoop.progress);
				s.fill("green")
				s.circle(p.x, p.y, 20);
				// s.rectMode(s.CENTER)
				// s.rect(p.x, p.y, 20, 20);
			}
			s.pop()
		}
	}

	class ITopPath {
		constructor() {
			this.rad = 10;
			// hb is the height of the bottom in diameters
			// ht is the height of the top in diameters
			let r = this.rad;
			let hb = 10, ht = 3;
			this.path = new utils.Path()
				.addPoint(new p5.Vector(-r, -hb*r))
				.addPoint(new p5.Vector(r, -hb*r))
				.addPoint(new p5.Vector(r, -hb*(r-1)))
				.addPoint(new p5.Vector(-r, -hb*(r-1)))
				.close();
			this.total_n = 4;

		}

		draw () {
			s.push();
			s.noFill();
			this.path.display()
			for (var i = 0.; i < 1; i+=1./this.total_n) {
				let p = this.path.getPosAtT(i + s.animLoop.progress*3);
				s.fill("green")
				s.circle(p.x, p.y, 20);
				// s.rectMode(s.CENTER)
				// s.rect(p.x, p.y, 20, 20);
			}
			s.pop()
		}
	}



	s.drawBg = function() { s.background("#000"); }

	s.prepareNewSpatialGradient = function(){
	}

	s.stepGradient = function(){

	}

	s.drawGradientOnce = function(s){

	}

	s.prepareNewSeeds = function(){
		s.prepareNewSpatialGradient();
		drawables = [new HPath(), new IPath(), new ITopPath()]
		p5.tween.manager.restartAll();
	}

	s.stepDynamics = function(){
		s.stepGradient();
		p5.tween.manager.update(s.deltaTime);
		if (s.animLoop.elapsedFrames === 0) { p5.tween.manager.restartAll();}

	}

	s.drawOnce = function(){
		s.clear();
		// s.background("#000");
		for (var d of Object.values(drawables)) {
			d.draw()			
		}

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
		s.translate(s.size_x/2, s.size_y/2)
		s.stepDynamics();
		s.drawOnce();
	}

	utils.add_default_behaviors(this, s);




}