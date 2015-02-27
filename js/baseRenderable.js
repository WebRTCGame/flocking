/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global Vector:true , Sim:true*/

var BaseRenderable = function(x, y) {
    'use strict';
    if (!(this instanceof BaseRenderable)) {
		return new BaseRenderable(x, y);
	}
    this.location = new Vector(x, y);
    this.init();
};
BaseRenderable.prototype = {
    init: function() {},
    update: function() {},
    render: function() {},
    doUpdate: function(val) {
        'use strict';
        if (!this.dead){
        this.update(val);
        }
    },
    doRender: function() {
        'use strict';
        if (!this.dead){
        Sim.renderer.ctx.save();
        this.render();
        Sim.renderer.ctx.restore();
        }
    },
    dead: false
};

