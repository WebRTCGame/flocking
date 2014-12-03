/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global $:true, Vector:true, Fish:true, Food:true, utils:true */

var BaseRenderable = function(x, y) {
    this.location = new Vector(x, y);
};
BaseRenderable.prototype = {
    update: function(ctx) {},
    render: function(ctx) {},
    doUpdate: function(val) {
        this.update(val);
    },
    doRender: function(ctx) {
        this.render(ctx);
    }
};