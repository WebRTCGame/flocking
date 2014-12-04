/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global $:true, Vector:true, Fish:true, Food:true, Sim:true, sea:true */

document.addEventListener("DOMContentLoaded", function() {

  	var fps = 30;
	var now;
	var then = Date.now();
	var fpsInterval = 1000 / fps;
	var delta;
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	var info = $("#info");


	// user-events listeners (clicks and keys)
	window.addEventListener("mouseup", function() {
		// toggle showBehaviour when clicking
		Fish.showBehavior = !Fish.showBehavior;
		$("body").removeClass("about");
		$("#footer").html("click anywhere to <b>" + (Fish.showBehavior ? "quit" : "enter") + "</b> behaviour inspector");
	});
	/*
	$(window).mouseup(function() {
		// toggle showBehaviour when clicking
		Fish.showBehavior = !Fish.showBehavior;
		$("body").removeClass("about");
		$("#footer").html("click anywhere to <b>" + (Fish.showBehavior ? "quit" : "enter") + "</b> behaviour inspector");
	});
	*/
	document.getElementById("about-button").addEventListener("click", function() {
		$("body").addClass("about");
		$("#footer").html("click anywhere to <b>go back</b>");
	});
	/*
	//object.addEventListener("click", myScript);
	$("#about-button").click(function() {
		$("body").addClass("about");
		$("#footer").html("click anywhere to <b>go back</b>");
	});
*/
	// resizing the dimesions of the sea when resising the screen
	$(window).resize(function() {
		// resize sea
		sea.width = window.innerWidth; //$(window).width() * SCREEN;
		sea.height = window.innerHeight; //$(window).height() * SCREEN;

		// resize canvas element
		var e = document.getElementById("canvas");
		e.setAttribute("width", sea.width);
		e.setAttribute("height", sea.height);
	}).resize();



	function Update() {
		window.requestAnimationFrame(Update, canvas);
		
		now = Date.now();
		delta = now - then;
		if (delta > fpsInterval) {


			then = now - (delta % fpsInterval);
			info.html("Population: " + sea.population.length);
			ctx.fillStyle = "#ffffff";
			ctx.fillRect(0, 0, sea.width, sea.height);
			sea.update(ctx);
		}
	}

sea.init();
	Update();
});

