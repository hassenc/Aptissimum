function Mover(universe, location, velocity) {
    "use strict";
    this.universe = universe;
    this.location = location || new THREE.Vector3(30, 30, 30);
    this.velocity = velocity || new THREE.Vector3(0, 0, 0);
    this.acceleration = new THREE.Vector3(0, 0, 0);
    this.mass;
    this.maxSpeed;
    this.displayedVectors = [];
    this.graphic; //have to be defined

    //update or not;
    this.needUpdate = false;
}


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

    newLocation.clamp(new THREE.Vector3(-this.universe.width / 2, -100, -this.universe.height / 2), new THREE.Vector3(this.universe.width / 2, 100, this.universe.height / 2));
    this.velocity.clamp(new THREE.Vector3(-this.maxSpeed, -100, -this.maxSpeed), new THREE.Vector3(this.maxSpeed, 100, this.maxSpeed));

    return newLocation;
}

Mover.prototype.move = function() {
    if (this.graphic) {
        var newPosition = this.getNewLocation();
        var collide = this.checkEdges(newPosition);
        if (!collide) {
            this.location = newPosition;
        }
        this.graphic.position.set(this.location.x,this.location.y,this.location.z)
    } else {
        console.warn("no graphic yet")
    }
};

Mover.prototype.checkEdges = function(newPosition) {
    var result = false;
    var colRaycaster = new THREE.Raycaster(new THREE.Vector3(0, 500, 0), (new THREE.Vector3(0, -1, 0)).normalize());
    var mesh = this.graphic;
    var directionP;
    var gradient = new THREE.Vector3(0, 0, 0);

    if (this.gradient) {
        gradient = this.gradient;
    }

    for (var vertexIndex = 0; vertexIndex < mesh.geometry.vertices.length; vertexIndex++) {
        var localVertex = mesh.geometry.vertices[vertexIndex].clone();
        var globalVertex = localVertex.applyMatrix4(mesh.matrix);
        var directionVector = globalVertex.sub(newPosition);
        colRaycaster.set(newPosition, directionVector.clone().normalize());

        var collisionResults = colRaycaster.intersectObjects(this.universe.collidablEntitiyList);
        if (collisionResults.length > 0 && Math.abs(collisionResults[0].distance - directionVector.length()) < 200) {
            directionP = directionVector.dot(gradient);
            if (directionP >= 0) {
                return true;
            }
        }
    }
    return result;
};

Mover.prototype.applyForce = function(force, counter) {
    var direction = 1;
    if (counter) {
        direction = (-1);
    }
    var fVector = new THREE.Vector3(0, 0, 0);
    fVector.copy(force);
    fVector.divideScalar(this.mass * direction);
    if (fVector.length() > this.maxForce) {
        fVector.setLength(this.maxForce);
    }
    this.acceleration.add(fVector)
};

Mover.prototype.getDist2 = function(p) { // returns distance squared from p
    var dy = p.location.y - this.location.y;
    var dx = p.location.x - this.location.x;
    var dz = p.location.z - this.location.z;
    return (dx * dx + dy * dy + dz * dz);
};

Mover.prototype.applyFriction = function() {
    var c = 1;
    var friction = new THREE.Vector3(0, 0, 0);
    friction.copy(this.velocity);
    friction.multiply(new THREE.Vector3(1, 0, 1));
    friction.normalize();
    friction.multiplyScalar(-c);
    this.applyForce(friction);
};

Mover.prototype.applyGravity = function(counter) {
    var direction = 1;
    if (counter) {
        direction = (-1);
    }
    var gravity = new THREE.Vector3(0, 0, 0);
    gravity.copy(this.universe.gravity);
    gravity.multiplyScalar(this.mass * direction);
    this.applyForce(gravity);
};

Mover.prototype.steer = function(target, isFlee) {
    this.isSteering = true;
    this.steeringTarget = target;
    var direction = 1;
    if (isFlee) {
        direction = (-1);
    }
    var desired = new THREE.Vector3(0, 0, 0);
    desired.copy(target);
    desired.sub(this.location);
    var distance = desired.length();
    desired.normalize();
    if ((distance < 1) && (this.velocity.length() < 1)) {
        this.isSteering = false;
    } else if (distance < 100) {
        var m = this.maxSpeed * direction * distance / 100;
        desired.multiplyScalar(m * direction);
    } else {
        desired.multiplyScalar(this.maxSpeed * direction);
    }
    var steer = desired.sub(this.velocity);
    this.applyForce(steer);
};

Mover.prototype.drag = function(coeff) {
    var speed = this.velocity.length();
    var dragMagnitude = coeff * speed * speed;
    var drag = new THREE.Vector3(0, 0, 0);
    drag.copy(this.velocity);
    drag.normalize();
    drag.multiplyScalar(-dragMagnitude);
    this.applyForce(drag);
};


Mover.prototype.displayVector = function(vector, color, offset) {
    var pos = new THREE.Vector3(this.location.x, this.location.y + offset, this.location.z);

    var horPoint = new THREE.Vector3(0, 0, 0);
    horPoint.copy(pos);
    var vectorCopy = new THREE.Vector3(0, 0, 0);
    vectorCopy.copy(vector);
    var vectorCopyX = new THREE.Vector3(0, 0, 0);
    vectorCopyX = vectorCopy.multiply(new THREE.Vector3(1, 0, 1)); //ignore y
    horPoint.add(vectorCopyX.multiplyScalar(10))

    var vertPoint = new THREE.Vector3(0, 0, 0);
    vertPoint.copy(pos);
    var vectorCopy = new THREE.Vector3(0, 0, 0);
    vectorCopy.copy(vector);
    var vectorCopyY = new THREE.Vector3(0, 0, 0);
    vectorCopyY = vectorCopy.multiply(new THREE.Vector3(0, 1, 0)); //ignore x,z
    vertPoint.add(vectorCopyY.multiplyScalar(10))

    var material = new THREE.LineBasicMaterial({
        color: color
    });
    var geometry = new THREE.Geometry();

    var component = {};
    this.horizontalComponent = new THREE.Line(geometry, material);
    this.horizontalComponent.geometry.vertices = [];
    this.horizontalComponent.geometry.vertices.push(pos);
    this.horizontalComponent.geometry.vertices.push(horPoint);
    this.universe.scene.add(this.horizontalComponent);


    var geometry = new THREE.Geometry();
    this.verticalComponent = new THREE.Line(geometry, material);
    this.verticalComponent.geometry.vertices = [];
    this.verticalComponent.geometry.vertices.push(pos);
    this.verticalComponent.geometry.vertices.push(vertPoint);
    this.universe.scene.add(this.verticalComponent);

    this.displayedVectors.push(this.horizontalComponent);
    this.displayedVectors.push(this.verticalComponent);
};


Mover.prototype.displayVectors = function() {
    for (var i = 0; i < this.displayedVectors.length; i++) {
        this.universe.scene.remove(this.displayedVectors[i])
    };
    this.displayVector(this.acceleration, 0x0000ff, 10);
    this.displayVector(this.velocity, 0xff00ff, 12);
}
