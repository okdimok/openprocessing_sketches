function mirror(point, center) {
  return center.copy().add(center.copy().sub(point));
}

let object_background_t_shirt = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
        [s.size_x, s.size_y] = [400, 400];

        s.fps = 30;
        s.capture = false;
        s.video_format = "png";
        s.loop = 3;

    function better_bezier(a1, c1, c2, a2, colorStart, colorEnd, strokeWeight) {
      let steps = 100;  // Increased from 20 to 40 for more points
      s.noFill();
      for (let i = 0; i < steps; i++) {
        let t = i / (steps - 1);
        let x = s.bezierPoint(a1.x, c1.x, c2.x, a2.x, t);
        let y = s.bezierPoint(a1.y, c1.y, c2.y, a2.y, t);
        let color = s.lerpColor(colorStart, colorEnd, t);
        s.stroke(color);
        s.strokeWeight(strokeWeight);
        s.point(x, y);
      }
    }

        class Beziers {
                constructor(){
                        this.ymax = 10;
                        // Use current time to seed the random number generator
                        this.randomSeed = Date.now();
                }

                draw () {
                        s.push();
                        s.randomSeed(this.randomSeed);
                        s.noiseSeed(this.randomSeed);

                        s.scale(1);
                        var shift = -40;
                        // Reduce the number of lines to approximately 50
                        for (var line_n = 0; line_n < 50; line_n++) {
                          var xShift = shift + s.noise(line_n * 0.3) * 80;
                          
                          var c1 = new p5.Vector(
                            xShift + 180 * s.noise(line_n, 0),  // Increased influence of noise
                            s.noise(line_n) * 240  // Increased vertical range
                          );

                          // Generate random base color for this line (full spectrum)
                          let baseHue = s.random(360);  // Full 360-degree hue range
                          let baseSaturation = s.random(70, 100);
                          let baseBrightness = s.random(80, 100);

                          for (var i=0; i<20; i++) {  // Increased from 10 to 20 segments per line
                            var baseY = i * 20 - 40;  // Adjusted spacing between segments
                            var a1 = new p5.Vector(
                              xShift + s.noise(line_n, i*20) * 120,  // Increased horizontal range
                              baseY + s.noise(line_n, i*20, 100) * 120  // Increased vertical range
                            );
                            var a2 = new p5.Vector(
                              xShift + s.noise(line_n, i*20+20) * 120,  // Increased horizontal range
                              baseY + 20 + s.noise(line_n, i*20+20, 200) * 120  // Increased vertical range
                            );
                            var c2 = new p5.Vector(
                              xShift + 320 * s.noise(line_n/5, i*20),  // Increased influence of noise
                              baseY + 10 + s.noise(line_n/5, i*20, 300) * 180  // Increased vertical range
                            );

                            // Create more dramatic color variations
                            let hueShift = s.map(i, 0, 19, 0, 180);  // Larger hue shift range
                            let colorStart = s.color(
                              (baseHue + hueShift) % 360,  // Use full 360-degree range
                              baseSaturation + s.random(-5, 5),
                              baseBrightness + s.random(-5, 5)
                            );
                            let colorEnd = s.color(
                              (baseHue + hueShift + s.random(30, 60)) % 360,  // More dramatic color transitions
                              baseSaturation + s.random(-5, 5),
                              baseBrightness + s.random(-5, 5)
                            );

                            // Generate random stroke weight for each segment, uncorrelated with y
                            let strokeWeight = s.random(1.5, 8);  // Slightly reduced max stroke weight

                            better_bezier(a1, c1, c2, a2, colorStart, colorEnd, strokeWeight);
                            
                            // Adjust the mirroring to create more dramatic curves
                            c1 = mirror(c2, a2).add(s.createVector(s.random(-40, 40), s.random(-40, 40)));
                          }
                          shift += s.sqrt((s.sin(line_n / 3 * s.PI * 2) + 1.2)) * 40;
                        }

                        s.pop();
                }
        }
        var beziers = new Beziers();

        s.drawBg = function() { s.background(10); } // Even darker background for more contrast

        s.prepareNewSeeds = function(){
                beziers = new Beziers();
        }

        s.drawOnce = function(){
                s.drawBg();
                s.resetMatrix();
                beziers.draw();
        }

    s.setup = function() {
        s.createCanvas(s.size_x, s.size_y);
        s.noStroke();
        s.colorMode(s.HSB, 360, 100, 100);
        s.prepareNewSeeds();
        s.drawOnce();
        s.noLoop(); // Stop the draw loop after initial render
    }

        s.drawFrame = function() {
                // This function is no longer needed for static image
        }

        utils.add_default_behaviors(this, s);
}
