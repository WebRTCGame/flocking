export function sum(x, y) {
    return x + y;
}
export var pi = 3.141593;

let empty = (x) => {
    console.log(x);
    return x + " there!";
};

export {
    empty
}

import {testThis} from "./test4";
import {Vector} from "./Gvector";
import * as V from "./Gvector.js";

console.log(JSON.stringify(V));
console.log(JSON.stringify(V.prototype));
var Vec = new Vector(5,1);

export function createCanvas() {
    document.addEventListener("DOMContentLoaded", (event) => {
        console.log("DOM fully loaded and parsed");
        testThis();
        console.log(JSON.stringify(Vector));
        console.log(JSON.stringify(Vector.prototype));
        var canv = document.createElement('canvas');
        canv.id = 'someId';

        document.body.appendChild(canv);
        return canv;
    });

};

