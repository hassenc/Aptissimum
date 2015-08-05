var Universe = function() {
    this.container, this.stats;
    this.camera, this.controls, this.scene, this.renderer, this.keyboard;
    this.car;
    this.timeStep = 1;
    this.cars = [];
    this.gravity = new THREE.Vector3(0, -10, 0);
};

Universe.prototype.init = function() {
    var that = this;
    this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 100000);
    this.camera.position.set(200, 20, -200);

    this.controls = new THREE.TrackballControls(this.camera);
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
        antialias: false
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.container = document.getElementById('container');
    this.container.appendChild(this.renderer.domElement);

    var loader = new THREE.ObjectLoader();
    //add ground
    var grassTex = THREE.ImageUtils.loadTexture('images/grass.png');
    grassTex.wrapS = THREE.RepeatWrapping;
    grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.x = 256;
    grassTex.repeat.y = 256;
    var groundMat = new THREE.MeshBasicMaterial({
        map: grassTex
    });
    var groundGeo = new THREE.PlaneGeometry(400, 400);
    var ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -1.9; 
    ground.rotation.x = -Math.PI / 2; 
    ground.doubleSided = true;
    this.scene.add(ground);

    this.terrain = ground;
    this.scene.add(this.terrain);

    this.car = new Car(this, new THREE.Vector3(0, 0, 0));
    // this.scene.add(this.car.graphic);

    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    this.stats.domElement.style.zIndex = 100;
    this.container.appendChild(this.stats.domElement);

    this.keyboard = new THREEx.KeyboardState();
    this.render();
}

Universe.prototype.animate = function() {
    var that = this;
    requestAnimationFrame(function() {
        that.animate();
    });
    this.render();
}

Universe.prototype.render = function() {
    if (this.keyboard.pressed("left")) {
        this.car.turn(false)
    }
    if (this.keyboard.pressed("right")) {
        this.car.turn(true)
    }
    if (this.keyboard.pressed("up")) {
        this.car.advance();
    }
 
    this.car.update();
    this.renderer.render(this.scene, this.camera);
    this.stats.update();
}
