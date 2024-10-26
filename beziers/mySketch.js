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

    function better_bezier(a1, c1, c2, a2, colorStart, colorEnd) {
      let steps = 20;
      s.noFill();
      for (let i = 0; i < steps; i++) {
        let t = i / (steps - 1);
        let x = s.bezierPoint(a1.x, c1.x, c2.x, a2.x, t);
        let y = s.bezierPoint(a1.y, c1.y, c2.y, a2.y, t);
        let color = s.lerpColor(colorStart, colorEnd, t);
        s.stroke(color);
        s.point(x, y);
      }
    }

        class Beziers {
                constructor(){
                        this.ymax = 10;
                        this.randomSeed = s.random(10000);
                }

                draw () {
                        s.push();
                        s.randomSeed(this.randomSeed);

                        s.scale(1);
                        s.strokeWeight(2);
                        var shift = 0;
                        for (var line_n=0; line_n<400; line_n++) {
                          // Combine shift with sine wave and noise
                          var xShift = shift + s.sin(line_n / 20) * 20 + s.noise(line_n * 0.1) * 10;
                          
                          var c1 = new p5.Vector(
                            xShift + 15 * s.noise(line_n, 0),
                            s.noise(line_n) * 20
                          );

                          // Generate random base color for this line
                          let baseHue = s.random(360);
                          let baseSaturation = s.random(70, 100);
                          let baseBrightness = s.random(80, 100); // Increased brightness range

                          for (var i=0; i<20; i++) {
                            var baseY = i * 20;
                            var a1 = new p5.Vector(
                              xShift + s.noise(line_n, i*20) * 10,
                              baseY + s.noise(line_n, i*20, 100) * 10
                            );
                            var a2 = new p5.Vector(
                              xShift + s.noise(line_n, i*20+20) * 10,
                              baseY + 20 + s.noise(line_n, i*20+20, 200) * 10
                            );
                            var c2 = new p5.Vector(
                              xShift + 35 * s.noise(line_n/5, i*20),
                              baseY + 10 + s.noise(line_n/5, i*20, 300) * 15
                            );

                            // Create more dramatic hue changes within the line
                            let hueShift = s.map(i, 0, 19, 0, 180); // Shift up to 180 degrees over the line
                            let colorStart = s.color(
                                (baseHue + hueShift) % 360,
                                baseSaturation + s.random(-5, 5),
                                baseBrightness + s.random(-5, 5)
                            );
                            let colorEnd = s.color(
                                (baseHue + hueShift + s.random(30, 60)) % 360,
                                baseSaturation + s.random(-5, 5),
                                baseBrightness + s.random(-5, 5)
                            );

                            better_bezier(a1, c1, c2, a2, colorStart, colorEnd);
                            c1 = mirror(c2, a2);
                          }
                          // Keep the original shift update
                          shift += s.sqrt((s.sin(line_n / 20 * 2 * s.PI * 2) + 1.2)) * 5;
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
