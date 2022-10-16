let spatial_gradient = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
	[s.size_x, s.size_y] = utils.getSizeFromHash()


    var disturbance = 0.3;
	var spatialGradient;
	var fps = 30;
	var capture = true;
	var loop = 180;

	s.prepareNewSpatialGradient = function(){
		var colorPoints = []; 	
		for (let i = 0; i < 6; i++) {
			colorPoints.push(
				new utils.ColorPoint(
					new utils.LoopNoiseDynamics( new p5.Vector(utils.randomIn(0, s.width),
						utils.randomIn(0, s.height)),
						new p5.Vector(s.width, s.height),
						0.01*loop
					),
					new utils.LoopNoiseDynamics(
						new p5.Vector (
							utils.randomIn(100, 255),
							utils.randomIn(100, 255),
							utils.randomIn(100, 255)
						),
						new p5.Vector(100, 100, 100),
						0.03*loop,
						true
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

	s.drawGradientOnce = function(){
		const rad = 16.;
		s.rectMode(s.CENTER)
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

    s.setup = function() {
        s.createCanvas(s.size_x, s.size_y);
        s.background("#000");
        s.noStroke();
		s.frameRate(fps);
		s.createLoop(loop);
		s.prepareNewSpatialGradient();
		s.drawGradientOnce();
    }


	s.draw = function() {
		s.stepGradient();
		s.drawGradientOnce();
	}

	s.captureNextLoop = function(){};
	if (capture) {[s.draw, s.captureNextLoop] = utils.run_ccapture({startLoop: -1, capture:{ format: 'webm', framerate: fps, name: "spatialGradient_"+(new Date().toISOString()), display: true, quality: 0.95 }}, s.draw.bind(s))}

	s.mouseClicked = function() {
		s.prepareNewSpatialGradient();
		s.drawGradientOnce();
	}

	s.keyTyped = function() {
		if (s.key === 's') {
			s.captureNextLoop();
		}
	}


}