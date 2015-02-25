console.log("Starting Script");
var fs = require("fs"),
  browserify = require("browserify"),
  babelify = require("babelify");

browserify({
    debug: true
  })
  .transform(babelify.configure({
    experimental: true
  }))
  .require("./main.js", {
    entry: true
  })
  .bundle()
  .on("error", function(err) {
    console.log("Error : " + err.message);
  })
  .pipe(fs.createWriteStream("bundle.js"));

console.log("Done With Script");
