function FixedBox(universe, location) {
    Mover.call(this, universe, location);
    this.graphic;
    var random = Math.random() * 2 - 1;
    this.direction = 1;
    if (random > 0) {
        this.direction = 1
    } else {
        this.direction = (-1)
    }
    this.angle = Math.PI / 2 + Math.random() * Math.PI / 3 - Math.PI / 6;
    this.location.z = Math.random() * this.universe.height - this.universe.height / 2;
    this.location.x = Math.random() * this.universe.width - this.universe.width / 2;

    if (this.universe.showGraphics) {
        this.GroundRaycaster = new THREE.Raycaster(new THREE.Vector3(this.location.x, 500, this.location.z), (new THREE.Vector3(0, -1, 0)).normalize());
        var intersects = this.GroundRaycaster.intersectObject(this.universe.terrain);

        if (intersects.length > 0) {
            this.location.y = intersects[0].point.y
        }
        this.graphic = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshNormalMaterial());


        this.graphic.position.set(this.location.x, this.location.y, this.location.z);

        this.graphic.rotation.y = this.angle;
        this.universe.scene.add(this.graphic);
    }
}
inherits(Mover, FixedBox);







function MovingWall(universe, location) {
    Mover.call(this, universe, location);
    this.graphic;
    var random = Math.random() * 2 - 1;
    this.direction = 1;
    if (random > 0) {
        this.direction = 1
    } else {
        this.direction = (-1)
    }
    this.location.z = Math.random() * this.universe.height - this.universe.height / 2;
    this.location.x = -500 * this.direction;

    this.GroundRaycaster = new THREE.Raycaster(new THREE.Vector3(this.location.x, 500, this.location.z), (new THREE.Vector3(0, -1, 0)).normalize());
    var intersects = this.GroundRaycaster.intersectObject(this.universe.terrain);

    if (intersects.length > 0) {
        this.location.y = intersects[0].point.y
    }
    this.graphic = new THREE.Mesh(new THREE.BoxGeometry(500, 200, 10), new THREE.MeshNormalMaterial());


    this.graphic.position.set(this.location.x, this.location.y, this.location.z);

    this.angle = Math.PI / 2 + Math.random() * Math.PI / 3 - Math.PI / 6;
    this.graphic.rotation.y = this.angle;

    this.universe.scene.add(this.graphic);
}
inherits(Mover, MovingWall);


Mover.prototype.getNewLocation = function() {
    var oldLocation = new THREE.Vector3(0, 0, 0);
    oldLocation.copy(this.location);
    var vVector = new THREE.Vector3(0, 0, 0);
    vVector.copy(this.velocity);
    var aVector = new THREE.Vector3(0, 0, 0);
    aVector.copy(this.acceleration);


    var newLocation = new THREE.Vector3(0, 0, 0);
    newLocation.copy(oldLocation);

    this.velocity.add(aVector.multiplyScalar(universe.timeStep));
    newLocation.add(vVector.multiplyScalar(universe.timeStep));

    return newLocation;
}

MovingWall.prototype.move = function() {
    if (this.graphic) {
        var newPosition = this.getNewLocation();
        this.location = newPosition;
        this.graphic.position.set(this.location.x, this.location.y, this.location.z)
    }
};

MovingWall.prototype.update = function() {
    // this.acceleration.multiplyScalar(0);
    var speed = 5 * this.direction;
    this.velocity = new THREE.Vector3(speed * Math.sin(this.angle), 0, speed * Math.cos(this.angle));
    this.move();

};
