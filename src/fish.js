/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global $:true, Vector:true, Fish:true, Food:true, utils:true, BaseRenderable:true, Behaviors: true, Sim:true */


// Fish constructor
function Fish(mass, x, y, hue) {
	this._mass = mass > 0 ? mass : -mass;
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

	Object.defineProperty(this, 'mass', {
		get: function() {
			return this._mass;
		},
		set: function(newValue) {

			this._mass = newValue;
			this.maxspeed = Sim.globals.MAX_SPEED * this._mass;
			this.maxforce = Sim.globals.MAX_FORCE / (this._mass * this._mass);
			this.separationRange = this._mass * Sim.globals.SEPARATION_RANGE;
			this.lookRange = this._mass * Sim.globals.LOOK_RANGE;
			this.obstacleRange = this._mass * Sim.globals.LOOK_RANGE;
			this.smellRange = this._mass * Sim.globals.SMELL_RANGE;
			this.length = this._mass * Sim.globals.LENGTH;
			this.fertility = (this._mass) * Sim.globals.FERTILITY + 1;
			this.bite = this._mass * Sim.globals.BITE;

		},
		enumerable: true,
		configurable: true
	});
	//console.log(this.mass);
	this.maxspeed = Sim.globals.MAX_SPEED * this.mass;
	this.maxforce = Sim.globals.MAX_FORCE / (this.mass * this.mass);
	this.separationRange = this.mass * Sim.globals.SEPARATION_RANGE;
	this.lookRange = this.mass * Sim.globals.LOOK_RANGE;
	this.obstacleRange = this.mass * Sim.globals.LOOK_RANGE;
	this.smellRange = this.mass * Sim.globals.SMELL_RANGE;
	this.length = this.mass * Sim.globals.LENGTH;
	this.fertility = (this.mass) * Sim.globals.FERTILITY + 1;
	this.bite = this.mass * Sim.globals.BITE;


	this.base = this.length * 0.5;


	this.skin = this.color;
	this.age = 1;


	this.mature = false;


	//neighbors
	this.shoalList = [];
	this.avoidList = [];
	this.eatList = [];
	this.mateList = [];

	//movement
	this.velocity = new Vector(0, 0);
	this.acceleration = new Vector(0, 0);
	this.wandering = new Vector(0.2, 0.2);
	this.angle = this.velocity.angle();
	var tint = utils.hsv2rgb(this.hue, 1, 1);
	this.model = Sim.threeD.generateModel('rgb('+tint.r+','+tint.g+','+tint.b+')',0.02 * this.mass);
/*
	if (Sim.threeD.dae) {
		this.model = Sim.threeD.dae.clone(); //undefined;//dae.clone();
		if (Sim.threeD.scene) {
			Sim.threeD.scene.add(this.model);
		}
	}
	*/
	
};
// fish's methods

Fish.prototype.isHungry = function() {
	var maxEnergy = this.mass * Sim.globals.ENERGY;

	return maxEnergy * 0.8 > this.energy;
};

Fish.prototype.swimForFood = function(sea) {
	var nearbyFood = this.look(sea.food, this.smellRange);


	if (nearbyFood.length) {
		for (var i = 0; i < nearbyFood.length; i++) {
			var food = nearbyFood[i];
			if (food && !food.dead && food !== null && food !== undefined) {
				// go to the food

				Behaviors.follow(this, food.location, food.radius);

				// if close enough...
				if (this.location.dist(food.location) < food.radius) {
					// eat the food
					food.eatenBy(this);
				}
			}
		}
	}

};
Fish.prototype.parseFishNeighbors = function(sea) {
	var neighboors = this.look(sea.population, this.lookRange);

	this.shoalList = [];
	this.avoidList = [];
	this.eatList = [];
	this.mateList = [];

	for (var i = 0; i < neighboors.length; i++) {
		var other = neighboors[i];
		if (other !== this) {
			if (other.mass < this.mass / 2) {
				this.eatList.push(other);
			}
			else if (other.mass > this.mass * 2) {
				this.avoidList.push(other);
			}
			else {
				this.shoalList.push(other);
			}
		}
		if (this.mature) {
			if (other.mature) {
				this.mateList.push(other);
			}
		}

	}
};

Fish.prototype.swimForFish = function(sea) {



	if (this.shoalList.length) {
		if (this.showBehavior) {
			this.color = 'black';
		}
		Behaviors.shoal(this);

	}
	else {
		Behaviors.wander(this);
	}


	if (this.avoidList.length) {
		Behaviors.avoid(this, 300);
	}


	if (this.eatList.length) {
		if (this.isHungry()) {
			this.eat();
		}
	}

	if (this.mateList.length) {
		this.mate(sea.population);
	}

	//this.boundaries(sea);
};
// computes all the information from the enviroment and decides in which direction swim
Fish.prototype.swim = function(sea) {
	this.swimForFood(sea);
	this.parseFishNeighbors(sea);
	this.swimForFish(sea);
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

		//seaPopulation.push(offspring);

	}, 400);

	if (Fish.showBehavior) {
		this.color = "pink";
	}
};

Fish.prototype.look = function(fishList, radius) {
	//var iAngle = Sim.globals.TWO_PI;
	var iPAngle = Math.PI;
	var neighboors = [];
	for (var i = 0; i < fishList.length; i++) {
		if (fishList[i] !== null && fishList[i] !== this) {


			var d = this.location.dist(fishList[i].location);


			if (d < radius) {
				//var diff = this.location.copy().sub(fishList[i].location);
				var a = this.velocity.angleBetween(this.location.copy().sub(fishList[i].location));
				if (a < iPAngle || a > iPAngle) {
					neighboors.push(fishList[i]);
				}
			}
		}
	}

	return neighboors;
};


Fish.prototype.draw = Fish.prototype.render = function() {
	var ctx = Sim.globals.ctx;
	// get the points to draw the fish
	var angle = this.angle;

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

Fish.prototype.drawBehavior = function drawBehavior() {
	var ctx = Sim.globals.ctx;
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

Fish.prototype.update = function() {
	// move the fish

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
	this.angle = this.velocity.angle();
	if(this.model){
		//this.model.rotateOnAxis(new THREE.Vector3(0,1,0),this.angle);
		this.model.rotation.y = this.angle;
		this.model.scale.x = this.model.scale.y = this.model.scale.z = 0.02 * this.mass;
		//console.log(this.model.scale.x);
	}
	//console.log(this.mass);
};

Fish.showBehavior = false;

Fish.random = Math.random();