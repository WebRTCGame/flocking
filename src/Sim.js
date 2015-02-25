/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global $:true, Sim:true, sea:true, THREE:true */


document.addEventListener("DOMContentLoaded", function() {
    'use strict';
    Sim.renderer.init(document.getElementById("canvas"), 1600, 1600);

    sea.init();

    Sim.renderer.process = function process() {
        'use strict';
        window.requestAnimationFrame(Sim.renderer.process, Sim.renderer.canvas);


        Sim.renderer.now = Date.now();
        Sim.renderer.delta = Sim.renderer.now - Sim.renderer.then;

        if (Sim.renderer.delta > Sim.renderer.fpsInterval) {
            Sim.renderer.ctx.clearRect(0, 0, sea.width, sea.height);
            sea.update();

            Sim.renderer.then = Sim.renderer.now - (Sim.renderer.delta % Sim.renderer.fpsInterval);


        }

    };

    Sim.renderer.process();

});
