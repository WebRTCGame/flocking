/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global $:true, Vector:true, Fish:true, Food:true, utils:true, BaseRenderable:true, Behaviors: true, Sim:true */


function Boid(x, y) {
    BaseRenderable.call(this, x, y);
    this.mass = window.utils.randomBetween(Sim.globals.MIN_MASS, Sim.globals.MAX_MASS);
    this.maxspeed = Sim.globals.MAX_SPEED * this.mass;
    this.maxforce = Sim.globals.MAX_FORCE / (this.mass * this.mass);
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    this.wandering = new Vector(0.2, 0.2);
    this.angle = this.velocity.angle();
};
Boid.prototype = Object.create(BaseRenderable.prototype);
Boid.prototype.init = function() {};
Boid.prototype.render = function() {
    Sim.renderer.ctx.beginPath();
    Sim.renderer.ctx.arc(this.location.x, this.location.y, 10, 0, 2 * Math.PI, false);
    Sim.renderer.ctx.fillStyle = 'rgba(255,0,0,0.25)';
    Sim.renderer.ctx.fill();
};
Boid.prototype.preUpdate = function() {};
Boid.prototype.postUpdate = function() {};

Boid.prototype.update = function(value) {
    this.preUpdate();
    this.acceleration.limit(this.maxforce);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.location.add(this.velocity);

    this.acceleration.mul(0);
    this.angle = this.velocity.angle();
    this.postUpdate(value);
};