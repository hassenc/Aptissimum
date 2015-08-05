var Car = function(universe, location, velocity) {
    Mover.call(this, universe, location, velocity);
    this.graphic = new THREE.Mesh(new THREE.BoxGeometry(30, 10, 10), new THREE.MeshNormalMaterial());
    this.mass = 10;
    this.maxSpeed = 4;
    this.maxForce = 10;
    this.angle = Math.PI / 2;
    this.initialForce = new THREE.Vector3(Math.floor(Math.random() * 10 - 5), 0, Math.floor(Math.random() * 10 - 5));
    this.applyForce(this.initialForce);
    this.GroundRaycaster = new THREE.Raycaster(new THREE.Vector3(0, 500, 0), (new THREE.Vector3(0, -1, 0)).normalize());
}
inherits(Mover, Car);

Car.prototype.turn = function(isRightTurn) {
    var direction;
    if (isRightTurn) {
        direction = (-1);
    } else {
        direction = 1;
    }
    this.graphic.rotation.y += 0.1*direction;
    this.angle += 0.1*direction;
    var newV = new THREE.Vector3(Math.sin(this.angle), 0, Math.cos(this.angle));
    var vel1 = (new THREE.Vector3(0, 0, 0)).copy(this.velocity);
    var vel2 = (new THREE.Vector3(0, 0, 0)).copy(this.velocity);
    var velH = vel1.projectOnVector(newV);
    var velV = vel2.projectOnVector(new THREE.Vector3(0, 1, 0));
    this.velocity = velH.add(velV);
}

Car.prototype.advance = function() {
    var vel2 = (new THREE.Vector3(0, 0, 0)).copy(this.velocity);
    var velH = new THREE.Vector3(10*Math.sin(this.angle), 0, 10*Math.cos(this.angle));
    var velV = vel2.projectOnVector(new THREE.Vector3(0, 1, 0));
    this.velocity = velH.add(velV);
    // this.applyForce(new THREE.Vector3(10*Math.sin(this.graphic.rotation.y+Math.PI / 2), 0,10*Math.cos(Math.PI / 2+this.graphic.rotation.y)));
}

Car.prototype.pressSpace = function() {
    this.applyForce(new THREE.Vector3(0, 200, 0)); //no because will be done next frame
}

Car.prototype.update = function() {
    var groundPoint = -1;

    this.GroundRaycaster = new THREE.Raycaster(new THREE.Vector3(this.location.x, 500, this.location.z), (new THREE.Vector3(0, -1, 0)).normalize());
    var intersects = this.GroundRaycaster.intersectObject(this.universe.terrain);
    if (intersects.length > 0) {
        // this.helper.position.set( 0, 0, 0 );
        // this.helper.lookAt( intersects[0].face.normal );
        // this.helper.position.copy( intersects[0].point );
        groundPoint = intersects[0].point.y
    }
    this.applyFriction();
    this.applyGravity();
    if (this.location.y <= groundPoint) {
        this.location.y = groundPoint;
        this.applyGravity(true);
        if (this.velocity.y < 0) {
            this.velocity.y = 0;
        }
    }

    // this.displayVectors();

   

    if (!this.nomove) {
        this.move();
    }
    this.acceleration.multiplyScalar(0);
    if (this.isSteering) {
        this.steer(this.steeringTarget);
    }

    this.graphic.position.x = this.location.x;
    this.graphic.position.y = this.location.y;
    this.graphic.position.z = this.location.z;
};
