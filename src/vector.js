/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global $:true, Vector:true, Fish:true, Food:true */

// helper library to work with vectors
function Point(x,y){
	this.x = x || 0;
	this.y = y || 0;
};

Point.prototype.toVector = function(){
	return new Vector(this.x,this.y);
};
function Vector(x, y) {
	this.x = x || 0;
	this.y = y || 0;
}

Vector.prototype = {
	set: function(x, y) {
		this.x = x;
		this.y = y;

		return this;
	},


	add: function(v) {
		this.x += v.x;
		this.y += v.y;

		return this;
	},

	sub: function(v) {
		this.x -= v.x;
		this.y -= v.y;

		return this;
	},
	subtract: function(v){
		return this.sub(v);
	},

	mul: function(s) {
		this.x *= s;
		this.y *= s;

		return this;
	},
	multiply: function(s){
		
		return this.mul(s);
	},
	div: function(s) {
		!s && console.log('Division by zero!');

		this.x /= s;
		this.y /= s;

		return this;
	},
	divide: function(s){
		return this.div(s)
	},
	mag: function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	},
	magnitude: function(){
		return Math.sqrt(this.x * this.x + this.y * this.y);
	},
	length: function(){
		return this.mag();
	},
	truncate: function(value){
		if (this.length()>value){
			this.normalize();
			this.multiply(value);
		}
		return this;
	},
	normalize: function() {
		var mag = this.magnitude();
		mag && this.div(mag);
		return this;
	},
	unit: function() {
		var mag = this.mag();
		return new Vector(this.x / mag, this.y / mag);
	},
	angle: function() {
		return Math.atan2(this.y, this.x);
	},
	setMag: function(m) {
		var angle = this.angle();
		this.x = m * Math.cos(angle);
		this.y = m * Math.sin(angle);
		return this;
	},
	setAngle: function(a) {
		var mag = this.mag();
		this.x = mag * Math.cos(a);
		this.y = mag * Math.sin(a);
		return this;
	},
	rotate: function(a) {
		this.setAngle(this.angle() + a);
		return this;
	},
	limit: function(l) {
		var mag = this.mag();
		if (mag > l) {
			this.setMag(l);
		}
		return this;
	},
	angleBetween: function(v) {
		return this.angle() - v.angle();
	},
	dot: function(v) {
		return this.x * v.x + this.y * v.y;
	},
	lerp: function(v, amt) {
		this.x += (v.x - this.x) * amt;
		this.y += (v.y - this.y) * amt;
		return this;
	},
	dist: function(v) {
		var dx = this.x - v.x;
		var dy = this.y - v.y;
		return Math.sqrt(dx * dx + dy * dy);
	},
	copy: function() {
		return new Vector(this.x, this.y);
	},
	clone: function() {
		return this.copy();
	},
	toString: function() {
		return 'x: ' + this.x & ' | y: ' + this.y;
	},
	toArray: function() {
		return [this.x, this.y];
	},
	mix: function(v, amount) {
		if (typeof amount === 'undefined') {
			amount = 0.5;
		}
		this.x = (1 - amount) * this.x + amount * v.x;
		this.y = (1 - amount) * this.y + amount * v.y;
		return this;
	},
	zero: function() {
		this.x = this.y = 0;
	},
	cross: function(v) {
		return (this.x * v.y) - (this.y * v.x);
	},
	projectOnto: function(vec2) {
		var coeff = ((this.x * vec2.x) + (this.y * vec2.y)) / ((vec2.x * vec2.x) + (vec2.y * vec2.y));
		this.x = coeff * vec2.x;
		this.y = coeff * vec2.y;
		return this;
	},
	horizontalAngle: function() {
		return Math.atan2(this.y, this.x);
	},
	verticalAngle: function() {
		return Math.atan2(this.x, this.y);
	},
	lengthSq: function() {
		return this.x * this.x + this.y * this.y;
	},
	isEqualTo: function(v) {
		return this.x === v.x && this.y === v.y;
	},
	toObject: function() {
		return {
			x: this.x,
			y: this.y
		};
	},
	perpRight: function() {
		return new Vector(-this.y, this.x);
	},
	clamp: function(vMin,vMax){
		if (this.x < vMin.x) {this.x = vMin.x} else if (this.x > vMax.x){this.x = vMax.x}
		if (this.y < vMin.y){this.y = vMin.y}else if (this.y > vMax.y){this.y = vMax.y}
		return this;
	},
	clampScalar: function(min,max){
		if (this.x < min) {this.x = min} else if (this.x > max){this.x = max}
		if (this.y < min){this.y = min}else if (this.y > max){this.y = max}
		return this;
	},
	ceil: function(){
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		return this;
	},
	floor: function(){
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this;
	},
	negate: function(){
		this.x = - this.x;
		this.y = - this.y;
		return this;
	}
};