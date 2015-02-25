import {Vector} from "./Gvector";

export function Point(x,y){
	this.x = x || 0;
	this.y = y || 0;
};

Point.prototype.toVector = function(){
	return new Vector(this.x,this.y);
};