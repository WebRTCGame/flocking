/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global Vector:true, Food:true, Sim:true, BaseRenderable:true */

// Food constructor
var Food = function(x, y, amount) {
	// food properties
	//this.location = new Vector(x, y);
	BaseRenderable.call(this, x, y);
	this.velocity = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
	this.energy = amount;
	this.radius = 5;
	//this.dead = false;
};
Food.prototype = Object.create(BaseRenderable.prototype);


// draw the food
Food.prototype.render = function() {
	//console.log("food render");
	if (this.radius < 0) {
		return;
	}




 Sim.globals.ctx.beginPath();
      Sim.globals.ctx.arc(this.location.x, this.location.y, this.radius, 0, 2 * Math.PI, false);
      Sim.globals.ctx.fillStyle = 'rgba(0,255,0,0.25)';
      Sim.globals.ctx.fill();
      //Sim.globals.ctx.lineWidth = 5;
      //Sim.globals.ctx.strokeStyle = '#003300';
      //Sim.globals.ctx.stroke();
/*
	Sim.globals.ctx.beginPath();
	Sim.globals.ctx.arc(this.location.x, this.location.y, this.radius, 0, this.TWO_PI);
	Sim.globals.ctx.stroke();
	//var old = Sim.globals.ctx.globalAlpha;
	//Sim.globals.ctx.globalAlpha = 0.5;
	Sim.globals.ctx.fillStyle = "#eeeeee";
	Sim.globals.ctx.fill();
	*/
	
	/*
	Sim.globals.ctx.font = "14px Verdana";
	Sim.globals.ctx.fillStyle = "#000000";
	//Sim.globals.ctx.globalAlpha = this.energy > 0 ? 0.5 : this.radius / 100;
	Sim.globals.ctx.fillText("FOOD", this.location.x - 20, this.location.y + 5);
	//Sim.globals.ctx.globalAlpha = old;
*/
	
	
};

// update the food
Food.prototype.update = function(world) {
	
	// calculate radious according to the ammount of energy (i.e. ammount of food)
	//var target = this.energy > 0 ? this.energy + 50 : 0;
	this.radius = this.energy;//+= (target - this.radius) / 5;
//console.log(this.radius + " e: " + this.energy);
	// move food
	this.location.add(this.velocity);

	// if food goes out of the boundaries of the sea, kill it
	if (this.location.x > world.width || this.location.x < 0 || this.location.y > world.height || this.location.y < 0) {
		this.energy = 0;
	}

	// die 
	if (this.energy < 5) {
		this.dead = true;
	}
	
};

// get a bite by a fish
Food.prototype.eatenBy = function(fish) {
	
	if (fish.energy < fish.mass * Sim.globals.ENERGY) {
		this.energy -= fish.bite;
		fish.energy += (fish.bite * 0.5);

	} else {
		this.energy -= fish.bite * 0.5;
		fish.energy += (fish.bite * 0.05);
		fish.mass += 0.001;
	}
};
