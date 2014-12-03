/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global $:true, Vector:true, Fish:true, Food:true */

$(function() {
	// POPULATION SETUP
	var POPULATION = 260;
	var MIN_MASS = 0.5;
	var MAX_MASS = 3.5;
	var FOOD_RATIO = 0.2;
	var SCREEN = 1.5;
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
		canvas: ctx
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
		sea.width = window.innerWidth;//$(window).width() * SCREEN;
		sea.height = window.innerHeight;//$(window).height() * SCREEN;

		// resize canvas element
		var e = document.getElementById("canvas");
		e.setAttribute("width", sea.width);
		e.setAttribute("height", sea.height);
	}).resize();

	// populate the sea
	for (var i = 0; i < POPULATION; i++) {
		// random setup
		var randomX = Math.random() * sea.width;
		var randomY = Math.random() * sea.height;
		var fourRandoms = (Math.random() * Math.random() * Math.random() * Math.random());
		var randomMass = MIN_MASS + fourRandoms * MAX_MASS;

		// create fish
		var fish = new Fish(randomMass, randomX, randomY);

		// add fish to the sea population
		sea.population.push(fish);
	}

	// add food to the sea
	var initialFood = POPULATION * FOOD_RATIO;
	for (var i = 0; i < initialFood; i++) {
		// initial values
		var randomX2 = Math.random() * sea.width;
		var randomY2 = Math.random() * sea.height;
		var foodAmmount = Math.random() * 100 + 20;

		// create food
		var food = new Food(randomX2, randomY2, foodAmmount);
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

		// list of fish that died during this time-step
		var deadList = [];

		// update all the fishes
		for (var i in sea.population) {
			// current fish
			var fish = sea.population[i];

			// if the fish is dead or null, skip it
			if (fish === null) {
				deadList.push(i);
				continue;
			}

			/*-- makes the fish compute an action (which direction to swim)
			according to the information it can get from the environment --*/
			//fish.swim(sea);
			fish.swim(sea);
			// update the fish (position and state)
			fish.doUpdate(sea);


			// draw the fish
			//if (fish.location.x > 0 && fish.location.x < window.innerWidth) {
				//if (fish.location.y > 0 && fish.location.y < window.innerHeight) {
					fish.doRender(ctx);
				//}

			//}





			// if dead, add the fish to the dead list
			if (fish.dead) {
				sea.population[i] = null;
				deadList.push(i);
			}
		}

		// clean all the dead fishes from the sea population
		for (var j in deadList) {
			sea.population.splice(deadList[j], 1);
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
