/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global $:true, Vector:true, Fish:true, Food:true, utils:true, BaseRenderable:true, Behaviors: true */

/* MASS MULTIPLIERS - these values represent the 
relationship between the fish's properties and its mass */

var Globals = (function() {
	return {
		ENERGY: 10,
		MAX_SPEED: 8,
		MAX_FORCE: 0.1,
		SEPARATION_RANGE: 30,
		LOOK_RANGE: 100,
		SMELL_RANGE: 300,
		LENGTH: 20,
		FERTILITY: 0.1,
		BITE: 0.1
	};
})();


var ENERGY = 10,
	MAX_SPEED = 8,
	MAX_FORCE = 0.1,
	SEPARATION_RANGE = 30,
	LOOK_RANGE = 100,
	SMELL_RANGE = 300,
	LENGTH = 20,
	FERTILITY = 0.1,
	BITE = 0.1;


// Fish constructor
function Fish(mass, x, y, hue) {
		BaseRenderable.call(this, x, y);
		// fish's properties
		this.ID = Fish.uid();
		this.mass = mass > 0 ? mass : -mass;
		//this.energy = this.mass * ENERGY;
		
		this._energy = this.mass * ENERGY;
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

		this.maxspeed = MAX_SPEED * this.mass;
		this.maxforce = MAX_FORCE / (this.mass * this.mass);
		this.separationRange = this.mass * SEPARATION_RANGE;
		this.lookRange = this.mass * LOOK_RANGE;
		this.smellRange = this.mass * SMELL_RANGE;
		this.length = mass * LENGTH;
		this.base = this.length * 0.5;
		//this.location = new Vector(x, y);
		this.velocity = new Vector(0, 0);
		this.acceleration = new Vector(0, 0);
		this.wandering = new Vector(0.2, 0.2);

		/*-- the hue is used for color generation and mating --*/
		this.hue = hue || Math.random() < 0.5 ? Math.random() * 0.5 : 1 - Math.random() * 0.5;

		this.color = utils.rgb2hex(utils.hsv2rgb(this.hue, 1, 1));
		this.skin = this.color;
		this.dead = false;
		this.age = 1;
		this.fertility = (this.mass) * FERTILITY + 1;
		this.mature = false;
		this.bite = this.mass * BITE;

		// helper
		this.HALF_PI = Math.PI * 0.5;

	}
	(function() {
		var id = 0;
		Fish.uid = function() {
			return id++;
		};
	})();
Fish.prototype = Object.create(BaseRenderable.prototype);

// fish's methods

Fish.prototype.isHungry = function() {
	var maxEnergy = this.mass * ENERGY;

	return maxEnergy * 0.8 > this.energy;
};
// computes all the information from the enviroment and decides in which direction swim
Fish.prototype.swim = function swim(sea) {


	// nearby food
	var nearbyFood = this.look(sea.food, this.smellRange, Math.PI * 2);

	// eat food
	for (var index in nearbyFood) {
		var food = nearbyFood[index];
		if (food && !food.dead) {
			// go to the food
			this.follow(food.location, food.radius / 10);

			// if close enough...
			if (this.location.dist(food.location) < food.radius) {
				// eat the food
				food.eatenBy(this);
			}
		}
	}


	// surrounding fishes
	var neighboors = this.look(sea.population, this.lookRange, Math.PI * 2);


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
		this.shoal();
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
		if (this.isHungry()) {
			this.eat(smaller);
		}
	}

	if (mature.length) {
		this.mate(mature, sea.population);
	}

	this.boundaries(sea);
};
/*
// makes the fish avoid a group of fishes
Fish.prototype.avoid = function avoid(fishList, dist) {
	this.avoidList = fishList;

	for (var i in fishList) {
		var d = this.location.dist(fishList[i].location);
		if (d < dist) {
			var avoid = fishList[i].location.copy().sub(this.location).mul(-100);
			this.applyForce(avoid);
		}
	}

	if (Fish.showBehavior) {
		this.color = "blue";
	}
};
*/


// makes the fish chase another group of fishes, and eat them when reaching
Fish.prototype.eat = function eat(fishList) {
	this.eatList = fishList;

	var that = this;

	this.chase(fishList, function(fish) {
		that.energy += fish.energy;
		if (that.energy > that.mass * ENERGY){
			that.energy = that.mass * ENERGY;
		}
		fish.energy = 0;
	});

	if (Fish.showBehavior) {
		this.color = "red";
	}
};


// emulates the shoal behaviour
Fish.prototype.shoal = function shoal() {
	//this.shoalList = fishList;

	// compute vectors
	var separation = Behaviors.separate(this, this.shoalList, this.separationRange).limit(this.maxforce); //this.separate(fishList, this.separationRange).limit(this.maxforce);
	var alignment = Behaviors.align(this, this.shoalList).limit(this.maxforce); //this.align(fishList).limit(this.maxforce);
	var cohesion = Behaviors.cohesion(this, this.shoalList).limit(this.maxforce); //this.cohesion(fishList).limit(this.maxforce);
	var affinity = Behaviors.affinity(this, this.shoalList); //this.affinity(this.shoalList);

	/*-- shoal with fishes of very different colors won't stay
	together as tightly as shoals of fishes of the same color --*/
	separation.mul(1.2);
	alignment.mul(1.2 * affinity);
	cohesion.mul(1 * affinity);

	// apply forces
	this.applyForce(separation);
	this.applyForce(alignment);
	this.applyForce(cohesion);

	if (Fish.showBehavior) {
		this.color = "black";
	}
};

Fish.prototype.mate = function mate(fishList, seaPopulation) {
	this.mateList = fishList;

	var that = this;

	this.chase(fishList, function(fish) {
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
		this.applyForce(new Vector(this.maxforce * 3, 0));
	}

	if (this.location.x > sea.width - 50) {
		this.applyForce(new Vector(-this.maxforce * 3, 0));
	}

	if (this.location.y < 50) {
		this.applyForce(new Vector(0, this.maxforce * 3));
	}

	if (this.location.y > sea.height - 50) {
		this.applyForce(new Vector(0, -this.maxforce * 3));
	}
};

Fish.prototype.look = function look(fishList, radius, angle) {
	var neighboors = [];
	for (var i = 0; i < fishList.length; i++) {
		if (fishList[i] !== null && fishList[i] !== this) {
			var diff = this.location.copy().sub(fishList[i].location);

			var d = this.location.dist(fishList[i].location);


			if (d < radius) {
				var a = this.velocity.angleBetween(diff);
				if (a < angle / 2 || a > Math.PI * 2 - angle / 2) {
					neighboors.push(fishList[i]);
				}
			}
		}
	}

	return neighboors;
};
/*
Fish.prototype.wander = function wander() {
	if (Math.random() < 0.05) {
		this.wandering.rotate(Math.PI * 2 * Math.random());
	}
	this.velocity.add(this.wandering);

	if (Fish.showBehavior) {
		this.color = "gray";
	}
};
*/


Fish.prototype.follow = function follow(target, arrive) {
	var dest = target.copy().sub(this.location);
	var d = dest.dist(this.location);

	if (d < arrive) {
		dest.setMag(d / arrive * this.maxspeed);
	}
	else {
		dest.setMag(this.maxspeed);
	}

	this.applyForce(dest.limit(this.maxforce * 2));
};

Fish.prototype.chase = function chase(fishList, action, force) {
	if (fishList.length === 0) {
		return;
	}

	for (var i in fishList) {
		//this.applyForce(fishList[i].attract(this, force || 50));
		this.applyForce(Behaviors.attract(fishList[i], this, force || 50));
		if (this.location.dist(fishList[i].location) < (this.length + fishList[i].length) / 2) {
			action(fishList[i]);
		} // <- execute action when reaching a fish
	}
};
/*
Fish.prototype.seek = function seek(target) {
	var seek = target.copy().sub(this.location);
	seek.normalize();
	seek.mul(this.maxspeed);
	seek.sub(this.velocity).limit(this.maxforce);

	return seek;
};
*/
/*
Fish.prototype.attract = function attract(body, attractionForce) {
	var force = this.location.copy().sub(body.location);
	var distance = force.mag();
	distance = distance < 5 ? 5 : distance > 25 ? 25 : distance;
	force.normalize();

	var strength = (attractionForce * this.mass * body.mass) / (distance * distance);
	force.mul(strength);
	return force;
};
*/
/*
Fish.prototype.separate = function separate(neighboors, range) {
	var sum = new Vector(0, 0);

	if (neighboors.length) {
		for (var i in neighboors) {
			var d = this.location.dist(neighboors[i].location);
			if (d < range) {
				var diff = this.location.copy().sub(neighboors[i].location);
				diff.normalize();
				diff.div(d);
				sum.add(diff);
			}
		}
		sum.div(neighboors.length);
		sum.normalize();
		sum.mul(this.maxspeed);
		sum.sub(this.velocity);
		sum.limit(this.maxforce);
	}

	return sum;
};
*/
/*
Fish.prototype.align = function align(neighboors) {
	var sum = new Vector(0, 0);

	if (neighboors.length) {
		for (var i in neighboors) {
			sum.add(neighboors[i].velocity);
		}
		sum.div(neighboors.length);
		sum.normalize();
		sum.mul(this.maxspeed);
		sum.sub(this.velocity);
		sum.limit(this.maxspeed);
	}

	return sum;
};
*/

/*
Fish.prototype.cohesion = function cohesion(neighboors) {
	var sum = new Vector(0, 0);

	if (neighboors.length) {
		for (var i in neighboors) {
			sum.add(neighboors[i].location);
		}
		sum.div(neighboors.length);
		return Behaviors.seek(this, sum); //this.seek(sum);
	}

	return sum;
};
*/
/*
Fish.prototype.affinity = function affinity(fishList) {
	var coef = 0;
	for (var i in fishList) {
		var difference = Math.abs(fishList[i].hue - this.hue);
		if (difference > 0.5) {
			difference = 1 - difference;
		}
		coef += difference;
	}
	var affinity = 1 - (coef / fishList.length);

	return affinity * affinity;
};
*/
Fish.prototype.draw = Fish.prototype.render = function render(ctx) {

	// get the points to draw the fish
	var angle = this.velocity.angle();

	var x1 = this.location.x + Math.cos(angle) * this.base;
	var y1 = this.location.y + Math.sin(angle) * this.base;

	var x = this.location.x - Math.cos(angle) * this.length;
	var y = this.location.y - Math.sin(angle) * this.length;

	var x2 = this.location.x + Math.cos(angle + this.HALF_PI) * this.base;
	var y2 = this.location.y + Math.sin(angle + this.HALF_PI) * this.base;

	var x3 = this.location.x + Math.cos(angle - this.HALF_PI) * this.base;
	var y3 = this.location.y + Math.sin(angle - this.HALF_PI) * this.base;

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
	//ctx.lineWidth = 2;
	ctx.fillStyle = this.color;
	//ctx.strokeStyle = this.color;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x3,y3);
	ctx.lineTo(x,y);
	ctx.lineTo(x2,y2);
	
	
	ctx.closePath();
	//ctx.quadraticCurveTo(x2, y2, x, y);
	//ctx.quadraticCurveTo(x3, y3, x1, y1);
	//ctx.stroke();
	ctx.fill();
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
	this.energy -= (((this.acceleration.mag() * this.mass) * this.age * this.velocity.mag()) / 100)*1.1;

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

Fish.prototype.applyForce = function applyForce(f) {
	this.acceleration.add(f);
};
// draw behaviour flag
Fish.showBehavior = false;

// Color Utilities


Fish.random = Math.random();