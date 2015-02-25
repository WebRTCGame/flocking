/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global $:true, Vector:true, Sim: true, sea:true */

var Behaviors = {};

Behaviors.avoid = function(fish, dist) {
    'use strict';
    if (fish.avoidList) {
        for (let i = 0; i < fish.avoidList; i++) {
            const other = fish.avoidList[i];
            if (fish.location.dist(other.location) < dist) {
                fish.acceleration.add(other.location.copy().sub(fish.location).mul(-100));
            }
        }
    }
};
Behaviors.avoidIndex = function(fish, dist) {
    if (fish.avoidList) {
        for (var i = 0; i < fish.avoidList; i++) {
            var other = sea.population[fish.avoidList[i]];
            if (fish.location.dist(other.location) < dist) {
                fish.acceleration.add(other.location.copy().sub(fish.location).mul(-100));
            }
        }
    }
};
Behaviors.wander = function(fish) {
    if (Math.random() < 0.05) {
        fish.wandering.rotate(Sim.globals.TWO_PI * Math.random());
    }
    fish.velocity.add(fish.wandering);

};
Behaviors.seek = function(fish, target) {
    'use strict';
    let seek = target.copy().sub(fish.location);
    seek.normalize();
    seek.mul(fish.maxspeed);
    seek.sub(fish.velocity);
    seek.limit(fish.maxforce);

    return seek;
};
Behaviors.Xseek = function(fish, target) {
    var tar = target.copy();
    var desiredVelocity = tar.subtract(fish.location);
    desiredVelocity.normalize();
    desiredVelocity.multiply(fish.maxspeed);

    var steeringForce = desiredVelocity.subtract(fish.velocity);
    steeringForce.divide(fish.mass);

    fish.velocity.add(steeringForce);

};
Behaviors.Xflee = function(fish, target) {
    var tar = target.copy();
    var desiredVelocity = tar.subtract(fish.location);
    desiredVelocity.normalize();
    desiredVelocity.multiply(fish.maxspeed);

    var steeringForce = desiredVelocity.subtract(fish.velocity);
    steeringForce.divide(fish.mass);
    steeringForce.multiply(-1);
    fish.velocity.add(steeringForce);

};
Behaviors.Xpursue = function(fish, fishTarget) {
    var distance = fishTarget.location.dist(fish.location);
    var t = distance / fishTarget.maxspeed;
    var targetLocation = fishTarget.location.clone();
    var targetVelocity = fishTarget.velocity.clone();
    targetVelocity.multiply(t);
    targetLocation.add(targetVelocity);
    Behaviors.Xseek(fish, targetLocation);
};
Behaviors.Xevade = function(fish, fishTarget) {
    var distance = fishTarget.location.dist(fish.location);
    var t = distance / fishTarget.maxspeed;
    var targetLocation = fishTarget.location.clone();
    var targetVelocity = fishTarget.velocity.clone();
    targetVelocity.multiply(t);
    targetLocation.add(targetVelocity);
    Behaviors.Xflee(fish, targetLocation);
};
Behaviors.attract = function(fish, body, attractionForce) {
    'use strict';
    let force = fish.location.copy().sub(body.location);
    let distance = force.mag();
    distance = distance < 5 ? 5 : distance > 25 ? 25 : distance;
    force.normalize();

    const strength = (attractionForce * fish.mass * body.mass) / (distance * distance);
    force.mul(strength);
    return force;
};
Behaviors.align = function(fish, neighboors) {
    'use strict';
    let sum = new Vector(0, 0);

    if (neighboors.length) {
        for (let i = 0; i < neighboors.length; i++) {
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
    'use strict';
    let sum = new Vector(0, 0);

    if (neighboors.length) {
        for (let i = 0; i < neighboors.length; i++) {
            const d = fish.location.dist(neighboors[i].location);
            if (d < range) {
                let diff = fish.location.copy().sub(neighboors[i].location);
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
    'use strict';
    var sum = new Vector(0, 0);

    if (neighboors.length) {
        for (let i = 0; i < neighboors.length; i++) {
            sum.add(neighboors[i].location);
        }

        sum.div(neighboors.length);
        return Behaviors.seek(fish, sum); 
    }

    return sum;
};
Behaviors.affinity = function(fish, fishList) {
    'use strict';
    let coef = 0;
    for (let i = 0; i < fishList.length; i++) {
        let difference = Math.abs(fishList[i].hue - fish.hue);
        if (difference > 0.5) {
            difference = 1 - difference;
        }
        coef += difference;
    }

    const affinity = 1 - (coef / fishList.length);

    return affinity * affinity;
};

Behaviors.shoal = function(fish) {
'use strict';

    // compute vectors
    let separation = Behaviors.separate(fish, fish.shoalList, fish.separationRange).limit(fish.maxforce);
    let alignment = Behaviors.align(fish, fish.shoalList).limit(fish.maxforce);
    let cohesion = Behaviors.cohesion(fish, fish.shoalList).limit(fish.maxforce);
    const affinity = Behaviors.affinity(fish, fish.shoalList);

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
    'use strict';
    if (fishList.length) {

        for (let i = 0; i < fishList.length; i++) {
            //this.applyForce(fishList[i].attract(this, force || 50));
            fish.acceleration.add(Behaviors.attract(fishList[i], fish, force || 50));
            if (fish.location.dist(fishList[i].location) < (fish.length + fishList[i].length) / 2) {
                action(fishList[i]);
            } // <- execute action when reaching a fish
        }
    }

};

Behaviors.follow = function(fish, target, arrive) {
'use strict';

    let dest = target.copy().sub(fish.location);
    const d = dest.dist(fish.location);

    if (d < arrive) {
        dest.setMag(d / arrive * fish.maxspeed);
    }
    else {
        dest.setMag(fish.maxspeed);
    }

    fish.acceleration.add(dest.limit(fish.maxforce * 2));
};

Behaviors.bound = function boundaries(fish, sea) {
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