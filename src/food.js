/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global Vector:true, Food:true, Sim:true, Boid:true, sea:true */

var Food = function Food(x, y, amount) {

	Boid.call(this, x, y);
	console.log("food created");
	this.velocity = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
	this.population = amount;
	this.food = [];
	this.seekTarget = new Vector(x, y);
	this.dead = false;
	for (var i = 0; i < this.population; i++) {
		var rX = window.utils.randomBetween(this.location.x - 30, this.location.x + 30);
		var rY = window.utils.randomBetween(this.location.y - 30, this.location.y + 30);
		this.food.push(new FoodBit(rX, rY));
	}

};
Food.prototype = Object.create(Boid.prototype);

Food.prototype.render = function render() {
	Sim.renderer.ctx.beginPath();
	Sim.renderer.ctx.arc(this.location.x, this.location.y, (this.food.length + 1) / 4, 0, 2 * Math.PI, false);
	Sim.renderer.ctx.fillStyle = 'rgba(0,0,255,0.25)';
	Sim.renderer.ctx.fill();
	for (var i = 0; i < this.food.length; i++) {
		this.food[i].doRender();
	}
};
Food.prototype.preUpdate = function preUpdate() {
	var loc = this.location.clone();
	for (var i = 0; i < this.food.length; i++) {
		var seekval = Behaviors.seek(this.food[i], loc);
		this.food[i].acceleration.add(seekval);
	}

};

Food.prototype.postUpdate = function postUpdate(world) {
	for (var i = 0; i < this.food.length; i++) {
		this.food[i].doUpdate();
	}
	if (this.location.x < -5) {
		this.location.x = sea.width - 5;
	}
	if (this.location.x > sea.width + 5) {
		this.location.x = 5;
	}
	if (this.location.y < -5) {
		this.location.y = sea.height - 5;
	}
	if (this.location.y > sea.height + 5) {
		this.location.y = 5;
	}

};

Food.prototype.eatenBy = function eatenBy(fish) {

	this.food.pop();

	if (fish.energy < fish.mass * Sim.globals.ENERGY) {

		fish.energy += (fish.bite * 0.5);

	}
	else {


		fish.energy += (fish.bite * 0.05);
		fish.mass += 0.001;
	}
	if (this.food.length <= 0) {
		this.dead = true;
	}
};


var FoodBit = function FoodBit(x, y) {
	Boid.call(this, x, y);
};
FoodBit.prototype = Object.create(Boid.prototype);

FoodBit.prototype.render = function() {

	Sim.renderer.ctx.beginPath();
	Sim.renderer.ctx.arc(this.location.x, this.location.y, 5, 0, 2 * Math.PI, false);
	Sim.renderer.ctx.fillStyle = 'rgba(0,255,0,0.25)';
	Sim.renderer.ctx.fill();

};

