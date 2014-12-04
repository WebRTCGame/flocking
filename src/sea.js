/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global $:true, Vector:true, Fish:true, Food:true, Sim:true */

$(function() {
	// POPULATION SETUP
	//var POPULATION = 260;
	//var MIN_MASS = 0.1;
	//var MAX_MASS = 3.5;
	//var FOOD_RATIO = 0.2;
	//var SCREEN = 1.5;
	var fps = 30;
	var now;
	var then = Date.now();
	var fpsInterval = 1000 / fps;
	var delta;

	// canvas elements
	//var canvas = $("#canvas")[0];
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	var info = $("#info");

	// THE SEA
	var sea = {
		width: 0,
		height: 0,
		population: [],
		food: [],
		randomPoint: function() {
				return {
					x: Math.random() * this.width,
					y: Math.random() * this.height
				}
			} //,
			//canvas: ctx
	};

	// internal use
	//var time = null;
	//var interval = 20;
	//var steps = 0;

	// user-events listeners (clicks and keys)
	$(window).mouseup(function() {
		// toggle showBehaviour when clicking
		Fish.showBehavior = !Fish.showBehavior;
		$("body").removeClass("about");
		$("#footer").html("click anywhere to <b>" + (Fish.showBehavior ? "quit" : "enter") + "</b> behaviour inspector");
	});
	$("#about-button").click(function() {
		$("body").addClass("about");
		$("#footer").html("click anywhere to <b>go back</b>");
	});

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

	// populate the sea
	for (var i = 0; i < Sim.globals.POPULATION; i++) {
		// random setup
		var randomPoint = sea.randomPoint();
		//var randomX = Math.random() * sea.width;
		//var randomY = Math.random() * sea.height;
		var fourRandoms = (Math.random() * Math.random() * Math.random() * Math.random());
		var randomMass = Sim.globals.MIN_MASS + fourRandoms * Sim.globals.MAX_MASS;

		// create fish
		var fish = new Fish(randomMass, randomPoint.x, randomPoint.y);

		// add fish to the sea population
		sea.population.push(fish);
	}

	// add food to the sea
	var initialFood = Sim.globals.POPULATION * Sim.globals.FOOD_RATIO;
	for (var i = 0; i < initialFood; i++) {
		// initial values
		var randomPoint2 = sea.randomPoint();

		var foodAmmount = Math.random() * 100 + 20;

		// create food
		var food = new Food(randomPoint2.x, randomPoint2.y, foodAmmount);
		sea.food.push(food);
	}

	// one time-step of the timeline loop

	function updateFood() {
		for (var i in sea.food) {
			var food = sea.food[i];

			if (food && !food.dead) {
				food.draw(ctx);
				food.update(sea);
			}
			else {
				sea.food[i] = null;
				if (Math.random() < 0.001) {
					sea.food[i] = new Food(Math.random() * sea.width, Math.random() * sea.height, Math.random() * 100 + 20);
				}
			}
		}

	}

	function updateFish() {
		function isNotDead(element) {
  //var isDead = element === null || element.dead;
  return element !== null;
}
		//console.log(sea.population.length);
		sea.population = sea.population.filter(isNotDead);
//console.log(sea.population.length);
//console.log(sea.population[0].location);
		for (var i in sea.population){
		
			
			sea.population[i].swim(sea);
			sea.population[i].doUpdate(sea);
			sea.population[i].draw(ctx);
			if (sea.population[i].location.x < -50){sea.population[i].location.x = -30;}
			if (sea.population[i].location.x > sea.width + 50){sea.population[i].location.x = sea.width + 30;}
			if (sea.population[i].location.y < -50){sea.population[i].location.y = -30;}
			if (sea.population[i].location.y > sea.height + 50){sea.population[i].location.y = sea.height + 30;}
			if (sea.population[i].dead) {
				sea.population[i] = null
			};
			
		}

	}


	function Update() {
			window.requestAnimationFrame(Update, canvas);
			// print info
			now = Date.now();
			delta = now - then;
			if (delta > fpsInterval) {


				then = now - (delta % fpsInterval);



				info.html("Population: " + sea.population.length);

				// clear the screen (with a fade)
				//ctx.globalAlpha = 0.8;
				ctx.fillStyle = "#ffffff";
				ctx.fillRect(0, 0, sea.width, sea.height);
				//ctx.globalAlpha = 1;

				// update the food
				updateFood();
				updateFish();
			}
		}
		// kick it off!
		//setInterval(step, interval);
	Update();
});
