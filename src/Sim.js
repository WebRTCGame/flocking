/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global $:true, Vector:true, Fish:true, Food:true, Sim:true, sea:true */

document.addEventListener("DOMContentLoaded", function() {

    var fps = 30;
    var now;
    var then = Date.now();
    var fpsInterval = 1000 / fps;
    var delta;
    var canvas = document.getElementById("canvas");
    Sim.globals.ctx = canvas.getContext("2d");
    var infoSpan = document.getElementById("info");
    var oldPOP = 0;


    window.addEventListener("mouseup", function() {

        Fish.showBehavior = !Fish.showBehavior;
        // $("body").removeClass("about");

        document.getElementById("footer").innerHTML = "click anywhere to <b>" + (Fish.showBehavior ? "quit" : "enter") + "</b> behaviour inspector";
    });

    document.getElementById("about-button").addEventListener("click", function() {
        //$("body").addClass("about");
        //$("#footer").html("click anywhere to <b>go back</b>");
        document.getElementById("footer").innerHTML = "click anywhere to <b>go back</b>";
    });

    var resizeFunc = (function() {
        // resize sea
        sea.width = window.innerWidth;
        sea.height = window.innerHeight;

        // resize canvas element
        var e = document.getElementById("canvas");
        e.setAttribute("width", sea.width);
        e.setAttribute("height", sea.height);
    })();

    window.addEventListener("resize", resizeFunc, false);



    function RunSimulation() {
        window.requestAnimationFrame(RunSimulation, canvas);

        now = Date.now();
        delta = now - then;
        if (delta > fpsInterval) {


            then = now - (delta % fpsInterval);
            
            if (sea.population.length !== oldPOP) {
                infoSpan.innerHTML = "Population: " + sea.population.length;
                oldPOP = sea.population.length;
            }

            Sim.globals.ctx.fillStyle = "#ffffff";
            Sim.globals.ctx.fillRect(0, 0, sea.width, sea.height);
            sea.update();
        }
    }

    sea.init();
    RunSimulation();
});
