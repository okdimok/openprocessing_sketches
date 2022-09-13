
let basic_dynamics = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(s);
    var [size_x, size_y] = [3840, 2160];
    var [size_x, size_y] = [500, 500];

    var disturbance = 0.3;
    var d; 

    s.setup = function() {
        s.createCanvas(size_x, size_y);
        s.background("#000");
        s.noStroke();
        s.frameRate(40);
        s.createLoop(3,
            { noise: {},
            // gif: { open: true, render: false }
         })
        d = new utils.LoopNoiseDynamics(new p5.Vector(100, 200), new p5.Vector(100, 200), 0.2);
    }

    // Initialization

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
};