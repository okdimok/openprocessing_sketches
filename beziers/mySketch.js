function mirror(point, center) {
  return center.copy().add(center.copy().sub(point));
}

let object_background_t_shirt = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
        [s.size_x, s.size_y] = [400, 400];

        s.fps = 1;
        s.capture = false;
        s.video_format = "png";
        s.loop = 3;

    function better_bezier(a1, c1, c2, a2) {
      s.bezier(a1.x, a1.y, c1.x, c1.y, c2.x, c2.y, a2.x, a2.y);
    }

        class Beziers {
                constructor(){
                        this.ymax = 10
                }


                draw () {
                        s.push()

                        s.scale(1);
                        s.noFill();
                        s.stroke(0);
                        s.strokeWeight(1);
                        var shift = 0;
                        for (var line_n=0; line_n<400; line_n++) {
                          var c1 = new p5.Vector(shift+15, s.noise(line_n)*10);
                          for (var i=0; i<20; i++) {
                            var a1 = new p5.Vector(shift, i*20);
                            var a2 = new p5.Vector(shift, i*20+20);
                            var c2 = new p5.Vector(shift+35*s.noise(line_n/5, i*20), i*20+5*s.noise(line_n/5, i*20, 300));
                            better_bezier(a1, c1, c2, a2);
                            c1 = mirror(c2, a2);
                          }
                          shift += s.sqrt((s.sin(line_n / 20 * 2 * s.PI * 2) + 1.2)) * 5;
                          console.log(shift)
                        }
                        // s.stroke("red");
                        // s.point(c1)
                        // s.point(c2)
                        // s.point(c3)
                        // s.point(mirror(c2, a2))
                        // s.stroke("blue");
                        // s.point(a1)
                        // s.point(a2)
                        // s.point(a3)

                        s.pop()
                }

        }
        var beziers = new Beziers();

        s.drawBg = function() { s.background("white"); }

        s.prepareNewSeeds = function(){
                beziers = new Beziers();
        }


        s.drawOnce = function(){
                s.drawBg()
                s.resetMatrix()
                // s.translate(100, 100)
                beziers.draw();
                s.noLoop()
        }

    s.setup = function() {
        s.createCanvas(s.size_x, s.size_y);
        s.noStroke();
                // s.frameRate(s.fps);
                // s.createLoop(s.loop);
                s.prepareNewSeeds();

    }

        s.drawFrame = function() {
                s.clear()
                s.drawOnce();
        }

        utils.add_default_behaviors(this, s);

}
