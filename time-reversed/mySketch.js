let time_reversed = function(sketch) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
    [s.size_x, s.size_y] = utils.getSizeFromHash();

    s.fps = 30;
    s.capture = true;
    s.video_format = "png";
    s.loop = 3;

    class Hourglass {
        constructor() {
            this.width = s.size_x * 0.4;
            this.height = s.size_y * 0.6;
            this.neckWidth = this.width * 0.15;
            this.strokeWidth = 20;
            this.sandParticles = [];
            this.randomSeed = Date.now();
            s.randomSeed(this.randomSeed);
            this.fallingParticles = [];
            this.particleSpeed = this.height/2 / 30;
            
            this.sandProps = {
                topLevel: 1,
                bottomLevel: 0,
                direction: 1,  // 1 for down (no flow during rotation: topLevel=0)
                rotation: 0    // 0 to PI: 180° flip around center in second half
            };

            this.tween = p5.tween.manager.addTween(this.sandProps)
                .setSketch(s)
                .addMotionsSeconds([
                    { key: 'rotation', target: 0 }
                ], 0, 'linear')
                .addMotionsSeconds([
                    { key: 'topLevel', target: 0 },
                    { key: 'bottomLevel', target: 1 },
                    { key: 'direction', target: 1 }
                ], s.loop/2, 'easeInOutQuad')
                .addMotionsSeconds([
                    { key: 'rotation', target: s.PI }
                ], s.loop/2, 'easeInOutQuad')
                .startLoop();
        }

        getSandColor() {
            let hue = s.random(15, 30);
            let saturation = s.random(85, 95);
            let brightness = s.random(85, 95);
            return [hue, saturation, brightness];
        }

        updateFallingParticles() {
            let shouldGenerate;
            let startY;
            
            if (this.sandProps.direction > 0) {
                shouldGenerate = this.sandProps.topLevel > 0;
                startY = 0;
            } else {
                shouldGenerate = this.sandProps.bottomLevel > 0;
                startY = -this.height/2;
            }

            if (shouldGenerate && s.random() < 0.3) {
                let newParticle = {
                    x: s.random(-this.neckWidth/3, this.neckWidth/3),
                    y: startY,
                    size: s.random(8, 12),
                    color: this.getSandColor(),
                    rotation: s.random(0, s.TWO_PI)
                };
                this.fallingParticles.push(newParticle);
            }

            for (let i = this.fallingParticles.length - 1; i >= 0; i--) {
                let p = this.fallingParticles[i];
                p.y -= this.particleSpeed * (this.sandProps.direction > 0 ? 1 : -1);
                
                // Remove particles when they reach either boundary
                if (this.sandProps.direction > 0 && p.y <= -this.height/2 + this.strokeWidth/2) {
                    this.fallingParticles.splice(i, 1);
                } else if (this.sandProps.direction < 0 && p.y >= 0) {
                    this.fallingParticles.splice(i, 1);
                }
            }
        }

        drawFrame() {
            // One closed curve: top-left -> top-right -> neck right -> bottom-right -> bottom-left -> neck left -> (closed)
            let tl = [-this.width/2 - this.strokeWidth/2, -this.height/2 - this.strokeWidth/2];
            let tr = [this.width/2 + this.strokeWidth/2, -this.height/2 - this.strokeWidth/2];
            let nr = [this.neckWidth/2 + this.strokeWidth/2, 0];
            let br = [this.width/2 + this.strokeWidth/2, this.height/2 + this.strokeWidth/2];
            let bl = [-this.width/2 - this.strokeWidth/2, this.height/2 + this.strokeWidth/2];
            let nl = [-this.neckWidth/2 - this.strokeWidth/2, 0];

            // Black outline
            s.stroke(0, 0, 0);
            s.strokeWeight(this.strokeWidth + 4);
            s.noFill();
            s.beginShape();
            s.vertex(tl[0], tl[1]);
            s.vertex(tr[0], tr[1]);
            s.vertex(nr[0], nr[1]);
            s.vertex(br[0], br[1]);
            s.vertex(bl[0], bl[1]);
            s.vertex(nl[0], nl[1]);
            s.endShape(s.CLOSE);

            // Main frame
            s.stroke(200);
            s.strokeWeight(this.strokeWidth);
            s.noFill();
            s.beginShape();
            s.vertex(tl[0], tl[1]);
            s.vertex(tr[0], tr[1]);
            s.vertex(nr[0], nr[1]);
            s.vertex(br[0], br[1]);
            s.vertex(bl[0], bl[1]);
            s.vertex(nl[0], nl[1]);
            s.endShape(s.CLOSE);
        }

        drawFallingParticles() {
            s.push();
            s.noStroke();
            for (let particle of this.fallingParticles) {
                let [h, sat, b] = particle.color;
                s.fill(h, sat, b);
                s.rectMode(s.CENTER);
                s.push();
                s.translate(particle.x, particle.y);
                s.rotate(particle.rotation);
                s.rect(0, 0, particle.size, particle.size);
                s.pop();
            }
            s.pop();
        }

        draw() {
            s.push();
            s.translate(s.width/2, s.height/2 - s.size_y * 0.1);
            s.scale(0.9);
            s.rotate(this.sandProps.rotation);
            this.updateFallingParticles();
            this.drawFallingParticles();
            this.drawSandParticles();
            this.drawFrame();
            s.pop();
        }

        drawSandParticles() {
            s.push();
            s.noStroke();
            
            // Draw gradient in top half
            let topHeight = (this.height/2) * this.sandProps.topLevel;
            if (topHeight > 0) {
                // Create gradient for top trapezoid
                for (let y = -this.height/2; y < -this.height/2 + topHeight; y += 1) {
                    let progress = (y - (-this.height/2)) / (this.height/2);
                    let width = s.lerp(this.width, this.neckWidth, progress);
                    let hue = s.map(y, -this.height/2, -this.height/2 + topHeight, 15, 30);
                    
                    s.fill(hue, 90, 90);
                    s.beginShape();
                    s.vertex(-width/2, y);
                    s.vertex(width/2, y);
                    s.vertex(width/2, y + 1.4);
                    s.vertex(-width/2, y + 1.4);
                    s.endShape(s.CLOSE);
                }
            }
            
            // Draw gradient in bottom half
            let bottomHeight = (this.height/2) * this.sandProps.bottomLevel;
            if (bottomHeight > 0) {
                for (let y = 0; y < bottomHeight; y += 1) {
                    let progress = y / (this.height/2);
                    let width = s.lerp(this.neckWidth, this.width, progress);
                    let hue = s.map(y, 0, bottomHeight, 30, 15);
                    
                    s.fill(hue, 90, 90);
                    s.beginShape();
                    s.vertex(-width/2, y);
                    s.vertex(width/2, y);
                    s.vertex(width/2, y + 1.4);
                    s.vertex(-width/2, y + 1.4);
                    s.endShape(s.CLOSE);
                }
            }
            s.pop();
        }
    }

    let hourglass = new Hourglass();

    s.drawBg = function() { 
        // s.background(10); 
    }

    s.prepareNewSeeds = function() {
        hourglass = new Hourglass();
        p5.tween.manager.restartAll();
    }

    s.stepDynamics = function() {
        // Only update tweens if we're not at the very start of the animation
        if (s.animLoop.elapsedFrames !== 0) {
            p5.tween.manager.update(s.deltaTime);
        }
        
        // Move tween restart to frame 1 instead of frame 0
        if (s.animLoop.elapsedFrames === 1) {
            p5.tween.manager.restartAll();
        }
    }

    s.drawOnce = function() {
        s.drawBg();
        s.resetMatrix();
        hourglass.draw();
        
        // "ОЖИДАЙТЕ" text on semi-transparent rounded rectangle
        s.push();
        s.textFont('Times New Roman');
        s.textStyle(s.BOLD);
        s.textSize(s.size_y * 0.12);
        let txt = "ОЖИДАЙТЕ";
        let tw = s.textWidth(txt);
        let th = s.textAscent() + s.textDescent();
        let padX = tw * 0.1;
        let padY = th * 0.2;
        let boxW = tw + padX * 2;
        let boxH = th + padY * 2;
        let cx = s.width / 2;
        let cy = s.height - s.size_y * 0.12;
        let radius = s.min(boxW, boxH) * 0.25;

        // Semi-transparent grey rounded rectangle
        s.noStroke();
        s.fill(0, 0, 30, 85);
        s.rectMode(s.CENTER);
        s.rect(cx, cy - padY * 0.5, boxW, boxH, radius);

        // Text on top
        s.fill(200);
        s.textAlign(s.CENTER, s.CENTER);
        s.text(txt, cx, cy);
        s.pop();
    }

    s.setup = function() {
        s.createCanvas(s.size_x, s.size_y);
        s.colorMode(s.HSB, 360, 100, 100, 100);
        s.frameRate(s.fps);
        s.createLoop(s.loop);
        s.prepareNewSeeds();
    }

    s.drawFrame = function() {
        s.clear();
        s.stepDynamics();
        s.drawOnce();
    }

    utils.add_default_behaviors(this, s);
}
