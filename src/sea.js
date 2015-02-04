/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global Fish:true, Food:true, Sim:true ,  sea:true*/


sea.randomPoint = function() {
	return {
		x: Math.random() * this.width,
		y: Math.random() * this.height
	};
};

sea.populateFish = function() {
	
	for (var i = 0; i < Sim.globals.POPULATION; i++) {

		var randomPoint = this.randomPoint();

	//	var fourRandoms = (Math.random() * Math.random() * Math.random() * Math.random());
		var randomMass = window.utils.randomBetween(Sim.globals.MIN_MASS,Sim.globals.MAX_MASS/2);//Sim.globals.MIN_MASS + fourRandoms * Sim.globals.MAX_MASS;


		var fish = new Fish(randomMass, randomPoint.x, randomPoint.y);


		this.population.push(fish);
	}
};

sea.populateFood = function() {
	
	for (var i = 0; i < Sim.globals.initialFood; i++) {
		
		var randomPoint2 = this.randomPoint();

		var foodAmmount = Math.random() * 100 + 20;

		var food = new Food(randomPoint2.x, randomPoint2.y, foodAmmount);

		this.food.push(food);

	}

};
sea.updateFood = function() {

	for (var i = 0; i < this.food.length; i++) {
		var food = this.food[i];

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
	function isNotDead(element) {
		//var isDead = element === null || element.dead;
		return element !== null;
	}

	this.population = this.population.filter(isNotDead);
	for (var i = 0; i < this.population.length; i++) {
		this.population[i].swim(this);
		this.population[i].doUpdate(this);
		this.population[i].doRender();
		if (this.population[i].dead) {
			this.population[i] = null;
		}
	}

};
sea.init = function() {
	
	this.width = Sim.renderer.canvas.width;
	this.height = Sim.renderer.canvas.height;
	this.populateFish();
	this.populateFood();
};
sea.update = function() {
	
	this.updateFood();
	this.updateFish();
};
