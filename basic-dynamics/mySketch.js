
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
        s.frameRate(50); // for best GIFs should be a multiplier of 100
        s.createLoop(6,
            {
                noise: {},
                gif: { fileName: "basicDynamics.gif", open: true, download: true, render: false, startLoop: 2, endLoop: 3 }
            })
        d = new utils.LoopNoiseDynamics(new p5.Vector(100, 200), new p5.Vector(100, 200), 0.5);
    }

    // Initialization
    s.draw = function(){       
        // main function body
        d.step(s.millis());

        s.background("#00000001");
        s.fill( "#ffff00");
        var center = d.q;
        s.ellipse(center.x, center.y, 10, 10);
        
        // final housekeeping
    }
};