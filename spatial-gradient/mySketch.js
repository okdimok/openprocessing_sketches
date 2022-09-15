let spatial_gradient = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
    var [size_x, size_y] = [3840, 2160];
    var [size_x, size_y] = [500, 500];

    var disturbance = 0.3;
	var spatialGradient;

	s.prepareNewSpatialGradient = function(){
		var colorPoints = [
			// new utils.ColorPoint(new p5.Vector(10, 10), s.color(0.1, 0.2, 0.3)),
			// new utils.ColorPoint(new p5.Vector(100, 10), s.color(0.1, 0.7, 0.3)),
			// new utils.ColorPoint(new p5.Vector(10, 200), s.color(0.7, 0.2, 0.3)),
			// new utils.ColorPoint(new p5.Vector(200, 200), s.color(1.1, 0.2, 0.3)),
			// new utils.ColorPoint(new p5.Vector(500, 200), s.color(0, 1.2, 1.3)),
			// new utils.ColorPoint(new p5.Vector(300, 500), s.color(0, 0., 1.3)),
		];
		for (let i = 0; i < 6; i++) {
			colorPoints.push(
				new utils.ColorPoint(
					new p5.Vector(utils.randomIn(0, size_x),
						utils.randomIn(0, size_y)),
					[utils.randomIn(0, 255),
						utils.randomIn(0, 255),
						utils.randomIn(0, 255),
						255
					]
				)
			)
		}
		spatialGradient = new utils.SpatialGradient(colorPoints, 3, (v => v**(-2)), utils.lerpManyArrays);
	}

	s.drawGradientOnce = function(){
		const rad = 3;
		for (var x = -rad; x <= size_x + 2 * rad; x += 2 * rad) {
			for (var y = -rad; y <= size_y + 2 * rad; y += 2 * rad) {
				let p = new p5.Vector(x, y);
				let c = spatialGradient.getPointColor(p);
				s.fill(s.color(...c))
				s.circle(x, y, 2*rad);
			}
		}
	}

    s.setup = function() {
        s.createCanvas(size_x, size_y);
        s.background("#000");
        s.noStroke();
		s.prepareNewSpatialGradient();
		s.drawGradientOnce();
    }


	s.draw = function() {

		// for (const cp of Object.values(colorPoints)) {
		// 	circle(cp.p, 10, cp.c.getHex());
		// }

		
		// let p = new Point(200, 300);
		// circle(p, rad, getPointColor(p, colorPoints).getHex());
	}

	s.mouseClicked = function() {
		s.prepareNewSpatialGradient();
		s.drawGradientOnce();
	}


}