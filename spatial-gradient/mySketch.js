let spatial_gradient = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
    var [size_x, size_y] = [3840, 2160];
    var [size_x, size_y] = [512, 512];

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
					new utils.LoopNoiseDynamics( new p5.Vector(utils.randomIn(0, size_x),
						utils.randomIn(0, size_y)),
						new p5.Vector(size_x, size_y),
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
		spatialGradient = new utils.SpatialGradient(colorPoints, 3, (v => v**(-2)), utils.lerpManyVectors);
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
		for (var x = -rad; x <= size_x + 2 * rad; x +=  2*rad) {
			for (var y = -rad; y <= size_y + 2 * rad; y +=  2*rad) {
				let p = new p5.Vector(x, y);
				let c = spatialGradient.getPointColor(p);
				s.fill(s.color(...c.array()))
				s.rect(x, y, 2*rad, 2*rad);
				// s.circle(x, y, 2*rad);
			}
		}
	}

    s.setup = function() {
        s.createCanvas(size_x, size_y);
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