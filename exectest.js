var exec = require('child_process').exec,
runCommand = function (error, stdout, stderr) {
  console.log('stdout: ' + stdout);
  console.log('stderr: ' + stderr);

  if(error !== null) {
    console.log('exec error: ' + error);
  }
},
runCMD = function(command){
    exec(command, runCommand);
};

runCMD('ls -la');