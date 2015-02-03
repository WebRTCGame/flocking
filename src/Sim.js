/*jshint camelcase: true, browser:true, maxlen: 100, curly: true, eqeqeq: true, immed: true, latedef: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, maxdepth: 3, maxstatements:20, maxcomplexity: 5 */
/* global $:true, Vector:true, Fish:true, Food:true, Sim:true, sea:true, THREE:true */


document.addEventListener("DOMContentLoaded", function() {

    if (!Detector.webgl) Detector.addGetWebGLMessage();

    var container, stats;


    Sim.threeD.JSONLoader.load(Sim.threeD.jsModel, function(geometry, materials) {

        Sim.threeD.baseMaterials = materials;
        Sim.threeD.geometry = geometry;

        if (do3D) {
            init();
        }

        sea.init();
        RunSimulation();


    });

    function init() {

        container = document.getElementById("webgl"); //document.createElement( 'div' );

        Sim.threeD.initCamera();
        Sim.threeD.initControls();
        Sim.threeD.scene = new THREE.Scene();

        // Grid

        var size = 14,
            step = 1;

        var geometry = new THREE.Geometry();
        var material = new THREE.LineBasicMaterial({
            color: 0x303030
        });

        for (var i = -size; i <= size; i += step) {

            geometry.vertices.push(new THREE.Vector3(-size, -0.04, i));
            geometry.vertices.push(new THREE.Vector3(size, -0.04, i));

            geometry.vertices.push(new THREE.Vector3(i, -0.04, -size));
            geometry.vertices.push(new THREE.Vector3(i, -0.04, size));

        }

        var line = new THREE.Line(geometry, material, THREE.LinePieces);
        Sim.threeD.scene.add(line);

        // Add the COLLADA

        //Sim.threeD.scene.add(Sim.threeD.dae);
        //var clonedDae = dae.clone();
        //scene.add(clonedDae);
        //clonedDae.position.x = 50;

        Sim.threeD.particleLight = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), new THREE.MeshBasicMaterial({
            color: 0xffffff
        }));
        Sim.threeD.scene.add(Sim.threeD.particleLight);

        // Lights
        var ambientLight = new THREE.AmbientLight(0xcccccc);
        Sim.threeD.scene.add(ambientLight);

        var directionalLight = new THREE.DirectionalLight( /*Math.random() * 0xffffff*/ 0xeeeeee);
        directionalLight.position.x = Math.random() - 0.5;
        directionalLight.position.y = Math.random() - 0.5;
        directionalLight.position.z = Math.random() - 0.5;
        directionalLight.position.normalize();
        Sim.threeD.scene.add(directionalLight);

        var pointLight = new THREE.PointLight(0xffffff, 4);
        Sim.threeD.particleLight.add(pointLight);

        Sim.threeD.renderer = new THREE.WebGLRenderer();
        Sim.threeD.renderer.setSize(320, 240);
        //renderer.setSize(container.width,container.height);
        container.appendChild(Sim.threeD.renderer.domElement);

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        container.appendChild(stats.domElement);
        Sim.threeD.camera.lookAt(new THREE.Vector3(150, 0, 150));
        //
        //console.log(dae);
        window.addEventListener('resize', onWindowResize, false);
        //orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    }

    function onWindowResize() {

        Sim.threeD.camera.aspect = window.innerWidth / window.innerHeight;
        Sim.threeD.camera.updateProjectionMatrix();

        //	renderer.setSize( window.innerWidth, window.innerHeight );

    }

    //



    var clock = new THREE.Clock();

    function render() {

        var timer = Date.now() * 0.0005;
        var delta = clock.getDelta();


        Sim.threeD.particleLight.position.x = Math.sin(timer * 4) * 3009;
        Sim.threeD.particleLight.position.y = Math.cos(timer * 5) * 4000;
        Sim.threeD.particleLight.position.z = Math.cos(timer * 4) * 3009;

        if (sea) {
            for (var i = 0; i < Sim.globals.POPULATION; i++) {
                if (sea.population[i].model) {
                    sea.population[i].model.position.x = sea.population[i].location.x;
                    sea.population[i].model.position.z = sea.population[i].location.y;
                    sea.population[i].model.updateAnimation(1000 * delta);
                    sea.population[i].model.updateMatrix();
                }
            }

        }
        THREE.AnimationHandler.update(delta);
        Sim.threeD.renderer.render(Sim.threeD.scene, Sim.threeD.camera);

    }


    
    Sim.renderer.init(document.getElementById("canvas"),800,800);
     //canvas filters: https://developer.mozilla.org/en-US/docs/Web/CSS/filter
    sea.height = 800;
    sea.width = 800;

   
    function RunSimulation() {
        window.requestAnimationFrame(RunSimulation, Sim.renderer.canvas);


        Sim.renderer.run(frame);
    }



    function frame() {
      
        
        Sim.renderer.ctx.clearRect(0, 0, sea.width, sea.height);
        
        sea.update();

        if (do3D) {
            Sim.threeD.controls.update();
            render();
            stats.update();
        }
    }
});
