var okdimokPrimitives = function (sketch) {
    let s = sketch;
    let utils = this;

    this.parsedHash = new URLSearchParams(
        window.location.hash.substring(1) // skip the first char (#)
    );

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

    this.getScreenSize = function() {
        let sz = [s.displayWidth, s.displayHeight]
        sz = sz.map(x => x* s.pixelDensity())
        return sz
    }

    this.getSizeFromHash = function () {
        let sz = this.parsedHash.get("sz")
        switch (sz){
            case "tgm":
                return [512, 512];
            case "window":
                return [s.windowWidth, s.windowHeight];
            case "screen":
                return this.getScreenSize();
            case "a2":
            case "a3":
            case "a4":
                return this.getPaperSizeInPixes(this.parsedHash.get("sz"), this.parsedHash.get("dpi")??300, this.parsedHash.get("landscape"))
            default:
                sz = parseInt(sz);
                if (!sz) sz = 512;
                return [sz, sz];
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
                s.fixDeltaTime = s.realFixDeltaTime;
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
                s.fixDeltaTime = () => true;
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

    // mode in s.RGB, s.HSL, s.HSB
    // maxes (array of 4 numbers)
    // values (array of 4 numbers)
    this.newUnitColor = function(mode, values) {
        let maxes = {};
        maxes[mode] = [1, 1, 1, 1];
        let c = {
            _colorMode: mode,
            _colorMaxes: maxes
        }
        return new p5.Color(c, values);
    }

    p5.Color.prototype.copy = function(){
        let c = {
            _colorMode: this.mode,
            _colorMaxes: this.maxes
        }
        let cc = new p5.Color(c, this._array)
        cc._array = this._array;
        cc.levels = this.levels;
        return cc;
    }

    p5.Color.prototype.multiply = function(p){
        this._array = this._array.map((e, i) => i < 3 ? e * p : e);
        this.levels = this.levels.map((e, i) => i < 3 ? e * p : e);
        return this;
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

    // Returns the function that takes a number of pairs as it arguments
    // [lerpable, weight]
    // and linearly interpolates them
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
    // note this doesn't work as expected, because the _array and thee levels are stored in RGBA
    // search for "// Convert to RGBA and return." in p5.js
    // this.lerpManyHSLUnitColors = this.lerpManyPrototype((color) => color._array, function(...vals) {return utils.newUnitColor(s.HSL, vals)})
    // this.lerpManyHSBUnitColors = this.lerpManyPrototype((color) => color._array, function(...vals) {return utils.newUnitColor(s.HSB, vals)})
    this.lerpManyArrays = this.lerpManyPrototype((color) => color, function(...args) {return args})
    this.lerpManyVectors = this.lerpManyPrototype((color) => color.array(), function(...args) {return new p5.Vector(...args)})
    // the format is the same as for the lerpManyColors, uses Arrays as inputs and outpus
    this.lerpTwoUnitHSLTriplets = function(...colors) {
        console.assert(colors.length == 2, "More than two hsl colors")
        let h0 = colors[0][0][0], h1 = colors[1][0][0];
        let new_color;
        if (s.abs(h1-h0) >= 0.5) {
            if (h0 < h1) { 
                colors[0][0][0] += 1; // h0 
            }
            else { 
                colors[1][0][0] += 1; // h1
            }
            new_color = utils.lerpManyArrays(...colors);
            if (h0 < h1) { 
                colors[0][0][0] -= 1; // h0 
            }
            else { 
                colors[1][0][0] -= 1; // h1
            }
            new_color[0] %= 1;
        } else {
            new_color = utils.lerpManyArrays(...colors);
        }
        return new_color;
    }

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
        /**
         * @param  {p5.Vector} q the initial position
         */
        constructor(q) {
            this.q = q;
            this.prev_time = undefined;
            this.prev_q = undefined;
            this.dq = undefined;
        }
        
        /**
         * @param  {float} millis the current number of millis
         */
        frame_time(millis){
            let frame_time = millis - this.prev_time;
            this.prev_time = millis;
            return frame_time;
        }

        update_dq(){
            let dq = p5.Vector.sub(this.q, this.prev_q);
            this.prev_q = this.q.copy();
            this.dq = dq
            return dq;
        }

        step_impl(millis){
            true;
        }
        
        step(millis) {
            this.frame_s = this.frame_time(millis)/1000;
            this.step_impl(millis);
            this.update_dq();
        }
    }

    this.LinearDynamics = class LinearDynamics extends this.BasicDynamics {
        constructor(q, qdot) {
            super(q);
            this.qdot = qdot;
        }
                
        step_impl() {
            console.assert(this.frame_s !== undefined);
            let dq = this.qdot.copy().mult(this.frame_s);
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
        
        step_impl(millis) {
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
        
        step_impl() {
            this.q.x = this.qinit.x + s.animLoop.noise({radius:this.radius, seed: this.seed_x})*this.sz.x; 
            this.q.y = this.qinit.y + s.animLoop.noise({radius:this.radius, seed: this.seed_y})*this.sz.y;
            if (this.step_z) {
                this.q.z = this.qinit.z + s.animLoop.noise({radius:this.radius, seed: this.seed_z})*this.sz.z;
            }
        }
        
    }

    this.Path = class Path {
        constructor() {
            // A Path is an arraylist of points (Vector objects)
            this.points = [];
            this.lengths = [];
            this.speeds = [];
            this.cum_lengths = [];
            this.closed = s.OPEN;
        }

        // Add a point to the path
        addPoint(p, speed) {
            speed ??= 1;
            this.points.push(p);
            if (this.lengths.length === 0) { this.lengths.push(0); }
            else {
                this.lengths.push(p5.Vector.sub(p, this.points[this.points.length - 2]).mag()/speed);
                this.speeds.push(speed);
            }
            this.update_cum_lengths()
            return this;
        }
        
        update_cum_lengths(){
            let sum = 0;
            this.cum_lengths = this.lengths.map( (sum = 0, n => sum += n)) ;
        }
        
        close(speed) {
            this.addPoint(this.points[0], speed)
            this.closed = s.CLOSE;
            return this;
        }
        
        getTotalLength() {
            return this.cum_lengths[this.cum_lengths.length - 1];
        }

        getPosAtT(t) {
            t = t % 1;
            let l = t*this.getTotalLength();
            // First need to find out the segment
            let right_end = this.cum_lengths.reduce((prev, cur, ind) => {
                if (prev) return prev;
                if (cur > l) return ind;
                return undefined;
            });
            let left_end = right_end - 1;
            return utils.lerpManyVectors(
                [this.points[left_end], this.cum_lengths[right_end] - l],
                [this.points[right_end], l - this.cum_lengths[left_end]]
            );
        }

        // Draw the path
        display() {
            s.beginShape();
            for (let v of this.points) {
                s.vertex(v.x, v.y);
            }
            s.endShape(this.closed);
        }
    } 

    // public static ArrayList<Point2> build_shifts_grid(ArrayList<Point2> grid, Point2 grid_dims, Point2 inter_shift) {
    //     ArrayList<Point2> a = new ArrayList<>(); 
    //     Point2 gd = grid_dims;
    //     Point2 is = inter_shift;
    
    //     for (Point2 g: grid) {
    //       float i = g.x, j = g.y;
    //       a.add(new Point2(gd.x*i + is.x*j, gd.y*j + is.y*i));
    
    //     }
    //     return a;
    //   }
    this.Grid = class Grid {
        /**
        * @param {int[]} width - [0] and [1] are an integer boundaries of the grid width
        * @param {int[]} height - [0] and [1] are an integer boundaries of the grid height
        * @param {(p5.Vector|float[])} shift - A shift in px between two adjacent elements
        * @param {(p5.Vector|float[])} inter_shift - An additional distortional shift
         */
        constructor(width, height, shift, inter_shift) {
            this.width = width
            this.height = height;
            this.shift = shift;
            this.inter_shift = inter_shift ?? [0, 0];
        }

        /**
         * Just executes the cb with every grid point as a parameter
         * 
         * @param {function} cb - a function to be called like cb(p, ij, grid)
         */
        forEach(cb) {
            for (let i = this.width[0]; i <= this.width[1]; i++) {
                for (let j = this.height[0]; j <= this.height[1]; j++) {
                    let x = this.shift[0]*i + this.inter_shift[0]*j;
                    let y = this.shift[1]*j + this.inter_shift[1]*i;
                    let p = [x, y]
                    cb([x, y], [i, j], this)
                }
            }
        }

        /**
         * Translates to every grid point and then executes cb
         * 
         * @param {function} cb - a function to be called like cb(p, ij, grid)
         */
        forEachTranslate(cb, img) {
            let gr = img ?? s;
            this.forEach(function(p, ij, grid) {
                gr.push()
                gr.translate(p[0], p[1])
                cb(p, ij, grid)
                gr.pop()
            })
        }

        /**
         * Translates to every grid point, and rotates in a checkerboard pattern and then executes cb
         * 
         * @param {function} cb - a function to be called like cb(p, ij, grid)
         */
        forEachTranslateRotate(cb, img) {
            let gr = img ?? s;
            this.forEachTranslate(function(p, ij, grid) {
                gr.rotate((ij[0] + ij[1])*s.PI)
                cb(p, ij, grid)
            }, img)
        }
        
        /**
         * Modifies shift.y so that triangles align perfectly 
         */
        prepareForTriangles() {
            this.shift[1] = this.shift[0]*s.sqrt(3)
            return this
        }

        /**
         * @return {p5.Vector[]} three Vectors of triangle vertices 
         */
        getTriangleVectors () {
            // console.assert(this.shift[0] == this.shift[1], this.shift)
            let a = this.shift[0] * 2
            let h =  this.shift[0] * s.sqrt(3)
            let top = new p5.Vector(0, h/2);
            let av = new p5.Vector(0, a);
            let left = p5.Vector.add(top, av.rotate(-5*s.PI/6))
            let right = p5.Vector.add(top, av.rotate(-s.PI/3))
            return [top, left, right]
        }

        /**
         * @return {float[]} six coordinates of triangle vertices 
         */
        getTriangleVertices () {
            let [top, left, right] = this.getTriangleVectors()
            return [top.x, top.y, left.x, left.y, right.x, right.y]
        }


    }

    if (p5.hasOwnProperty('tween')) {
        let tween_prev_update = p5.tween.manager.update.bind(p5.tween.manager);
        p5.tween.manager.update = function (deltaTime) {
            if (deltaTime === undefined) { return ; }
            if (deltaTime === 0) { return; }
            return tween_prev_update(deltaTime);
        }
        p5.tween.manager.restartAll = function(deltaTime) {
            for (let tweenItem of this.tweens) {
                tweenItem.tween.restart();
            }
        }
        p5.tween.Tween.prototype.setSketch = function (s) { this.s = s; return this;}
        p5.tween.Tween.prototype.getTotalDuration = function() {return this.motions.map(m=>m.duration).reduce((a, b) => a + b, 0);}
        p5.tween.Tween.prototype.addLastMotion = function (key, target, easing = 'linear') {
            console.assert(s, "Sketch has to be set");
            return this.addMotion(key, target, s.loop*1000 - this.getTotalDuration(), easing);
        }
        p5.tween.Tween.prototype.addLastMotions = function (actions, easing = 'linear') {
            console.assert(s, "Sketch has to be set");
            return this.addMotions(actions, s.loop*1000 - this.getTotalDuration(), easing);
        }
        p5.tween.Tween.prototype.addMotionSeconds = function (key, target, duration_s, easing = 'linear') {
            console.assert(duration_s, "Duration has to be set");
            return this.addMotion(key, target, duration_s*1000, easing);
        }
        p5.tween.Tween.prototype.addMotionsSeconds = function (actions, duration_s, easing = 'linear') {
            console.assert(duration_s, "Duration has to be set");
            return this.addMotions(actions, duration_s*1000, easing);
        }

        this.TweenDynamics = class TweenDynamics extends this.BasicDynamics {
            constructor(q, tween_create_func) {
                super(q);
                this.qinit = q.copy();
                this.step(0);
                this.tween = tween_create_func(q);
            }            
            step_impl() { }
        }

        // p5.tween.manager.Tween =  p5.tween.Tween;
    
    }

    this.add_default_behaviors = function(ctx, sketch, name) {
        let s = sketch;
        name ??= "generative"
        if (this.parsedHash.get("sz")) {
            name += "_" + this.parsedHash.get("sz");
        }

        s.captureNextLoop = function(){};
        if (s.capture) {
            [s.draw, s.captureNextLoop] = utils.run_ccapture({startLoop: -1, capture:{ format: s.video_format??'webm', framerate: s.fps, name: name + "_"+(new Date().toISOString()), display: true, quality: 0.95 }}, s.drawFrame.bind(s))
        } else {
            s.draw = s.drawFrame;
        }
        // s.prev_millis = s.millis();

        // get applied appropriately in run_ccapture
        s.realFixDeltaTime = function() {s.deltaTime = 1000./s.fps + 1e-6}
        s.fixDeltaTime = function() {}
        s.registerMethod('pre', () => {s.fixDeltaTime()});
   
        s.keyTyped = function() {
            if (s.key === 's') {
                s.captureNextLoop();
            } else if (s.key === 'f') {
                s.changeFullSreen();
            } else if (s.key === 'r') {
                s.background("#000")
            } else if (s.key === 'c') {
                s.exportCanvasAsPNG()
            } else if (s.key === 'x') {
                s.prepareNewSeeds()
                s.drawOnce()
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

        s.exportCanvasAsPNG = function() {

            let fileName = name + ".png"
            let MIME_TYPE = "image/png";
            let imgURL = s.canvas.toDataURL(MIME_TYPE);
        
            let dlLink = document.createElement('a');
            dlLink.download = fileName;
            dlLink.href = imgURL;
            dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');
        
            document.body.appendChild(dlLink);
            dlLink.click();
            document.body.removeChild(dlLink);
        }



    }

};