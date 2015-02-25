var foo = require('./fun.js');
var test2 = require('./src/test2.js');
console.log(foo(5));
test2(10);

import * as math from "./src/test3.js";
console.log("2π = " + math.sum(math.pi, math.pi));

console.log(math.empty('hello'));

import {createCanvas} from "./src/test3";

var test = createCanvas();