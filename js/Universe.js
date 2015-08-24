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
    this.trainingMode = true;
    this.showGraphics = false;

    this.width = 1000;
    this.height = 1000;
    // this.car;

    this.fps = 30;
    this.now;
    this.then = Date.now();
    this.interval = 90;
    this.delta;

    //to detect keyup
    this.upPress = false;

};

Universe.prototype.addDecoration = function() {
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

    var inParameters = {
        alea: RAND_MT,
        generator: PN_GENERATOR,
        width: this.width,
        height: this.height,
        widthSegments: 250,
        heightSegments: 250,
        depth: 61,
        param: 4,
        filterparam: 1,
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

    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    this.stats.domElement.style.zIndex = 100;
    this.container.appendChild(this.stats.domElement);
    this.keyboard = new THREEx.KeyboardState();
}

Universe.prototype.addControl = function(control) {
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




Universe.prototype.init = function() {
    this.addDecoration();

    this.collidablEntitiyList = [];
    this.game = new BoxGame(this);


    this.addEvents();
    this.render();
}

Universe.prototype.animate = function() {
    var that = this;
    requestAnimationFrame(function() {
        that.animate();
    });
    this.now = Date.now();
    this.delta = this.now - this.then;

    // if (this.delta > this.interval) {
    //     this.then = this.now - (this.delta % this.interval);
        this.controls.update();
        this.render();
    // };
}

Universe.prototype.render = function() {
    // this.addControl(this.game.creatures[0]);
    this.game.run();
    if (this.showGraphics) {
        this.renderer.render(this.scene, this.camera);
    }
    this.stats.update();
}
