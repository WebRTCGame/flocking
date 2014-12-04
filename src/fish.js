/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global $:true, Vector:true, Fish:true, Food:true, utils:true, BaseRenderable:true, Behaviors: true, Sim:true */


// Fish constructor
function Fish(mass, x, y, hue) {
	this.mass = mass > 0 ? mass : -mass;
	this.hue = hue || Math.random() < 0.5 ? Math.random() * 0.5 : 1 - Math.random() * 0.5;
	this.color = utils.rgb2hex(utils.hsv2rgb(this.hue, 1, 1));
	BaseRenderable.call(this, x, y);
}
Fish.prototype = Object.create(BaseRenderable.prototype);

Fish.prototype.init = function() {

	this._energy = this.mass * Sim.globals.ENERGY;
	Object.defineProperty(this, 'energy', {
		get: function() {
			return this._energy;
		},
		set: function(newValue) {
			if (newValue < 0) {
				this.color = "black";
				this.dead = true;
			}
			this._energy = newValue;
		},
		enumerable: true,
		configurable: true
	});

	this.maxspeed = Sim.globals.MAX_SPEED * this.mass;
	this.maxforce = Sim.globals.MAX_FORCE / (this.mass * this.mass);
	this.separationRange = this.mass * Sim.globals.SEPARATION_RANGE;
	this.lookRange = this.mass * Sim.globals.LOOK_RANGE;
	this.smellRange = this.mass * Sim.globals.SMELL_RANGE;
	this.length = this.mass * Sim.globals.LENGTH;
	this.base = this.length * 0.5;
	
	this.velocity = new Vector(0, 0);
	this.acceleration = new Vector(0, 0);
	this.wandering = new Vector(0.2, 0.2);
	this.skin = this.color;
	this.age = 1;
	this.fertility = (this.mass) * Sim.globals.FERTILITY + 1;
	this.mature = false;
	this.bite = this.mass * Sim.globals.BITE;
};
// fish's methods

Fish.prototype.isHungry = function() {
	var maxEnergy = this.mass * Sim.globals.ENERGY;

	return maxEnergy * 0.8 > this.energy;
};
// computes all the information from the enviroment and decides in which direction swim
Fish.prototype.swim = function (sea) {

	// nearby food
	var nearbyFood = this.look(sea.food, this.smellRange, Sim.globals.TWO_PI);

	// eat food
	for (var index in nearbyFood) {
		var food = nearbyFood[index];
		if (food && !food.dead) {
			// go to the food
			Behaviors.follow(this, food.location, food.radius / 10);

			// if close enough...
			if (this.location.dist(food.location) < food.radius) {
				// eat the food
				food.eatenBy(this);
			}
		}
	}

	//Starving
	//if (this.energy < (this.mass * Sim.globals.ENERGY * 0.1)){return;}

	// surrounding fishes
	var neighboors = this.look(sea.population, this.lookRange, Sim.globals.TWO_PI);


	var friends = [];
	var bigger = [];
	var smaller = [];
	var mature = [];
	for (var i = 0; i < neighboors.length; i++) {
		var other = neighboors[i];
		if (other !== this) {
			if (other.mass < this.mass / 2) {
				smaller.push(other);
			}
			else if (other.mass > this.mass * 2) {
				bigger.push(other);
			}
			else {
				friends.push(other);
			}
		}
		if (this.mature) {
			if (other.mature) {
				mature.push(other);
			}
		}

	}

	if (friends.length) {
		this.shoalList = friends;
		if (this.showBehavior) {
			this.color = 'black';
		}
		Behaviors.shoal(this);

	}
	else {
		//this.wander(200);
		Behaviors.wander(this);
	}


	if (bigger.length) {
		this.avoidList = bigger;
		//this.avoid(bigger, 300);
		Behaviors.avoid(this, 300);
	}


	if (smaller.length) {
		this.eatList = smaller;
		if (this.isHungry()) {
			this.eat();
		}
	}

	if (mature.length) {
		this.mateList = mature;
		this.mate(sea.population);
	}

	this.boundaries(sea);
};



// makes the fish chase another group of fishes, and eat them when reaching
Fish.prototype.eat = function eat() {


	var that = this;

	Behaviors.chase(this, this.eatList, function(fish) {
		that.energy += fish.energy;
		if (that.energy > that.mass * Sim.globals.ENERGY) {
			that.energy = that.mass * Sim.globals.ENERGY;
		}
		fish.energy = 0;
	});

	if (Fish.showBehavior) {
		this.color = "red";
	}
};


Fish.prototype.mate = function mate(seaPopulation) {
	//this.mateList = fishList;

	var that = this;

	Behaviors.chase(this, this.mateList, function(fish) {
		that.energy *= 0.5;
		fish.energy *= 0.5;
		// set both fishes unable to mate till reaching next fertility threashold
		that.fertility += that.mass;
		that.mature = false;

		fish.fertility += fish.mass;
		fish.mature = false;

		// DNA of the offspring
		var location = that.location.copy().lerp(fish.location, 0.5);
		var mass = (that.mass + fish.mass) / 2;
		var color = utils.interpolateColor(that.hue, fish.hue);

		// mutation
		var mutationRate = 0.01;
		mass += Math.random() < mutationRate ? Math.random() * 2 - 1 : 0;
		color = Math.random() < mutationRate ? Math.random() : color;

		// create offspring
		var offspring = new Fish(mass, location.x, location.y, color);

		// add to sea population
		seaPopulation.push(offspring);

		seaPopulation.push(offspring);
	}, 400);

	if (Fish.showBehavior) {
		this.color = "pink";
	}
};

Fish.prototype.boundaries = function boundaries(sea) {
	if (this.location.x < 50) {
		this.acceleration.add(new Vector(this.maxforce * 3, 0));
	}

	if (this.location.x > sea.width - 50) {
		this.acceleration.add(new Vector(-this.maxforce * 3, 0));
	}

	if (this.location.y < 50) {
		this.acceleration.add(new Vector(0, this.maxforce * 3));
	}

	if (this.location.y > sea.height - 50) {
		this.acceleration.add(new Vector(0, -this.maxforce * 3));
	}
};

Fish.prototype.look = function(fishList, radius, angle) {
	var neighboors = [];
	for (var i = 0; i < fishList.length; i++) {
		if (fishList[i] !== null && fishList[i] !== this) {
			var diff = this.location.copy().sub(fishList[i].location);

			var d = this.location.dist(fishList[i].location);


			if (d < radius) {
				var a = this.velocity.angleBetween(diff);
				if (a < angle / 2 || a > Sim.globals.TWO_PI - angle / 2) {
					neighboors.push(fishList[i]);
				}
			}
		}
	}

	return neighboors;
};


Fish.prototype.draw = Fish.prototype.render = function (ctx) {

	// get the points to draw the fish
	var angle = this.velocity.angle();

	var x1 = this.location.x + Math.cos(angle) * this.base;
	var y1 = this.location.y + Math.sin(angle) * this.base;

	var x = this.location.x - Math.cos(angle) * this.length;
	var y = this.location.y - Math.sin(angle) * this.length;

	var x2 = this.location.x + Math.cos(angle + Sim.globals.HALF_PI) * this.base;
	var y2 = this.location.y + Math.sin(angle + Sim.globals.HALF_PI) * this.base;

	var x3 = this.location.x + Math.cos(angle - Sim.globals.HALF_PI) * this.base;
	var y3 = this.location.y + Math.sin(angle - Sim.globals.HALF_PI) * this.base;

	// draw the behaviour of the fish (lines)
	this.drawBehavior(ctx);
	/*
		if (this.energy < 0) {
			this.color = "black";
		}
	*/
	if (Fish.showBehavior && this.mature) {
		this.color = "pink";
	}

	// draw the fish on the canvas
	ctx.lineWidth = this.energy / 3;
	ctx.fillStyle = this.color;
	//ctx.strokeStyle = this.color;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x3, y3);
	ctx.lineTo(x, y);
	ctx.lineTo(x2, y2);


	ctx.closePath();
	//ctx.quadraticCurveTo(x2, y2, x, y);
	//ctx.quadraticCurveTo(x3, y3, x1, y1);
	//ctx.stroke();
	ctx.fill();
	ctx.stroke();
};

Fish.prototype.drawBehavior = function drawBehavior(ctx) {
	if (Fish.showBehavior) {
		var old = ctx.globalAlpha;
		ctx.globalAlpha = 0.2;

		// draw avoid behaviour
		if (this.avoidList && this.avoidList.length) {
			ctx.strokeStyle = "blue";
			ctx.lineWidth = 4;
			ctx.beginPath();
			for (var i in this.avoidList) {
				ctx.moveTo(this.location.x, this.location.y);
				ctx.lineTo(this.avoidList[i].location.x, this.avoidList[i].location.y);
			}
			ctx.stroke();
		}

		// draw chase behaviour
		if (this.eatList && this.eatList.length) {
			ctx.strokeStyle = "red";
			ctx.lineWidth = 4;
			ctx.beginPath();
			for (var i in this.eatList) {
				ctx.moveTo(this.location.x, this.location.y);
				ctx.lineTo(this.eatList[i].location.x, this.eatList[i].location.y);
			}
			ctx.stroke();
		}

		// draw shoal behaviour
		if (this.shoalList && this.shoalList.length) {
			ctx.lineWidth = 1;
			ctx.strokeStyle = "black";
			ctx.beginPath();
			for (var i in this.shoalList) {
				ctx.moveTo(this.location.x, this.location.y);
				ctx.lineTo(this.shoalList[i].location.x, this.shoalList[i].location.y);
			}
			ctx.stroke();
		}

		// draw mate behaviour
		if (this.mateList && this.mateList.length) {
			ctx.lineWidth = 1;
			ctx.strokeStyle = "pink";
			ctx.beginPath();
			for (var i in this.mateList) {
				ctx.moveTo(this.location.x, this.location.y);
				ctx.lineTo(this.mateList[i].location.x, this.mateList[i].location.y);
			}
			ctx.stroke();
		}

		// clear the lists
		this.avoidList = null;
		this.eatList = null;
		this.shoalList = null;
		this.mateList = null;

		// restore alpha
		ctx.globalAlpha = old;
	}
	else {
		this.color = this.skin;
	}
};

Fish.prototype.update = function update(sea) {
	// move the fish
	//this.swim(sea);
	this.velocity.add(this.acceleration);
	this.velocity.limit(this.maxspeed);
	if (this.velocity.mag() < 3) {
		this.velocity.setMag(5);
	}

	this.location.add(this.velocity);
	this.acceleration.limit(this.maxforce);

	// spend energy
	this.energy -= (((this.acceleration.mag() * this.mass) * this.age * this.velocity.mag()) / 100) * 2;

	// die
	/*
	if (this.energy < 0) {
		this.dead = true;
	}
*/
	// grow older
	this.age *= 1.00005;
	this.mature = this.age > this.fertility;

	// reset acceleration
	this.acceleration.mul(0);
};

Fish.showBehavior = false;

Fish.random = Math.random();