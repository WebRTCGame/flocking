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
console.log("Starting Script 2");

var terminal = require('child_process').spawn('bash');

terminal.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
});

terminal.on('exit', function (code) {
    console.log('child process exited with code ' + code);
});

setTimeout(function() {
    console.log('Sending stdin to terminal');
    terminal.stdin.write('echo "Hello $USER. Your machine runs since:"\n');
    terminal.stdin.write('uptime\n');
    terminal.stdin.write('git add --all\n');
    console.log('Ending terminal session');
    terminal.stdin.end();
}, 1000);

console.log("Done With Script 2");