/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global $:true, Vector:true, Fish:true, Food:true, utils:true */

var Behaviors = {};
Behaviors.avoid = function(fish, dist) {
    if (fish.avoidList) {
        for (var i = 0; i < fish.avoidList; i++) {
            var other = fish.avoidList[i];
            if (fish.location.dist(other.location) < dist) {
                fish.applyForce(other.location.copy().sub(fish.location).mul(-100));
            }
        }
    }
    if (fish.showBehavior) {
        this.color = 'blue';
    }
};
Behaviors.wander = function(fish) {
    if (Math.random() < 0.05) {
        fish.wandering.rotate(Math.PI * 2 * Math.random());
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
    seek.sub(fish.velocity).limit(fish.maxforce);

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