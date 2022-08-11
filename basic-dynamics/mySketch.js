
let myp5 = new p5(( sketch ) => {
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

    // Initialization
    var d = new utils.PerlinDynamics(new p5.Vector(100, 200), new p5.Vector(100, 300), 5.);

    var start, previousTimeStamp;
    s.draw = function(){
        var timestamp = s.millis();
        if (start === undefined) {
            start = timestamp;
            previousTimeStamp = timestamp;
            return;
        }
        const elapsed_ms = timestamp - start;
        const elapsed_s = elapsed_ms / 1000;
        const frame_s = (timestamp - previousTimeStamp)/1000;
        
        // main function body
        if (previousTimeStamp !== undefined) {
            d.step(frame_s, elapsed_s);
        }
        s.background("#00000001");
        s.fill( "#ffff00");
        var center = d.q;
        s.ellipse(center.x, center.y, 10, 10);
        
        // final housekeeping
        previousTimeStamp = timestamp;
    }
});