/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global   THREE:true*/
var Sim = {};
Sim.globals = {

        ENERGY: 10,
        MAX_SPEED: 8,
        MAX_FORCE: 0.1,
        SEPARATION_RANGE: 30,
        LOOK_RANGE: 100,
        SMELL_RANGE: 300,
        LENGTH: 20,
        FERTILITY: 0.1,
        BITE: 0.1,
        POPULATION: 5,
        MIN_MASS: 0.5,
        MAX_MASS: 3.5,
        FOOD_RATIO: 0.2,
        SCREEN: 1.5,
        HALF_PI: Math.PI * 0.5,
        TWO_PI: Math.PI * 2


};

Sim.threeD = {
        dae: undefined,
        daeModel: '/threejs/monster.dae',
        jsModel: 'threejs/monster.js',
        container: undefined,
        stats: undefined,
        camera: undefined,
        scene: undefined,
        renderer: undefined,
        objects: undefined,
        particleLight: undefined,
        controls: undefined,
        loader: new THREE.ColladaLoader(),
        JSONLoader: new THREE.JSONLoader(),
        geometry: undefined,
        baseMaterials: undefined
};

Sim.threeD.generateModel = function (color,scale){
        var mats = [];
        for (var i = 0;i<this.baseMaterials.length;i++){
                var mat = this.baseMaterials[i].clone();
                mats.push(mat);
        }
        var thisBaseMat = mats[0];//this.baseMaterial.clone();
        thisBaseMat.morphTargets = true;
        //thisBaseMat.color.setHex(hexColor);
        thisBaseMat.color.set(color);
        thisBaseMat.ambient.set("rgb(128,128,128)");
        var faceMaterial = new THREE.MeshFaceMaterial(mats);
        var model = new THREE.MorphAnimMesh(this.geometry,faceMaterial);
        model.duration = 1000;
        model.time = 1000 * Math.random();
        model.scale.set(scale,scale,scale);
        model.matrixAutoUpdate = false;
        model.updateMatrix();
        this.scene.add(model);
        return model;
};
Sim.threeD.initControls = function() {
        this.controls = new THREE.TrackballControls(Sim.threeD.camera);
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;
        this.controls.noZoom = false;
        this.controls.noPan = false;
        this.controls.staticMoving = true;
        this.controls.dynamicDampingFactor = 0.3;
};
Sim.threeD.initCamera = function() {
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.set(150, 50, 150);
};

Sim.globals.initialFood = Sim.globals.POPULATION * Sim.globals.FOOD_RATIO;
