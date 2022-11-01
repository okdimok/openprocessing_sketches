let yesno_sticker = function ( sketch ) {
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
	class YesNoSticker {
		constructor() {
			this.t = 0;
			this.tween = p5.tween.manager.addTween(this)
				.setSketch(s)
				.addMotionSeconds('t', 1, s.loop/4)
				.addMotionsSeconds([], s.loop/4)
				.addMotionSeconds('t', 0, s.loop/4)
				.addLastMotions([])
				.startLoop();
		}

		draw (img, color) {
			let w = 0.1, l = 0.3, l2=0.5;
			let t = this.t;
			img.clear()
			img.background("#0000")
			img.noStroke();
			img.fill(color)
			img.push()
			img.scale(img.width);
			img.translate(0.5, 0.5);
			img.rectMode(s.CORNERS);
			img.rotate(-s.QUARTER_PI);
			// t == 0, cross
			let ll = (2*l+w)/2, ww = w/2;
			let rect11 = [-ll, -ww, ll, ww];
			let rect12 = [-ww, -ll, ww, ll];
			// t == 1, checkmark
				// img.translate(-3/gridSize, -1/gridSize);
			let rect21 = [-w, 0, l2-w, w];
			let rect22 = [-w, -l+w, 0, w];
				// img.rect(-w, 0, l2-w, w);
				// img.rect(0, w, -w, -l+w);
			img.translate(-3/gridSize*t, -1/gridSize*t);
			let rect1 = utils.lerpManyArrays([rect11, 1-t], [rect21, t])
			let rect2 = utils.lerpManyArrays([rect12, 1-t], [rect22, t])
			img.rect(...rect1);
			img.rect(...rect2);
			img.pop()
		}

	}

	var yesnosticker = new YesNoSticker();

	s.drawBg = function() { s.background("#000"); }

	s.prepareNewSpatialGradient = function(){
		var colorPoints = []; 	
		for (let i = 0; i < 15; i++) {
			colorPoints.push(
				new utils.ColorPoint(
					new utils.LoopNoiseDynamics( new p5.Vector(utils.randomIn(0, s.width),
						utils.randomIn(0, s.height)),
						new p5.Vector(s.width, s.height),
						0.01*s.loop
					),
					new utils.TweenDynamics(
						new p5.Vector (
							utils.randomIn(50, 255),
							utils.randomIn(0, 50),
							utils.randomIn(0, 1)
						),
						function (q) {
							return p5.tween.manager.addTween(q)
								.addMotionsSeconds([
									{ key: 'x', target: utils.randomIn(0, 100) },
									{ key: 'y', target: utils.randomIn(50, 255) },
									{ key: 'z', target: utils.randomIn(0, 50), },
									], s.loop/4)
								.addMotionsSeconds([], s.loop/4)
								.addMotionsSeconds([
									{ key: 'x', target: q.x },
									{ key: 'y', target: q.y },
									{ key: 'z', target: q.z },
									], s.loop/4)
								.addLastMotions([])
								.startLoop();
						}
					)
				)
			)
		}
		spatialGradient = new utils.SpatialGradient(colorPoints, 3, (v => v**(-2)), utils.lerpManyColors);
	}

	s.stepGradient = function(){
		let millis = s.millis();
		for (var cp of Object.values(spatialGradient.colorPoints)) {
			cp.p.step(millis);
			cp.c.step(millis);
		}
	}

	s.drawGradientOnce = function(s){
		const rad = s.width/gridSize;
		s.rectMode(s.CENTER)
		s.noStroke();
		for (var x = -rad; x <= s.width + 2 * rad; x +=  2*rad) {
			for (var y = -rad; y <= s.height + 2 * rad; y +=  2*rad) {
				let p = new p5.Vector(x, y);
				let c = spatialGradient.getPointColor(p);
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
		let millis = s.millis();
		s.stepGradient();
		// for (var cp of Object.values(colorPoints)) {
		// 	cp.p.step(millis);
		// 	cp.c.step(millis);
		// }
		p5.tween.manager.update(s.deltaTime);
		if (s.animLoop.elapsedFrames === 0) { p5.tween.manager.restartAll();}

	}

	s.drawOnce = function(){
		s.clear();
		// s.background("#000");
		yesnosticker.draw(mask, "#ffff");
		s.drawGradientOnce(checkmark_fill);
		checkmark_fill_img = checkmark_fill.get() 
		checkmark_fill_img.mask( mask.get() );
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