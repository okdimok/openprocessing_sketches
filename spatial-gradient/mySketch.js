let spatial_gradient = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
    var [size_x, size_y] = [3840, 2160];
    var [size_x, size_y] = [500, 500];

    var disturbance = 0.3;

    s.setup = function() {
        s.createCanvas(size_x, size_y);
        s.background("#000");
        s.noStroke();
    }

	this.getPointColor = function (point, colorPoints) {
		let distances = colorPoints.map(cp => p5.Vector.sub(cp.p, point).magSq());
		let closest = utils.argminN(distances, 3);
		// let pairs = closest.map (v => [colorPoints[v[0]].c, size_x + size_y - v[1]]);
		let pairs = closest.map (v => [colorPoints[v[0]].c, v[1]**(-1)]);
		return utils.Color.mixMany(...pairs);
	
	}

	s.draw = function() {
		var colorPoints = [
			new utils.ColorPoint(new p5.Vector(10, 10), new utils.Color(0.1, 0.2, 0.3)),
			new utils.ColorPoint(new p5.Vector(100, 10), new utils.Color(0.1, 0.7, 0.3)),
			new utils.ColorPoint(new p5.Vector(10, 200), new utils.Color(0.7, 0.2, 0.3)),
			new utils.ColorPoint(new p5.Vector(200, 200), new utils.Color(1.1, 0.2, 0.3)),
			new utils.ColorPoint(new p5.Vector(500, 200), new utils.Color(0, 1.2, 1.3)),
			new utils.ColorPoint(new p5.Vector(300, 500), new utils.Color(0, 0., 1.3)),
		];
		// for (const cp of Object.values(colorPoints)) {
		// 	circle(cp.p, 10, cp.c.getHex());
		// }
		const rad = 3;
		for (var x = -rad; x <= size_x + 2 * rad; x += 2 * rad) {
			for (var y = -rad; y <= size_y + 2 * rad; y += 2 * rad) {
				let p = new p5.Vector(x, y);
				s.fill(getPointColor(p, colorPoints).getHex())
				s.circle(x, y, 2*rad);
			}
		}
		
		// let p = new Point(200, 300);
		// circle(p, rad, getPointColor(p, colorPoints).getHex());
	}

}