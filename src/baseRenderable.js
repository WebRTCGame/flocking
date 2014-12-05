/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global Vector:true */

var BaseRenderable = function(x, y) {
    this.location = new Vector(x, y);
    this.init();
};
BaseRenderable.prototype = {
    init: function() {},
    update: function() {},
    render: function() {},
    doUpdate: function(val) {
        if (!this.dead){
        this.update(val);
        }
    },
    doRender: function() {
        if (!this.dead){
        this.render();
        }
    },
    dead: false
};
