/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global Vector:true, Food:true, Sim:true, BaseRenderable:true */
//take a look at http://gpolo.github.io/birdflocking/


var Obstacle = function(x, y, radius) {
	BaseRenderable.call(this, x, y);


	this.radius = radius || 5;

};
Obstacle.prototype = Object.create(BaseRenderable.prototype);



Obstacle.prototype.render = function() {

	Sim.renderer.ctx.beginPath();
	Sim.renderer.ctx.arc(this.location.x, this.location.y, this.radius, 0, 2 * Math.PI, false);
	Sim.renderer.ctx.fillStyle = 'rgba(255,255,0,0.5)';
	Sim.renderer.ctx.fill();
	Sim.renderer.ctx.lineWidth = 1;
	Sim.renderer.ctx.strokeStyle = 'rgba(0,0,0,0.5)';
	Sim.renderer.ctx.stroke();

};


Obstacle.prototype.update = function(world) {};
