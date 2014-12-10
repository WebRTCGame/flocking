/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global $:true, Vector:true, Fish:true, Food:true, utils:true, Sim: true */

var Behaviors = {};
Behaviors.avoid = function(fish, dist) {
    if (fish.avoidList) {
        for (var i = 0; i < fish.avoidList; i++) {
            var other = fish.avoidList[i];
            if (fish.location.dist(other.location) < dist) {
                fish.acceleration.add(other.location.copy().sub(fish.location).mul(-100));
            }
        }
    }
    if (fish.showBehavior) {
        fish.color = 'blue';
    }
};
Behaviors.wander = function(fish) {
    if (Math.random() < 0.05) {
        fish.wandering.rotate(Sim.globals.TWO_PI * Math.random());
    }
    fish.velocity.add(fish.wandering);

    if (Fish.showBehavior) {
        fish.color = 'gray';
    }
};
Behaviors.seek = function(fish, target) {
    var seek = target.copy().sub(fish.location);
    seek.normalize();
    seek.mul(fish.maxspeed);
    seek.sub(fish.velocity);
    seek.limit(fish.maxforce);

    return seek;
};
Behaviors.attract = function(fish, body, attractionForce) {
    var force = fish.location.copy().sub(body.location);
    var distance = force.mag();
    distance = distance < 5 ? 5 : distance > 25 ? 25 : distance;
    force.normalize();

    var strength = (attractionForce * fish.mass * body.mass) / (distance * distance);
    force.mul(strength);
    return force;
};
Behaviors.align = function(fish, neighboors) {
    var sum = new Vector(0, 0);

    if (neighboors.length) {
        for (var i in neighboors) {
            sum.add(neighboors[i].velocity);
        }
        sum.div(neighboors.length);
        sum.normalize();
        sum.mul(fish.maxspeed);
        sum.sub(fish.velocity);
        sum.limit(fish.maxspeed);
    }

    return sum;
};
Behaviors.separate = function(fish, neighboors, range) {
    var sum = new Vector(0, 0);

    if (neighboors.length) {
        for (var i in neighboors) {
            var d = fish.location.dist(neighboors[i].location);
            if (d < range) {
                var diff = fish.location.copy().sub(neighboors[i].location);
                diff.normalize();
                diff.div(d);
                sum.add(diff);
            }
        }
        sum.div(neighboors.length);
        sum.normalize();
        sum.mul(fish.maxspeed);
        sum.sub(fish.velocity);
        sum.limit(fish.maxforce);
    }

    return sum;
};
Behaviors.cohesion = function(fish, neighboors) {
    var sum = new Vector(0, 0);

    if (neighboors.length) {
        for (var i in neighboors) {
            sum.add(neighboors[i].location);
        }
        sum.div(neighboors.length);
        return Behaviors.seek(fish, sum); //this.seek(sum);
    }

    return sum;
};
Behaviors.affinity = function(fish, fishList) {
    var coef = 0;
    for (var i in fishList) {
        var difference = Math.abs(fishList[i].hue - fish.hue);
        if (difference > 0.5) {
            difference = 1 - difference;
        }
        coef += difference;
    }
    var affinity = 1 - (coef / fishList.length);

    return affinity * affinity;
};

Behaviors.shoal = function(fish) {
    //this.shoalList = fishList;

    // compute vectors
    var separation = Behaviors.separate(fish, fish.shoalList, fish.separationRange).limit(fish.maxforce);
    var alignment = Behaviors.align(fish, fish.shoalList).limit(fish.maxforce);
    var cohesion = Behaviors.cohesion(fish, fish.shoalList).limit(fish.maxforce);
    var affinity = Behaviors.affinity(fish, fish.shoalList);

    /*-- shoal with fishes of very different colors won't stay
	together as tightly as shoals of fishes of the same color --*/
    separation.mul(1.2);
    alignment.mul(1.2 * affinity);
    cohesion.mul(1 * affinity);

    // apply forces
    fish.acceleration.add(separation);
    fish.acceleration.add(alignment);
    fish.acceleration.add(cohesion);


};

Behaviors.chase = function chase(fish, fishList, action, force) {
    if (fishList.length === 0) {
        return;
    }

    for (var i in fishList) {
        //this.applyForce(fishList[i].attract(this, force || 50));
        fish.acceleration.add(Behaviors.attract(fishList[i], fish, force || 50));
        if (fish.location.dist(fishList[i].location) < (fish.length + fishList[i].length) / 2) {
            action(fishList[i]);
        } // <- execute action when reaching a fish
    }
};

Behaviors.follow = function(fish, target, arrive) {
    
    
    var dest = target.copy().sub(fish.location);
    var d = dest.dist(fish.location);

    if (d < arrive) {
        dest.setMag(d / arrive * fish.maxspeed);
    }
    else {
        dest.setMag(fish.maxspeed);
    }

    fish.acceleration.add(dest.limit(fish.maxforce * 2));
};

Behaviors.bound = function boundaries(fish,sea) {
	if (fish.location.x < 50) {
		fish.acceleration.add(new Vector(fish.maxforce * 3, 0));
	}

	if (fish.location.x > sea.width - 50) {
		fish.acceleration.add(new Vector(-fish.maxforce * 3, 0));
	}

	if (fish.location.y < 50) {
		fish.acceleration.add(new Vector(0, fish.maxforce * 3));
	}

	if (fish.location.y > sea.height - 50) {
		fish.acceleration.add(new Vector(0, -fish.maxforce * 3));
	}
};