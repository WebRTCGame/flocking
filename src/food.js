/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global $:true, Vector:true, Fish:true, Food:true, Sim:true */

// Food constructor
function Food(x, y, amount)
{
	// food properties
	this.location = new Vector(x,y);
	this.velocity = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
	this.energy = amount;
	this.radius = 5;
	this.dead = false;

	// helper
	this.TWO_PI =  Math.PI * 2;
}

// food methods
Food.prototype = {

	// draw the food
	draw: function(ctx)
	{
		if (this.radius < 0) {return;}

		ctx.beginPath();
		ctx.arc(this.location.x, this.location.y, this.radius, 0, this.TWO_PI);

		var old = ctx.globalAlpha;
		ctx.globalAlpha = 0.5;
		ctx.fillStyle = "#eeeeee";
		ctx.fill();
		ctx.font = "14px Verdana";
		ctx.fillStyle = "#000000";
		ctx.globalAlpha = this.energy > 0 ? 0.5 : this.radius/100;
		ctx.fillText("FOOD",this.location.x - 20,this.location.y + 5);
		ctx.globalAlpha = old;
	},

	// update the food
	update: function(world)
	{
		// calculate radious according to the ammount of energy (i.e. ammount of food)
		var target = this.energy > 0 ? this.energy + 50 : 0;
		this.radius += (target - this.radius) / 5;

		// move food
		this.location.add(this.velocity);

		// if food goes out of the boundaries of the sea, kill it
		if (this.location.x > world.width || this.location.x < 0 || this.location.y > world.height || this.location.y < 0)
			{this.energy = 0;}
		
		// die 
		if (this.radius < 5)
			{this.dead = true;}
	},

	// get a bite by a fish
	eatenBy: function(fish)
	{
		if (fish.energy < fish.mass * Sim.globals.ENERGY){
		this.energy -= fish.bite;
		fish.energy += (fish.bite*0.5);
		
		}
	}
}