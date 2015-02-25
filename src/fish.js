/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global $:true, Vector:true, Fish:true,  utils:true, BaseRenderable:true, Behaviors: true, Sim:true, sea: true, CircleSegment: true */


// Fish constructor
function Fish(mass, x, y, hue) {
	'use strict';
	BaseRenderable.call(this, x, y);

	this._mass = mass;
	this.hue = hue || Math.random() < 0.5 ? Math.random() * 0.5 : 1 - Math.random() * 0.5;
	this.color = utils.rgb2hex(utils.hsv2rgb(this.hue, 1, 1));

	let _energy = this._mass * Sim.globals.ENERGY;
	Object.defineProperty(this, "energy", {
		get: function() {
			return this._energy;
		},
		set: function(value) {
			this._energy = value;
			if (this._energy <= 0) {
				this.dead = true;
			}
		}
	});

	Object.defineProperty(this, 'mass', {
		get: function() {
			return this._mass;
		},
		set: function(newValue) {

			this._mass = newValue;
			this.maxspeed = Sim.globals.MAX_SPEED * this.mass;
			this.maxforce = Sim.globals.MAX_FORCE / (this.mass * this.mass);
			this.separationRange = this.mass * Sim.globals.SEPARATION_RANGE;
			this.lookRange = this.mass * Sim.globals.LOOK_RANGE;
			this.obstacleRange = this.mass * Sim.globals.LOOK_RANGE;
			this.smellRange = this.mass * Sim.globals.SMELL_RANGE;
			this.length = this.mass * Sim.globals.LENGTH;
			this.fertility = (this.mass) * Sim.globals.FERTILITY + 1;
			this.bite = this.mass * Sim.globals.BITE;


		},
		enumerable: true,
		configurable: true
	});


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

	this.tail = [];

	this.skin = this.color;
	this.age = 1;


	this.mature = false;

	this.vision = new CircleSegment(this.x, this.y, this.lookRange, window.utils.toRadians(240), 0);
	this.nose = new CircleSegment(this.x, this.y, this.smellRange, window.utils.toRadians(300), 0);
	//neighbors
	this.shoalList = [];
	this.shoalListIndexed = [];
	this.avoidList = [];
	this.eatList = [];
	this.mateList = [];

	//movement
	this.velocity = new Vector(0, 0);
	this.acceleration = new Vector(0, 0);
	this.accelDraw = new Vector(0, 0);
	this.wandering = new Vector(0.2, 0.2);
	this.angle = this.velocity.angle();
	this.popIndex = 0;

}
Fish.prototype = Object.create(BaseRenderable.prototype);

Fish.prototype.init = function() {
	'use strict';
};
// fish's methods

Fish.prototype.isHungry = function() {
	'use strict';
	const maxEnergy = this.mass * Sim.globals.ENERGY;

	return maxEnergy * 0.8 > this.energy;
};

Fish.prototype.old_identifyFood = function() {
	'use strict';
	var neighboors = [];
	var fishList = sea.food;

	for (var i = 0; i < fishList.length; i++) {
		if (fishList[i] !== null) {
			if (fishList[i] !== undefined) {
				if (fishList[i] !== this) {
					if (this.nose.contains(fishList[i].location.x, fishList[i].location.y)) {
						neighboors.push(fishList[i]);
					}
				}
			}
		}
	}
	return neighboors;
};

Fish.prototype.old_swimForFood = function(sea) {
	'use strict';
	var nearbyFood = this.identifyFood();


	if (nearbyFood.length) {
		for (var i = 0; i < nearbyFood.length; i++) {
			var food = nearbyFood[i];
			//if (food && !food.dead && food !== null && food !== undefined) {
			Behaviors.follow(this, food.location, food.radius);
			if (this.location.dist(food.location) < food.radius) {
				food.eatenBy(this);
			}
			//}
		}
	}

};
Fish.prototype.identifyFood = function() {
	'use strict';
	var neighboors = [];
	var fishList = sea.food;

	for (let i = 0; i < fishList.length; i++) {
		if (fishList[i] !== null) {
			if (fishList[i] !== undefined) {
				if (fishList[i] !== this) {
					if (this.nose.contains(fishList[i].location.x, fishList[i].location.y)) {
						neighboors.push(i);
					}
				}
			}
		}
	}
	return neighboors;
};

Fish.prototype.swimForFood = function(sea) {
	'use strict';
	var foodIndexs = this.identifyFood();


	if (foodIndexs.length) {
		for (let i = 0; i < foodIndexs.length; i++) {
			const food = sea.food[foodIndexs[i]];

			Behaviors.follow(this, food.location, food.radius);
			if (this.location.dist(food.location) < food.radius) {
				food.eatenBy(this);
			}

		}
	}

};
Fish.prototype.parseFishNeighbors = function(sea) {
	'use strict';
	var visionIndexes = this.identifyFish();

	this.shoalList = [];
	this.avoidList = [];
	this.eatList = [];
	this.mateList = [];

	//mass based parsing
	for (var i = 0; i < visionIndexes.length; i++) {
		var index = visionIndexes[i];
		var other = sea.population[index];
		if (other !== this) {
			if (other.mass < this.mass / 2) {
				this.eatList.push(other);
			}
			else if (other.mass > this.mass * 2) {
				this.avoidList.push(other);
				//this.avoidList.push(index);
			}
			else {
				this.shoalList.push(other);
				this.shoalListIndexed.push(index);

				//is shoalable and mature
				if (this.mature && other.mature) {
					this.mateList.push(other);
				}
			}
		}

	}
};

Fish.prototype.swimForFish = function(sea) {
	'use strict';
	this.shoalList.length ? Behaviors.shoal(this) : Behaviors.wander(this);
	this.avoidList.length && Behaviors.avoid(this, 300);
	this.eatList.length && this.isHungry() && this.eat();
	this.mateList.length && this.mate(sea.population);
};


Fish.prototype.swim = function(sea) {
	'use strict';
	this.swimForFood(sea);
	this.parseFishNeighbors(sea);
	this.swimForFish(sea);
};




Fish.prototype.eat = function eat() {
	'use strict';

	var that = this;

	Behaviors.chase(this, this.eatList, function(fish) {
		that.energy += fish.energy;
		if (that.energy > that.mass * Sim.globals.ENERGY) {
			that.energy = that.mass * Sim.globals.ENERGY;
		}
		fish.energy = 0;
	});


};

Fish.prototype.mate = function mate(seaPopulation) {
	'use strict';

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
		const location = that.location.copy().lerp(fish.location, 0.5);
		let mass = (that.mass + fish.mass) / 2;
		let color = utils.interpolateColor(that.hue, fish.hue);

		// mutation
		const mutationRate = 0.01;
		mass += Math.random() < mutationRate ? Math.random() * 2 - 1 : 0;
		color = Math.random() < mutationRate ? Math.random() : color;

		// create offspring
		var offspring = new Fish(mass, location.x, location.y, color);

		// add to sea population
		//sea.population.push(offspring);


		seaPopulation.push(offspring);

	}, 400);


};

Fish.prototype.identifyFish = function() {
	'use strict';

	for (var retVal = [], fishList = sea.population, i = 0; i < fishList.length; i++) {
		if (fishList[i] !== null && fishList[i] !== undefined && fishList[i] !== this) {
			if (this.vision.contains(fishList[i].location.x, fishList[i].location.y)) {
				retVal.push(i);
			}
		}
	}
	return retVal;
};

Fish.prototype.isInSea = function() {
	'use strict';
	return (this.location.x > 0 && this.location.x < sea.width && this.location.y > 0 && this.location.y < sea.height);
};

Fish.prototype.render = function() {
	'use strict';
	if (this.isInSea()) {
		const ctx = Sim.renderer.ctx;
		ctx.save();
		ctx.lineWidth = 1;
		// get the points to draw the fish
		const angle = this.angle;
		this.base = this.length * 0.5;
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
		this.color = this.skin;
		ctx.fillStyle = this.color;

		const x1 = this.location.x + Math.cos(angle) * this.base;
		const y1 = this.location.y + Math.sin(angle) * this.base;

		const x = this.location.x - Math.cos(angle) * this.length;
		const y = this.location.y - Math.sin(angle) * this.length;

		const x2 = this.location.x + Math.cos(angle + Sim.globals.HALF_PI) * this.base;
		const y2 = this.location.y + Math.sin(angle + Sim.globals.HALF_PI) * this.base;

		const x3 = this.location.x + Math.cos(angle - Sim.globals.HALF_PI) * this.base;
		const y3 = this.location.y + Math.sin(angle - Sim.globals.HALF_PI) * this.base;

		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x3, y3);
		ctx.lineTo(x, y);
		ctx.lineTo(x2, y2);
		ctx.closePath();



		ctx.fill();
		ctx.stroke();

		ctx.save();
		if (this.tail.length > 20) {
			this.tail.shift();
		}
		this.tail.push({
			x: this.location.x,
			y: this.location.y
		});

		ctx.beginPath();
		for (var i = 0; i < this.tail.length - 1; i++) {
			//ctx.lineWidth = i + 2;
			var pt1 = this.tail[i];
			var pt2 = this.tail[i + 1];
			ctx.moveTo(pt1.x, pt1.y);
			ctx.lineTo(pt2.x, pt2.y);


		}
		ctx.lineWidth = 6;
		ctx.strokeStyle = this.color;
		ctx.stroke();
		ctx.restore();

		this.strokeStyle = 'black';
		this.lineWidth = 1;


		//this.vision.draw(ctx);


		//this.nose.draw(ctx);

		function getPointAL(x, y, angle, length) {
			var radA = angle;
			return {
				x: x + length * Math.cos(radA),
				y: y + length * Math.sin(radA)
			};
		};

		function drawLineAL(x, y, angle, length) {
			ctx.moveTo(x, y);
			var otherPoint = getPointAL(x, y, angle, length);
			ctx.lineTo(otherPoint.x, otherPoint.y);
			ctx.stroke();
		};

		ctx.save();
		ctx.strokeStyle = 'red';
		drawLineAL(this.location.x, this.location.y, this.angle, this.velocity.mag() * 5);
		var acA = this.accelDraw.angle();

		var acL = this.accelDraw.mag();

		ctx.strokeStyle = 'blue';
		drawLineAL(this.location.x, this.location.y, acA, acL * 75);

		ctx.lineWidth = 3;
		//console.log(this.energy);
		ctx.strokeStyle = 'green';
		//drawLineAL(this.location.x - 5, this.location.y - 15, 0, 10);
		ctx.font = "24px serif";
		ctx.fillText(this.popIndex, this.location.x - 5, this.location.y - 15);
		ctx.restore();
		ctx.strokeStyle = 'black';
		ctx.restore();
	}
};

Fish.prototype.drawBehavior = function drawBehavior() {
	'use strict';
	Fish.showBehavior = true;
	const ctx = Sim.renderer.ctx;
	if (Fish.showBehavior) {


		// draw avoid behaviour
		if (this.avoidList && this.avoidList.length) {
			ctx.strokeStyle = "blue";
			ctx.lineWidth = 4;
			ctx.beginPath();
			for (var i in this.avoidList) {
				ctx.moveTo(this.location.x, this.location.y);
				ctx.lineTo(this.avoidList[i].location.x, this.avoidList[i].location.y);
				//ctx.lineTo(sea.population[this.avoidList[i]].location.x, sea.population[this.avoidList[i]].location.y);
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


	}
	else {
		this.color = this.skin;
	}
};

Fish.prototype.update = function() {
	'use strict';
	// move the fish
	this.accelDraw = this.acceleration.clone();

	this.velocity.add(this.acceleration);
	this.velocity.limit(this.maxspeed);



	this.location.add(this.velocity);
	this.acceleration.limit(this.maxforce);

	this.energy -= (((this.acceleration.mag() * this.mass) * this.age * this.velocity.mag()) / 100);


	this.age *= 1.00005;
	this.mature = this.age > this.fertility;
	this.mass += 0.0001;
	// reset acceleration
	this.acceleration.mul(0);
	this.angle = this.velocity.angle();

	//console.log(this.mass);
	//if (this.energy <= 0) {
	//	this.dead = true;
	//}


	this.vision.x = this.location.x;
	this.vision.y = this.location.y;
	this.vision.direction = this.angle;
	this.vision.radius = this.lookRange;

	this.nose.x = this.location.x;
	this.nose.y = this.location.y;
	this.nose.direction = this.angle;
	this.nose.radius = this.smellRange;


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


Fish.random = Math.random();