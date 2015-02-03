/*  
        ####  #####  ##### ####    ###  #   # ###### ###### ##     ##  #####  #     #      ########    ##    #  #  ##### 
       #   # #   #  ###   #   #  #####  ###    ##     ##   ##  #  ##    #    #     #     #   ##   #  #####  ###   ###
       ###  #   #  ##### ####   #   #   #   ######   ##   #########  #####  ##### ##### #   ##   #  #   #  #   # #####
       --
       Mario Gonzalez
*/
function Boid(aDiv, aMaxSpeed, aMaxForce)
{
	this.div = aDiv;
	this.boidName = "Boid-"+Math.floor(Math.random()*1000);
	
	// Velocity 
	this._velocity = new Vector(0,0);
	this._acceleration = new Vector(0,0);
	this._steeringForce = new Vector(0,0);
	
	this._size = {width: 100, height: 100};
	
	// Position
	this._position = new Vector(0,0);
	this._rotation = 0;
	this._desiredRotation = 0;
	this._distance = 0;
	
	this._previousPosition = new Vector(0,0);
	
	// Limits
	this._maxForce = aMaxForce;
	this._maxSpeed = aMaxSpeed;
	this._maxForceSquared = this._maxForce * this._maxForce;
	this._maxSpeedSquared = this._maxSpeed * this._maxSpeed;
	
	// Wander
	this._wanderTheta = 0.0; 
	
	// This stuff is really well explained here http://www.shiffman.net/itp/classes/nature/week06_s09/wander/
	this._wanderMaxTurnCircleRadius; // The radius of the circle, the boid randomly moves to AFTER it projects its future distance
	this._wanderTurningRadius;  // The maximum angle, in radians, that the Boid's wander behavior can turn at each step.
	this._wanderLookAheadDistance; // How far ahead to look when deciding where to go, further ahead 
};
Boid.prototype =
{

	update: function()
	{
		this._previousPosition.x = this._position.x;
		this._previousPosition.y = this._position.y;
		 
		this._velocity.add(this._acceleration)
		
		// cap speed
		if(this._velocity.lengthSquared() > this._maxSpeedSquared)
			this._velocity.normalize().mul(this._maxSpeed);
			
		this._position.add(this._velocity);
		
		// Removed since now using a circular asset
//		this._desiredRotation = Math.atan2(this._position.y - this._previousPosition.y, this._position.x - this._previousPosition.x) * toDegrees;
		//if(this._desiredRotation < -1 || this._desiredRotation > 1)
//		var delta = (this._rotation - this._desiredRotation);
//		var glide = (delta > 25) ? 0.05 : 0.25;
//		this._rotation = this._desiredRotation;//delta * glide;
			
		//handle border
		this._acceleration.x = 0;
		this._acceleration.y = 0;
	},
	
	steer: function(target, easeAsAppraching, easeDistance)
	{
		this._steeringForce = target.cp();


		this._steeringForce.sub(this._position);

		this._distance = this._steeringForce.lengthSquared();

		if ( this._distance > 0.00001 )

		{

			if ( this._distance < easeDistance && easeAsAppraching )
			{

				this._steeringForce.mul(this._maxSpeed * ( this._distance / easeDistance ));

			} else {

				this._steeringForce.mul(this._maxSpeed);

			}

				

			this._steeringForce.sub(this._velocity);

			if ( this._steeringForce.lengthSquared() > this._maxForceSquared )
			{

				this._steeringForce.normalize();

				this._steeringForce.mul(this._maxForce);

			}

		}

			

		return this._steeringForce;
	},
	
	seekWithinRangeAndApplyMultiplier: function(target, range, multiplier)
	{
		this.steer(target, range > 1, range);
		this._steeringForce.mul(multiplier);
		this._acceleration.add(this._steeringForce);
	},

	fleePanicAtDistanceUsingMultiplier: function(target, panicDistance, multiplier)
	{
		var panicDistanceSquared = panicDistance*panicDistance;
		var distanceSquared = getDistanceSquared(this._position, target);
		
		if(distanceSquared > panicDistanceSquared)
			return;
			
		this.steer(target, true, panicDistance);
		
		// apply and negate
		this._steeringForce.mul(multiplier);
		this._steeringForce.mul(-1);
		// append
		this._acceleration.add(this._steeringForce);
	},
	
	setWanderRadiusAndLookAheadDistanceWithMaxTurningAngle: function(radius,distance,turningAngle)
	{
		this._wanderMaxTurnCircleRadius = radius;
		this._wanderLookAheadDistance = distance;
		this._wanderTurningRadius = turningAngle;
	},
	
	wander: function(multiplier)
	{
		this._wanderTheta += randRange(-this._wanderTurningRadius, this._wanderTurningRadius);	
		
		
		// Add our speed to where we are, plus this._wanderDistnace ( how far we project ourselves wandering )
		var futurePosition = new Vector(this._velocity.x, this._velocity.y);
				
		futurePosition.normalize()
		.mul(this._wanderLookAheadDistance)
		.add(this._position);
		// move left or right a little
		//console.log(futurePosition.x, futurePosition.y);
		 
		var offset = new Vector(0, 0);
		offset.x = this._wanderMaxTurnCircleRadius * Math.cos(this._wanderTheta);
		offset.y = this._wanderMaxTurnCircleRadius * Math.sin(this._wanderTheta);
		
		// steer to our new random position
		var target = futurePosition.addNew(offset);
		this.steer(target, false, 0);
		
		this._steeringForce.mul(multiplier);
		this._acceleration.add(this._steeringForce);
	},
	handleEdgeWithBoundsObjectAndShouldWrap: function(bounds, shouldWrap)
	{
		if(this._position.x + this._size.width < bounds.left) {
			this._position = new Vector(bounds.right, this._position.y );
		}
		else if (this._position.x > bounds.right) {
			this._position = new Vector(bounds.left, this._position.y );
		}
		
		if (this._position.y + this._size.height < bounds.top) {
			this._position = new Vector(this._position.x, bounds.bottom);
		}
		else if (this._position.y > bounds.bottom) {
			this._position = new Vector(this._position.x, bounds.top);
		}
	}
};

var toRadians = 0.0174532925;
var toDegrees = 57.2957795;

function getDistanceSquared( pointA, pointB )
{
	var deltaX = pointB.x - pointA.x;
	var deltaY = pointB.y - pointA.y;
	return (deltaX * deltaX) + (deltaY * deltaY);
}
