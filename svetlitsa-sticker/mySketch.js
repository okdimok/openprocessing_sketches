let svetlitsa_sticker = function ( sketch ) {
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
	var mask;
	var checkmark_fill, checkmark_fill_img;
	var spatialGradient;
	var gridSize = 30;
	
	class SvetlitsaSticker {
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
		}

		draw () {
			s.tint(this.r, this.g, this.b);
		}

	}

	var svetlitsasticker = new SvetlitsaSticker();

	s.drawBg = function() { s.background("#000"); }

	s.prepareNewSpatialGradient = function(){
		var colorPoints = []; 	
		for (let i = 0; i < 7; i++) {
			colorPoints.push(
				new utils.ColorPoint(
					new p5.Vector(utils.randomIn(0, s.width),
						utils.randomIn(0, s.height)),
					new p5.Vector (
						utils.randomIn(50, 255),
						utils.randomIn(50, 255),
						utils.randomIn(50, 255),
					),
				)
			)
		}
		spatialGradient = new utils.SpatialGradient(colorPoints, 3, (v => v**(-2)), utils.lerpManyVectors);
	}

	s.stepGradient = function(){
		let millis = s.millis();
		// for (var cp of Object.values(spatialGradient.colorPoints)) {
		// 	cp.p.step(millis);
		// 	cp.c.step(millis);
		// }
	}

	s.drawGradientOnce = function(s){
		const rad = s.width/gridSize;
		s.rectMode(s.CENTER)
		s.noStroke();
		for (var x = -rad; x <= s.width + 2 * rad; x +=  2*rad) {
			for (var y = -rad; y <= s.height + 2 * rad; y +=  2*rad) {
				let p = new p5.Vector(x, y);
				let c = s.color(...(spatialGradient.getPointColor(p).array()));
				s.fill(c)
				s.rect(x, y, 2*rad, 2*rad);
				// s.circle(x, y, 2*rad);
			}
		}
	}

	s.prepareNewSeeds = function(){
		if (mask) {mask.remove()}
		mask = s.createGraphics(s.width, s.height);
		if (checkmark_fill) {checkmark_fill.remove()}
		checkmark_fill = s.createGraphics(s.width, s.height);
		s.prepareNewSpatialGradient();
		// checkmark_fill.background("red");
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
		s.drawGradientOnce(checkmark_fill);
		checkmark_fill_img = checkmark_fill.get() 
		// checkmark_fill_img.mask( mask.get() );
		svetlitsasticker.draw();
		s.image(checkmark_fill_img, 0, 0);


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