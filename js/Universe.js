var Universe = function() {
    this.container, this.stats;
    this.camera, this.controls, this.scene, this.renderer, this.keyboard;
    this.car;
    this.angle = Math.PI / 2;
    this.cross;
    this.timeStep = 1;
    this.cars = [];
    this.morphs = [];
    this.gravity = new THREE.Vector3(0, -10, 0);

    this.width = 1000;
    this.height = 1000;
    // this.car;

    this.fps = 30;
    this.now;
    this.then = Date.now();
    this.interval = 1000 / this.fps;
    this.delta;

    //to detect keyup
    this.upPress = false;
};

Universe.prototype.init = function() {
    this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 100000);
    this.camera.position.set(-200, 20, 200);

    this.controls = new THREE.TrackballControls(this.camera);
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;
    this.controls.noZoom = false;
    this.controls.noPan = false;
    this.controls.staticMoving = true;
    this.controls.dynamicDampingFactor = 0.3;
    this.controls.keys = [65, 83, 68];



    this.scene = new THREE.Scene();

    // LIGHTS

    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.color.setHSL(0.6, 5, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 500, 0);
    this.scene.add(hemiLight);

    //

    var dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(-1, 6, 1);
    dirLight.position.multiplyScalar(500);
    this.scene.add(dirLight);

    dirLight.castShadow = true;

    dirLight.shadowMapWidth = 2048;
    dirLight.shadowMapHeight = 2048;

    var d = 600;

    dirLight.shadowCameraLeft = -d;
    dirLight.shadowCameraRight = d;
    dirLight.shadowCameraTop = d;
    dirLight.shadowCameraBottom = -d;

    dirLight.shadowCameraFar = 3500;
    dirLight.shadowBias = -0.0001;
    dirLight.shadowDarkness = 0.35;
    // dirLight.shadowCameraVisible = true;

    // SKYDOME

    var vertexShader = document.getElementById('vertexShader').textContent;
    var fragmentShader = document.getElementById('fragmentShader').textContent;
    var uniforms = {
        topColor: {
            type: "c",
            value: new THREE.Color(0x0077ff)
        },
        bottomColor: {
            type: "c",
            value: new THREE.Color(0xffffff)
        },
        offset: {
            type: "f",
            value: 33
        },
        exponent: {
            type: "f",
            value: 0.6
        }
    }
    uniforms.topColor.value.copy(hemiLight.color);

    var skyGeo = new THREE.SphereGeometry(4000, 32, 15);
    var skyMat = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: uniforms,
        side: THREE.BackSide
    });

    var sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);



    this.renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapCullFace = THREE.CullFaceBack;
    this.container = document.getElementById('container');
    this.container.appendChild(this.renderer.domElement);

    var loader = new THREE.ObjectLoader();


    // var sLight = new THREE.SpotLight(0xffffff);
    // sLight.position.set(-1000, 1000, 1000);
    // sLight.wrapAround = true;
    // sLight.shadowCameraVisible = true;
    // this.scene.add(sLight);

    // var aLight = new THREE.AmbientLight(0xffffff);
    // aLight.shadowCameraVisible = true;
    // this.scene.add(aLight);




    //add ground
    var grassTex = THREE.ImageUtils.loadTexture('images/grass.png');
    grassTex.wrapS = THREE.RepeatWrapping;
    grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.x = 256;
    grassTex.repeat.y = 256;
    var groundMat = new THREE.MeshBasicMaterial({
        map: grassTex
    });

    var groundGeo = new THREE.PlaneBufferGeometry(400, 400);
    var ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -1.9; //lower it
    ground.rotation.x = -Math.PI / 2; //-90 degrees around the xaxis
    ground.doubleSided = true;
    this.scene.add(ground);

    var inParameters = {
        alea: RAND_MT,
        generator: PN_GENERATOR,
        width: this.width,
        height: this.height,
        widthSegments: 250,
        heightSegments: 250,
        depth: 61,
        param: 4,
        filterparam: 7,
        filter: [BLUR_FILTER],
        postgen: [MOUNTAINS_COLORS],
        // effect: null,
        effect: [DESTRUCTURE_EFFECT],
        canvas: document.getElementById('heightmap'),
    };
    var terrainGeo = TERRAINGEN.Get(inParameters);
    var terrainMaterial = new THREE.MeshPhongMaterial({
        vertexColors: THREE.VertexColors,
        shading: THREE.FlatShading
    });
    this.terrain = new THREE.Mesh(terrainGeo, terrainMaterial);
    this.terrain.castShadow = true;
    this.terrain.receiveShadow = true;

    // this.terrain = ground;
    this.scene.add(this.terrain);



    this.mountainLion = new MountainLion(this, new THREE.Vector3(200, 100, 200));
    this.ent = new Entity(this, new THREE.Vector3(0, 100, 0));
    this.collidablEntitiyList =[];
    this.collidablEntitiyList.push(this.ent.graphic);

    // for (var j = 1; j < 1; j++) {
    //     car = new Car(this);
    //     this.cars.push(car);
    //     this.scene.add(car.graphic);
    // };

    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    this.stats.domElement.style.zIndex = 100;
    this.container.appendChild(this.stats.domElement);
    this.keyboard = new THREEx.KeyboardState();

    this.addEvents();
    this.render();
}

Universe.prototype.addEvents = function() {
    var that = this;
    document.getElementById("CameraButton").addEventListener("click", function() {
        return that.camera3D.call(that)
    });
    this.controls.addEventListener('change', function() {
        return that.render.call(that)
    });
    window.addEventListener('resize', function() {
        return that.onWindowResize.call(that)
    }, false);

}

Universe.prototype.cameraTop = function() {
    this.camera.position.set(-200, 600, 200);
}
Universe.prototype.camera3D = function() {
    this.camera.position.set(-600, 600, 500);
}

Universe.prototype.onWindowResize = function() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.controls.handleResize();
    this.render();
}


Universe.prototype.animate = function() {
    var that = this;
    requestAnimationFrame(function() {
        that.animate();
    });
    this.now = Date.now();
    this.delta = this.now - this.then;

    if (this.delta > this.interval) {
        this.then = this.now - (this.delta % this.interval);
        this.controls.update();
        this.render();
    };
    // for (var i = 0; i < this.morphs.length; i++) {
    // this.morphs[i].updateAnimation(this.delta/10);
    // }
}

Universe.prototype.render = function() {
    var control = this.mountainLion;
    // var control = this.cars[0];
    if (this.keyboard.pressed("left")) {
        control.turn(false)
    }
    if (this.keyboard.pressed("right")) {
        control.turn(true)
    }
    if (this.keyboard.pressed("up")) {
        this.upPress = true;
        control.advance();
    } else {
        if (this.upPress == true) {
            control.releaseUp();
            this.upPress = false;
        }
    }
    if (this.keyboard.pressed("down")) {
        // var nextVelocity =new THREE.Vector3();
        // nextVelocity.copy(control.location);
        // control.location.add(new THREE.Vector3(-Math.sin(this.angle),0,-Math.cos(this.angle)));
    }
    if (this.keyboard.pressed("space")) {
        control.pressSpace();
        // control.velocity.add(new THREE.Vector3(0, 10, 0));
    }
    // if (this.keyboard.pressed("pagedown")) {
    //     control.nomove = true;
    // } else {
    //     control.nomove = false;
    // }
    // if (this.keyboard.pressed("down")) {
    //     console.log("steer")
    //     this.cars[0].steer(new THREE.Vector3(4, 0, 4));
    // }

    this.mountainLion.update();

    this.renderer.render(this.scene, this.camera);
    this.stats.update();
}
