var okdimokPrimitives = function (sketch) {
    let s = sketch;
    let utils = this;

    this.getPaperSizeInPixes = function (paper, dpi, landscape) {
        let paper_size_mm = {
            a2: [420, 594],
            a3: [297, 420],
            a4: [210, 297],
        }
        let mm_per_inch = 25.4;
        let sz = paper_size_mm[paper];
        sz = sz.map(s => s/mm_per_inch*dpi);
        if (landscape) {
            return [sz[1], sz[0]]
        } else {
            return sz;
        }
    }

	// https://github.com/spite/ccapture.js/#:~:text=The%20complete%20list%20of%20parameters%20is%3A
	// WebM image quality from 0.0 (worst) to 0.99999 (best), 1.00 (VP8L lossless) is not supported
    // https://github.com/mrchantey/p5.createLoop/tree/master/p5.createLoop#gif-options
    // https://github.com/jnordberg/gif.js#user-content-options
    this.run_ccapture = function (options, real_draw) {
        options ??= {};
        options.startLoop ??= 0;
        options.endLoop ??= 1;
        options.capture ??= {};
        let capturer = options.startLoop > 0 ? new CCapture(options.capture) : undefined;
        let saved = false;
        let draw = function () {
            if (s.animLoop.elapsedLoops === options.startLoop && s.animLoop.elapsedFrames === 0) {
                capturer.start()
            }
            real_draw()
            if (s.animLoop.elapsedLoops < options.endLoop &&
                s.animLoop.elapsedLoops >= options.startLoop &&
                options.startLoop > 0
            ) {
                capturer.capture(s.canvas);
            } else if (!saved &&
                 s.animLoop.elapsedLoops >= options.endLoop &&
                 options.startLoop > 0
                 ) {
                capturer.stop();
                capturer.save();
                saved = true;
            }
        }

        let captureNextLoop = function(){
            if (capturer !== undefined) {
                capturer.stop();
            } else {
                capturer = new CCapture(options.capture);
            }
            options.startLoop = s.animLoop.elapsedLoops + 1
            options.endLoop = s.animLoop.elapsedLoops + 2
            saved = false;
        }
        return [draw, captureNextLoop];

    }

    this.randomIn = function randomIn (left, right) {
        return left + Math.random()*(right - left);
    }

    this.clip = function (v, minv, maxv) {
        if (v < minv) return minv;
        if (v > maxv) return maxv;
        return v;
    }

    this.realMod = v => v - Math.floor(v);

    this.hslFracToColor = function (h, s, l) {
        return sketch.color("hsl(" +
            (this.realMod(h) * 360).toFixed(0) + ", " +
            (this.clip(s, 0, 1)*100).toFixed(0) + "%, " +
            (this.clip(l, 0, 1)*100).toFixed(0) + "%" +
            ")");	
    }

    this.colorFracToHex = function (frac_orig) {
        var frac = this.clip(frac_orig, 0, 0.999)
        var s = Math.floor(frac * 256).toString(16);
        if (s.length == 1) return "0" + s;
        if (s.length == 2) return s;
        return "00";
    }

    this.ColorPoint = class ColorPoint {
        constructor(point, color) {
            this.p = point;
            this.p_is_dynamic = point instanceof utils.BasicDynamics
            this.c = color;
            this.c_is_dynamic = color instanceof utils.BasicDynamics
        }

        get_color() { return this.c_is_dynamic ? s.color(this.c.q.array()) : this.c; }
        get_point() { return this.p_is_dynamic ? this.p.q : this.p; }
        set_color(color) { this.c = color; }
        set_point(point) { this.p = point; }
    }

    
    this.lerpManyPrototype = function(channel_array_getter, final_wrapper) {
        return function(...colors) {
            let result = channel_array_getter(colors[0][0]).map(c => 0);
            var ratios = colors.map(c => c[1]);
            var total = ratios.reduce((partialSum, r) => partialSum + r, 0);
            ratios = ratios.map(r => r / total);
            for (var ch in result) {
                for (let i = 0; i < colors.length; i++) {
                    result[ch] += ratios[i] * channel_array_getter(colors[i][0])[ch];
                }
            }
            return final_wrapper(...result);
        }
    }

    this.lerpManyColors = this.lerpManyPrototype((color) => color.levels, s.color.bind(s))
    this.lerpManyArrays = this.lerpManyPrototype((color) => color, function(...args) {return args})
    this.lerpManyVectors = this.lerpManyPrototype((color) => color.array(), function(...args) {return new p5.Vector(...args)})

    this.middle = function (points){
        let middle = new p5.Vector();
        for (const p of points) {
            middle.add(p);
        }
        middle.mult(1.0/points.length);
        return middle;
    }    

    // Takes an array and a number of needed minimal values
    // returns an array of pairs [[min_index, value_at_that_index]]
    this.argminN = function (ar, n) {
        let minPairs = [];
        for (var [k, v] of Object.entries(ar)) {
            if (minPairs.length < n) {
                minPairs.push([k, v])
            } else {
                if (v < minPairs[n - 1][1]) {
                    minPairs[n - 1] = [k, v];
                } else {
                    continue;
                }
            }
            minPairs.sort((a, b) => a[1] - b[1]);
        }
        return minPairs;
    }

    this.SpatialGradient = class SpatialGradient {
        constructor(colorPoints, n_closest, distance_mapping, lerper) {
            this.colorPoints = colorPoints;
            this.n_closest = n_closest;
            this.distance_mapping = distance_mapping ?? (v => v**(-2));
            this.lerper = lerper ?? utils.lerpManyColors
        }

        getPointColor(point){
            let distances = this.colorPoints.map(cp => p5.Vector.sub(cp.get_point(), point).magSq());
            let closest = utils.argminN(distances, this.n_closest);
            let pairs = closest.map(v => [this.colorPoints[v[0]].get_color(), this.distance_mapping(v[1])]);
            return this.lerper(...pairs);
        }
    }

    this.BasicDynamics = class BasicDynamics {
        constructor(q) {
            this.q = q;
            this.prev_time = undefined;
        }
        
        frame_time(millis){
            let frame_time = millis - this.prev_time;
            this.prev_time = millis;
            return frame_time;
        }
        
        step(millis) {
            this.frame_time(millis);
        }
    }

    this.LinearDynamics = class LinearDynamics extends this.BasicDynamics {
        constructor(q, qdot) {
            super(q);
            this.qdot = qdot;
        }
                
        step(millis) {
            let frame_s = this.frame_time(millis)/ 1000;
            console.assert(frame_s !== undefined);
            let dq = this.qdot.copy().mult(frame_s);
            this.q.add(dq);
        }
    }

    this.PerlinDynamics = class PerlinDynamics extends this.BasicDynamics {
        constructor(q, sz, tempo) {
            super(q);
            this.qinit = q.copy();
            this.sz = sz;
            this.tempo = tempo;
            this.seed = utils.randomIn(0, 10000);
            this.seed2 = utils.randomIn(1000, 10000);
            this.step(0);
        }
        
        step(millis) {
            let frame_s = this.frame_time(millis)/ 1000;
            let elapsed_s = millis/1000;
            console.assert(frame_s !== undefined);
            this.q.x = this.qinit.x + s.map(s.noise(elapsed_s/this.tempo, this.seed), 0, 1, -1, 1)*this.sz.x;
            this.q.y = this.qinit.y + s.map(s.noise(elapsed_s/this.tempo, this.seed, this.seed2), 0, 1, -1, 1)*this.sz.y;
        }
        
    }

    this.LoopNoiseDynamics = class LoopNoiseDynamics extends this.BasicDynamics {
        constructor(q, sz, radius, step_z) {
            super(q);
            this.qinit = q.copy();
            this.sz = sz;
            this.radius = radius;
            this.seed_x = utils.randomIn(0, 10);
            this.seed_y = utils.randomIn(10, 100);
            this.seed_z = utils.randomIn(100, 200);
            this.step_z = step_z;
            this.step(0);
        }
        
        step() {
            this.q.x = this.qinit.x + s.animLoop.noise({radius:this.radius, seed: this.seed_x})*this.sz.x; 
            this.q.y = this.qinit.y + s.animLoop.noise({radius:this.radius, seed: this.seed_y})*this.sz.y;
            if (this.step_z) {
                this.q.z = this.qinit.z + s.animLoop.noise({radius:this.radius, seed: this.seed_z})*this.sz.z;
            }
        }
        
    }

    this.add_default_behaviors = function(ctx, sketch) {
        let s = sketch;

        s.captureNextLoop = function(){};
        if (ctx.capture) {
            [s.draw, s.captureNextLoop] = utils.run_ccapture({startLoop: -1, capture:{ format: 'webm', framerate: fps, name: "spatialGradient_"+(new Date().toISOString()), display: true, quality: 0.95 }}, s.drawFrame.bind(s))
        } else {
            s.draw = s.drawFrame;
        }
    
        s.mouseClicked = function() {
            s.prepareNewSeeds();
            s.drawOnce();
        }
    
        s.keyTyped = function() {
            if (s.key === 's') {
                s.captureNextLoop();
            } else if (s.key === 'f') {
                s.changeFullSreen();
            } else if (s.key === 'r') {
                s.background("#000")
            } else if (s.key === 'c') {
                s.exportCanvasAsPNG()
            }
        }
    
        s.windowResized = function() {
            if (ctx.fullscreen) {
                s.resizeCanvas(s.windowWidth, s.windowHeight)
                s.drawBg()
                s.prepareNewSeeds()
                s.drawOnce()
            }
        }
    
        s.changeFullSreen = function () {
            ctx.fullscreen = !ctx.fullscreen;
            s.fullscreen(ctx.fullscreen);
            if (ctx.fullscreen) {
                document.querySelector("body").style.overflow= "hidden";
                s.resizeCanvas(s.windowWidth, s.windowHeight)
            } else {
                s.resizeCanvas(s.size_x, s.size_y)
            }
            s.drawBg()
            s.prepareNewSeeds()
            s.drawOnce()
        }

        s.exportCanvasAsPNG = function(fileName) {

            fileName ??= "generative.png"
            var MIME_TYPE = "image/png";
            var imgURL = s.canvas.toDataURL(MIME_TYPE);
        
            var dlLink = document.createElement('a');
            dlLink.download = fileName;
            dlLink.href = imgURL;
            dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');
        
            document.body.appendChild(dlLink);
            dlLink.click();
            document.body.removeChild(dlLink);
        }



    }

};