var MountainLion = function(universe, location, velocity) {
    Mover.call(this, universe, location, velocity);
    this.graphic;
    this.gradient;
    this.nomove = false;
    this.angle = Math.PI / 2;
    var that = this;

    var loader = new THREE.JSONLoader(true);
    loader.load("models/animals/mountainLion.js", function(geometry) {
        morphColorsToFaceColors(geometry);
        geometry.computeMorphNormals();
        morphObject = ROME.Animal(geometry, true);
        var mesh = morphObject.mesh;
        mesh.duration = 1000;
        var s = 0.35;
        mesh.scale.set(s, s, s);
        mesh.rotation.y = that.angle;

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.material.wireframe = false;
        //mesh.materials[0].uniforms.diffuse.value.setHSV( 0.5 + 0.15 * Math.random(), 0.95, 0.95 );
        // mesh.material.uniforms.diffuse.value.setHSV( 0.05, 0.5, 0.85 );
        //mesh.rotation.set( 0, -0.75, 0 );
        mesh.position.set(location.x, location.y, location.z);
        mesh.matrixAutoUpdate = true;
        // mesh.updateMatrix();
        mesh.doubleSided = true;
        that.graphic = mesh;
        that.universe.scene.add(that.graphic);
    });
    this.mass = 10;
    this.isJumping = false;
    this.maxSpeed = 4;
    this.maxForce = 10;
    this.GroundRaycaster = new THREE.Raycaster(new THREE.Vector3(0, 500, 0), (new THREE.Vector3(0, -1, 0)).normalize());
}
inherits(Mover, MountainLion);

MountainLion.prototype.turn = function(isRightTurn) {
    var direction;
    if (isRightTurn) {
        direction = (-1);
    } else {
        direction = 1;
    }
    this.graphic.rotation.y += 0.1 * direction;
    this.angle += 0.1 * direction;
}

MountainLion.prototype.advance = function() {
    this.gradient = this.getGradient();
    this.velocity = this.gradient;
    this.graphic.updateAnimation(100);
}

MountainLion.prototype.releaseUp = function() {
    this.acceleration.multiplyScalar(0);
    this.velocity.multiplyScalar(0);
    this.graphic.time = 44;
    this.graphic.updateAnimation(1);
}

MountainLion.prototype.pressSpace = function() {
    // this.applyForce(new THREE.Vector3(0, 200, 0));
}


MountainLion.prototype.getGradient = function() {
    var pace = 10;
    this.GroundRaycaster = new THREE.Raycaster(new THREE.Vector3(this.location.x - 0 * Math.sin(this.angle), 500, this.location.z - 0 * Math.cos(this.angle)), (new THREE.Vector3(0, -1, 0)).normalize());
    var intersects = this.GroundRaycaster.intersectObject(this.universe.terrain);
    var groundPoint1 = intersects[0].point
    this.GroundRaycaster = new THREE.Raycaster(new THREE.Vector3(this.location.x + pace * Math.sin(this.angle), 500, this.location.z + pace * Math.cos(this.angle)), (new THREE.Vector3(0, -1, 0)).normalize());
    var intersects = this.GroundRaycaster.intersectObject(this.universe.terrain);
    var groundPoint2 = intersects[0].point

    var grad = groundPoint2.sub(groundPoint1);
    return grad
}


MountainLion.prototype.update = function() {
    var groundPoint = -1;
    this.GroundRaycaster = new THREE.Raycaster(new THREE.Vector3(this.location.x, 500, this.location.z), (new THREE.Vector3(0, -1, 0)).normalize());
    var intersects = this.GroundRaycaster.intersectObject(this.universe.terrain);

    if (intersects.length > 0) {
        // this.helper.position.set( 0, 0, 0 );
        // this.helper.lookAt( intersects[0].face.normal );
        // this.helper.position.copy( intersects[0].point );
        groundPoint = intersects[0].point.y
    }
    // this.applyGravity();
    if (Math.abs(this.location.y - groundPoint) > 10) {
        this.location.y = groundPoint;
    }

    this.acceleration.multiplyScalar(0);
    if (this.isSteering) {
        this.steer(this.steeringTarget);
    }
    this.move()
};
