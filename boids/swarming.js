/*  
        ####  #####  ##### ####    ###  #   # ###### ###### ##     ##  #####  #     #      ########    ##    #  #  ##### 
       #   # #   #  ###   #   #  #####  ###    ##     ##   ##  #  ##    #    #     #     #   ##   #  #####  ###   ###
       ###  #   #  ##### ####   #   #   #   ######   ##   #########  #####  ##### ##### #   ##   #  #   #  #   # #####
       --
       Mario Gonzalez
*/

	document.writeln('<script src="jQueryRotate.js" type="text/javascript"></script>');
	document.writeln('<script src="jquery-ui-1.8.5.custom.min.js" type="text/javascript"></script>');
	
	
	isAnIDevice = ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)));
	
	//Let's make some birds
	var littleBirds = [];
	var amountOfBirds = (isAnIDevice) ? 5: 41;
	var mousePosition;
	var bounds;
	var obstacles = [];
	var obstacleCount = isAnIDevice ? 2 : 3;
	
	function onDocumentReady()
	{		
		this.bounds = {left:0, top: 0, bottom:$(window).height(), right: $(window).width()};
		// Create a bunch of birds
		for(var i = 0; i < amountOfBirds; i++)
		{
			var birdScale = randRange(0.6, 1);
			
			var aBirdDiv = new Image();
			var originalWidth = 32;
			var newWidth = originalWidth*birdScale;
			
			var originalHeight = 32;
			var newHeight = originalHeight*birdScale;
			
			$(aBirdDiv).attr('src', 'boid.png');
			$(aBirdDiv).addClass('bird');
			$(aBirdDiv).css('width', newWidth);
			$(aBirdDiv).css('height', newHeight);
			$(aBirdDiv).appendTo('#birdContainer');
			//
			
			$(aBirdDiv).offset({left: -30, top: 0 });
			
			var boid = new Boid(aBirdDiv, 9.3, 0.65 );
			boid._size = {width: newWidth, height: newHeight};
			
			boid.setWanderRadiusAndLookAheadDistanceWithMaxTurningAngle(16, 40, 0.3);
			boid._position.x = Math.random() * $(window).width();
			boid._position.y = randRange(5, 10);
			littleBirds.push(boid);
		}
		
		// Create a bunch of birds
		for(var i = 0; i < obstacleCount; i++)
		{
			var obstacle = new Image();
			$(obstacle).attr('src', 'drag.png');
			$(obstacle).addClass('bird');

			$(obstacle).appendTo('#birdContainer');
			//
			var buffer = 200;
			
			$(obstacle).offset({left: randRange(this.bounds.right*0.5-buffer, this.bounds.right*0.5+buffer), top: randRange(this.bounds.bottom*0.4-buffer, this.bounds.bottom*0.5+buffer) });
			$(obstacle).draggable();
			obstacles.push(obstacle);
		}
		var boundsRef = this.bounds;
		function scrollClosure(boundsRef)
		{
			return (
				function(scrollEvent)
				{
					// Offset the scrolled position - so that the articles are always constrained to the visible rectangle
					boundsRef.top = $(window).scrollTop();
					boundsRef.bottom = $(window).scrollTop() + $(window).height();					
				}
			);
		}
		
		
		$(window).scroll(scrollClosure(boundsRef));
		function mouseMoveClosure(mousePositionRef)
		{
			//alert(mousePositionRef.x);
			return (
				function(event)
				{
  					mousePositionRef.x = event.pageX;
					mousePositionRef.y = event.pageY; 
				}
			);
		}
		
		// Resize
		$(window).resize(function() {
			$('#birdContainer').css({height: $(document).height()}); // fix container height
		});
		// Mouse movement
		this.mousePosition = new Vector($(document).width()/2, $(document).height()/2);
		$(document).mousemove(mouseMoveClosure( this.mousePosition ) );
		
		// Enterframe
		var mousePositionTemp = this.mousePosition;
		var boundsRef = this.bounds;
		setInterval(function(){ return (onEnterFrame(mousePositionTemp, boundsRef));}, 1000 / 35);
		
		// Fix container initial height
		$('#birdContainer').css({height: $(document).height()}); // fix container height
		
		
		// show the logo
		var logo = new Image();	
		$(logo).attr('src', 'logo.png');
		$(logo).addClass('logo');
		$(logo).appendTo('#logo');
		
		loadContent();
}
	
 
	function onEnterFrame(mouseCordinates, bounds)
	{
		var halfWidth = 57*0.5;
		var halfHeight = 150*0.5;
		
		var logo = new Vector(bounds.right * 0.5, (bounds.bottom-bounds.top) * 0.5);
		
		for(var i = 0; i < amountOfBirds; i++)
		{
			var boid = littleBirds[i];
			
			for(var j = 0; j < obstacleCount; j++) {
				var obstaclePosition = new Vector(parseFloat(obstacles[j].style.left), parseFloat(obstacles[j].style.top));
				boid.fleePanicAtDistanceUsingMultiplier(obstaclePosition, 200, 1);
			}
				
			boid.seekWithinRangeAndApplyMultiplier(mouseCordinates, 100, 0.69);
			boid.wander(0.2);


			boid.update();
			boid.handleEdgeWithBoundsObjectAndShouldWrap(bounds, false);

			var xpos = boid._position.x;
			var ypos = boid._position.y - bounds.bottom;
			// Faster Not reliable :(
			//boid.div.style.left = boid._position.x;
			//boid.div.style.top = boid._position.y - bounds.bottom;
			
			// Matrix translate the position of the object in webkit & firefox
//			boid.div.style ="translate3d("+xpos+"px,"+ypos+"px, 0px)";
//			boid.div.style ="translate("+xpos+"px,"+ypos+"px)";
	
			// Slower... but reliable
			$(boid.div).offset({left:boid._position.x, top:boid._position.y});
			//$(boid.div).rotate(boid._rotation);
		}
		
	}
	
	/**
		Helper functions
	**/
	function randRange(min, max)
	{
		return Math.random() * (max-min) + min;
	}
	
	
	$(document).ready(onDocumentReady);
	