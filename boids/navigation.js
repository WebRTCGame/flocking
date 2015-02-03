
function loadContent() {
	$.ajax({
                 type: "GET",
                 url: "./parser.php",
                 dataType: "xml",
                 success: function(theXML) 
                 
                 {
                
               
                 	var i = 0;
                 	var allItemsObject = $(theXML).find('item');
                 	
                 	// Create an array and place all the objects in it, then reverse the array
                 	var allItemsArray = [];
                 	allItemsObject.each(function() {allItemsArray.push($(this))});
                 	allItemsArray.reverse(); // oldest on bottom
                 	
                 	var itemTotal = allItemsArray.length;
                    $.each(allItemsArray, function()
                     {
                        var nodeName = $(this).attr('name');
                        var link = nodeName; // store before manipulating
                        
                        // Replace underscores, and remove the trailing '/'
                        nodeName = nodeName.replace(/_/gi, ' ').substring(0, nodeName.length - 1);
         
                        //background-color: rgb(255, 0, 0);
                        var RGB = hsvToRgb(i/itemTotal * 320 + 40, 80, 100);
                        var textRGB = hsvToRgb(180 - (i/itemTotal * 180) + 175, 95, 80);
                        var endHeight =  20; 
                        var endWidth =  nodeName.length * 13 + Math.random() * 200;
                         // Create the div
						$("<div />")
						.attr("id", 'item_' + i)
						.addClass('nodes')
						.html("<a rel='shadowbox[Mixed]' href=" + link + " style='color:rgb(" +  textRGB[0] + "," + textRGB[1] + "," + textRGB[2] + ")'>" + nodeName +"</a>")
						.css('background-color', 'rgb(' + RGB[0] + ',' + RGB[1] +',' + RGB[2] +')' )
						.css('width', $(window).width() * 0.98)
						.css('height',  1000)
						.css('opacity', Math.random())
						.css('padding-left', 5)
						.css('padding-top', 10)
						.animate({width: endWidth}, {duration: 1000 + i * 25, easing: 'easeInSine'})
						.animate({opacity: 1, height: 40}, {queue: false, duration: 1000 + i * 25, easing: 'easeInOutSine'})
						.appendTo($("#content"));
						
						// Slide out a little on rollover
						$('#' + 'item_' + i).hover
						(
							function()
							{
								var endWidth =  nodeName.length * 32 + Math.random() * 200;
								$(this).animate({width: endWidth}, {duration: 250, easing: 'easeInQuad'})
							},
							function()
							{
								var endWidth =  nodeName.length * 13 + Math.random() * 100;
								$(this).animate({width: endWidth}, {duration: 150, easing: 'easeOutSine'})	
							}
						);
						
									
			
						// Clicking any link will stop the birds
						
						
						i++;			
						}); //close foreach
						
						
						var allLinks = $('a');
						allLinks.each( function()
						{
							$(this).click
							 (
								function ()
								{								
									$.each(littleBirds, function()
									{
										$(this).stop();
									});
									
								//	return false;
								}
							);
						});
						
						
                 } // close success
                 
             }); //close $.ajax
       }; //close load content
              
             // show the logo
			var logo = new Image();
			$(logo).attr('src', 'logo.png');
			$(logo).css('opacity', 0.05);
			$(logo).appendTo('#logo');
			$(logo).animate({opacity: 1}, {duration: 8000, easing: 'easeInSine'});
			
			 /**
 * HSV to RGB color conversion
 *
 * H runs from 0 to 360 degrees
 * S and V run from 0 to 100
 * 
 * Ported from the excellent java algorithm by Eugene Vishnevsky at:
 * http://www.cs.rit.edu/~ncs/color/t_convert.html
 */
function hsvToRgb(h, s, v) {
	var r, g, b;
	var i;
	var f, p, q, t;
	
	// Make sure our arguments stay in-range
	h = Math.max(0, Math.min(360, h));
	s = Math.max(0, Math.min(100, s));
	v = Math.max(0, Math.min(100, v));
	
	// We accept saturation and value arguments from 0 to 100 because that's
	// how Photoshop represents those values. Internally, however, the
	// saturation and value are calculated from a range of 0 to 1. We make
	// That conversion here.
	s /= 100;
	v /= 100;
	
	if(s == 0) {
		// Achromatic (grey)
		r = g = b = v;
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
	
	h /= 60; // sector 0 to 5
	i = Math.floor(h);
	f = h - i; // factorial part of h
	p = v * (1 - s);
	q = v * (1 - s * f);
	t = v * (1 - s * (1 - f));

	switch(i) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
			
		case 1:
			r = q;
			g = v;
			b = p;
			break;
			
		case 2:
			r = p;
			g = v;
			b = t;
			break;
			
		case 3:
			r = p;
			g = q;
			b = v;
			break;
			
		case 4:
			r = t;
			g = p;
			b = v;
			break;
			
		default: // case 5:
			r = v;
			g = p;
			b = q;
	}
	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}