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
    terminal.stdin.write('git add --all && git commit -m "comment"\n');
    terminal.stdin.write('git push\n');
    console.log('Ending terminal session');
    terminal.stdin.end();
}, 1000);

console.log("Done With Script 2");