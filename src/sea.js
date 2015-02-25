/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global Fish:true, Food:true, Sim:true ,  sea:true*/


sea.randomPoint = function() {
	'use strict';
	return {
		x: Math.random() * this.width,
		y: Math.random() * this.height
	};
};

sea.populateFish = function() {
'use strict';
	for (var i = 0; i < Sim.globals.POPULATION; i++) {

		var randomPoint = this.randomPoint();

		//	var fourRandoms = (Math.random() * Math.random() * Math.random() * Math.random());
		var randomMass = window.utils.randomBetween(Sim.globals.MIN_MASS, Sim.globals.MAX_MASS / 2); //Sim.globals.MIN_MASS + fourRandoms * Sim.globals.MAX_MASS;


		var fish = new Fish(randomMass, randomPoint.x, randomPoint.y);


		this.population.push(fish);
	}
};

sea.populateFood = function() {
'use strict';
const initFood = Sim.globals.initialFood();
	for (let i = 0; i < initFood; i++) {

		const randomPoint2 = this.randomPoint();

		const foodAmmount = Math.random() * 100 + 20;

		var food = new Food(randomPoint2.x, randomPoint2.y, foodAmmount);

		this.food.push(food);

	}

};

sea.updateFood = function() {
'use strict';
	for (let i = 0; i < this.food.length; i++) {
		let food = this.food[i];

		if (food && !food.dead && food !== null) {


			food.doUpdate(sea);
			food.doRender();


		}
		else {
			this.food[i] = null;
			if (Math.random() < 0.001) {
				this.food[i] = new Food(Math.random() * this.width, Math.random() * this.height, Math.random() * 100 + 20);
			}
		}
	}


};

sea.updateFish = function() {
	'use strict';
	function isNotDead(element) {
		//var isDead = element === null || element.dead;
		return element !== null;
	}

	//this.population = this.population.filter(isNotDead);
	
	for (let i = 0; i < this.population.length; i++) {
		if (this.population[i] !== null) {
			this.population[i].popIndex = i;
			this.population[i].swim(this);
			this.population[i].doUpdate(this);
			this.population[i].doRender();
			if (this.population[i].dead) {
				this.population[i] = null;
			}
		}
	}

};
sea.init = function() {
'use strict';
	this.width = Sim.renderer.canvas.width;
	this.height = Sim.renderer.canvas.height;
	this.populateFish();
	this.populateFood();
};
sea.update = function() {
'use strict';
	this.updateFood();
	this.updateFish();
};
