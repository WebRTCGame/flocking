/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global $:true, Vector:true, Fish:true, Food:true, utils:true */

/**
 * Normalize the browser animation API across implementations. This requests
 * the browser to schedule a repaint of the window for the next animation frame.
 * Checks for cross-browser support, and, failing to find it, falls back to setTimeout.
 * @param {function}    callback  Function to call when it's time to update your animation for the next repaint.
 * @param {HTMLElement} element   Optional parameter specifying the element that visually bounds the entire animation.
 * @return {number} Animation frame request.
 */
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        function(callback) {
            return window.setTimeout(callback, 17 /*~ 1000/60*/ );
        });
}

/**
 * ERRATA: 'cancelRequestAnimationFrame' renamed to 'cancelAnimationFrame' to reflect an update to the W3C Animation-Timing Spec.
 *
 * Cancels an animation frame request.
 * Checks for cross-browser support, falls back to clearTimeout.
 * @param {number}  Animation frame request.
 */
if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = (window.cancelRequestAnimationFrame ||
        window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame ||
        window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame ||
        window.msCancelAnimationFrame || window.msCancelRequestAnimationFrame ||
        window.oCancelAnimationFrame || window.oCancelRequestAnimationFrame ||
        window.clearTimeout);
}

/* Object that contains our utility functions.
 * Attached to the window object which acts as the global namespace.
 */
window.utils = {};

/**
 * Keeps track of the current mouse position, relative to an element.
 * @param {HTMLElement} element
 * @return {object} Contains properties: x, y, event
 */
window.utils.captureMouse = function(element) {
    var mouse = {
            x: 0,
            y: 0,
            event: null
        },
        body_scrollLeft = document.body.scrollLeft,
        element_scrollLeft = document.documentElement.scrollLeft,
        body_scrollTop = document.body.scrollTop,
        element_scrollTop = document.documentElement.scrollTop,
        offsetLeft = element.offsetLeft,
        offsetTop = element.offsetTop;

    element.addEventListener('mousemove', function(event) {
        var x, y;

        if (event.pageX || event.pageY) {
            x = event.pageX;
            y = event.pageY;
        }
        else {
            x = event.clientX + body_scrollLeft + element_scrollLeft;
            y = event.clientY + body_scrollTop + element_scrollTop;
        }
        x -= offsetLeft;
        y -= offsetTop;

        mouse.x = x;
        mouse.y = y;
        mouse.event = event;
    }, false);

    return mouse;
};

/**
 * Keeps track of the current (first) touch position, relative to an element.
 * @param {HTMLElement} element
 * @return {object} Contains properties: x, y, isPressed, event
 */
window.utils.captureTouch = function(element) {
    var touch = {
            x: null,
            y: null,
            isPressed: false,
            event: null
        },
        body_scrollLeft = document.body.scrollLeft,
        element_scrollLeft = document.documentElement.scrollLeft,
        body_scrollTop = document.body.scrollTop,
        element_scrollTop = document.documentElement.scrollTop,
        offsetLeft = element.offsetLeft,
        offsetTop = element.offsetTop;

    element.addEventListener('touchstart', function(event) {
        touch.isPressed = true;
        touch.event = event;
    }, false);

    element.addEventListener('touchend', function(event) {
        touch.isPressed = false;
        touch.x = null;
        touch.y = null;
        touch.event = event;
    }, false);

    element.addEventListener('touchmove', function(event) {
        var x, y,
            touch_event = event.touches[0]; //first touch

        if (touch_event.pageX || touch_event.pageY) {
            x = touch_event.pageX;
            y = touch_event.pageY;
        }
        else {
            x = touch_event.clientX + body_scrollLeft + element_scrollLeft;
            y = touch_event.clientY + body_scrollTop + element_scrollTop;
        }
        x -= offsetLeft;
        y -= offsetTop;

        touch.x = x;
        touch.y = y;
        touch.event = event;
    }, false);

    return touch;
};

/**
 * Returns a color in the format: '#RRGGBB', or as a hex number if specified.
 * @param {number|string} color
 * @param {boolean=}      toNumber=false  Return color as a hex number.
 * @return {string|number}
 */
window.utils.parseColor = function(color, toNumber) {
    if (toNumber === true) {
        if (typeof color === 'number') {
            return (color | 0); //chop off decimal
        }
        if (typeof color === 'string' && color[0] === '#') {
            color = color.slice(1);
        }
        return window.parseInt(color, 16);
    }
    else {
        if (typeof color === 'number') {
            color = '#' + ('00000' + (color | 0).toString(16)).substr(-6); //pad
        }
        return color;
    }
};

/**
 * Converts a color to the RGB string format: 'rgb(r,g,b)' or 'rgba(r,g,b,a)'
 * @param {number|string} color
 * @param {number}        alpha
 * @return {string}
 */
window.utils.colorToRGB = function(color, alpha) {
    //number in octal format or string prefixed with #
    if (typeof color === 'string' && color[0] === '#') {
        color = window.parseInt(color.slice(1), 16);
    }
    alpha = (alpha === undefined) ? 1 : alpha;
    //parse hex values
    var r = color >> 16 & 0xff,
        g = color >> 8 & 0xff,
        b = color & 0xff,
        a = (alpha < 0) ? 0 : ((alpha > 1) ? 1 : alpha);
    //only use 'rgba' if needed
    if (a === 1) {
        return "rgb(" + r + "," + g + "," + b + ")";
    }
    else {
        return "rgba(" + r + "," + g + "," + b + "," + a + ")";
    }
};

/**
 * Determine if a rectangle contains the coordinates (x,y) within it's boundaries.
 * @param {object}  rect  Object with properties: x, y, width, height.
 * @param {number}  x     Coordinate position x.
 * @param {number}  y     Coordinate position y.
 * @return {boolean}
 */
window.utils.containsPoint = function(rect, x, y) {
    return !(x < rect.x ||
        x > rect.x + rect.width ||
        y < rect.y ||
        y > rect.y + rect.height);
};

/**
 * Determine if two rectangles overlap.
 * @param {object}  rectA Object with properties: x, y, width, height.
 * @param {object}  rectB Object with properties: x, y, width, height.
 * @return {boolean}
 */
window.utils.intersects = function(rectA, rectB) {
    return !(rectA.x + rectA.width < rectB.x ||
        rectB.x + rectB.width < rectA.x ||
        rectA.y + rectA.height < rectB.y ||
        rectB.y + rectB.height < rectA.y);
};

window.utils.interpolateColor = function(colorA, colorB) {
	var interpolation = -1,
		difference = Math.abs(colorA - colorB);

	if (difference > 0.5) {
		interpolation = (colorA > colorB ? colorA : colorB) + (1 - difference) / 2;

		if (interpolation > 1) {
			interpolation -= 1;
		}

	}
	else {
		interpolation = (colorA + colorB) / 2;
	}

	return interpolation;
};

window.utils.rgb2hex = function(rgb) {
	rgb.r |= 0;
	rgb.g |= 0;
	rgb.b |= 0;

	var r = rgb.r.toString(16);
	var g = rgb.g.toString(16);
	var b = rgb.b.toString(16);

	r = r.length === 1 ? "0" + r : r;
	g = g.length === 1 ? "0" + g : g;
	b = b.length === 1 ? "0" + b : b;

	return "#" + r.substr(0, 2) + g.substr(0, 2) + b.substr(0, 2);
};

window.utils.hsv2rgb = function(h, s, v) {
	var r, g, b, i, f, p, q, t;
	if (h && s === undefined && v === undefined) {
		s = h.s, v = h.v, h = h.h;
	}
	i = Math.floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);
	switch (i % 6) {
		case 0:
			r = v, g = t, b = p;
			break;
		case 1:
			r = q, g = v, b = p;
			break;
		case 2:
			r = p, g = v, b = t;
			break;
		case 3:
			r = p, g = q, b = v;
			break;
		case 4:
			r = t, g = p, b = v;
			break;
		case 5:
			r = v, g = p, b = q;
			break;
	}
	return {
		r: Math.floor(r * 255),
		g: Math.floor(g * 255),
		b: Math.floor(b * 255)
	};
};

window.utils.hex2rgb = function(h) {
	var hex = h.toString().substr(1);
	var r = parseInt(hex[0] + hex[1], 16);
	var g = parseInt(hex[2] + hex[3], 16);
	var b = parseInt(hex[4] + hex[5], 16);

	return {
		r: r,
		g: g,
		b: b
	};
};


window.utils.hue2hex = function(hue) {
	var rgb = utils.hsv2rgb(hue, 1, 1);
	var hex = utils.rgb2hex(rgb);
	return hex;
};

if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun/*, thisArg*/) {
    'use strict';

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== 'function') {
      throw new TypeError();
    }

    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];

        // NOTE: Technically this should Object.defineProperty at
        //       the next index, as push can be affected by
        //       properties on Object.prototype and Array.prototype.
        //       But that method's new, and collisions should be
        //       rare, so use the more-compatible alternative.
        if (fun.call(thisArg, val, i, t)) {
          res.push(val);
        }
      }
    }

    return res;
  };
}