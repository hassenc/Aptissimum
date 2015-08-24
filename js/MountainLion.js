var MountainLion = function(universe, location, velocity) {
    Mover.call(this, universe, location, velocity);
    this.graphic;
    this.gradient;
    this.nomove = false;
    this.angle = -Math.PI / 2;
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
        if (this.universe.showGraphics) {
            that.universe.scene.add(that.graphic);
        }
    });
    this.mass = 10;
    this.isJumping = false;
    this.maxSpeed = 4;
    this.maxForce = 10;
    this.groundRaycaster = new THREE.Raycaster(new THREE.Vector3(0, 500, 0), (new THREE.Vector3(0, -1, 0)).normalize());
}
inherits(Mover, MountainLion);

MountainLion.prototype.turn = function(isRightTurn) {
    var direction;
    if (isRightTurn) {
        direction = (-1);
    } else {
        direction = 1;
    }
    if (this.universe.showGraphics) {
        this.graphic.rotation.y += 0.1 * direction;
    }
    this.angle += 0.1 * direction;
}

MountainLion.prototype.advance = function() {
    // if (this.universe.showGraphics) {
    // this.gradient = this.getGradient();
    // } else {
    this.gradient = new THREE.Vector3(10 * Math.sin(this.angle), 0, 10 * Math.cos(this.angle));
    // }

    this.velocity = this.gradient;
    if (this.universe.showGraphics) {
        this.graphic.updateAnimation(100);
    }
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
    var groundPoint1, groundPoint2, grad
    var pace = 10;
    this.groundRaycaster = new THREE.Raycaster(new THREE.Vector3(this.location.x - 0 * Math.sin(this.angle), 500, this.location.z - 0 * Math.cos(this.angle)), (new THREE.Vector3(0, -1, 0)).normalize());
    var intersects = this.groundRaycaster.intersectObject(this.universe.terrain);
    groundPoint1 = intersects[0].point
    this.groundRaycaster = new THREE.Raycaster(new THREE.Vector3(this.location.x + pace * Math.sin(this.angle), 500, this.location.z + pace * Math.cos(this.angle)), (new THREE.Vector3(0, -1, 0)).normalize());
    var intersects = this.groundRaycaster.intersectObject(this.universe.terrain);
    if (intersects[0]) {
        groundPoint2 = intersects[0].point
    }

    if (groundPoint2 && groundPoint1) {
        grad = groundPoint2.sub(groundPoint1)
    } else {
        grad = new THREE.Vector3(0, 0, 0)
    }
    return grad
}


MountainLion.prototype.update = function() {
    var groundPoint = -1;
    this.groundRaycaster = new THREE.Raycaster(new THREE.Vector3(this.location.x, 500, this.location.z), (new THREE.Vector3(0, -1, 0)).normalize());
    var intersects = this.groundRaycaster.intersectObject(this.universe.terrain);

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



//special walls
// MountainLion.prototype.getSenses = function() {
//     var list = this.universe.game.walls;
//     var sight = [];
//     var eyes = [];
//     var directionVector;
//     var colRaycaster = new THREE.Raycaster(new THREE.Vector3(0, 500, 0), (new THREE.Vector3(0, -1, 0)).normalize());

//     eyes.push(new THREE.Vector3(this.graphic.position.x - Math.cos(this.angle + Math.PI / 3), this.graphic.position.y, this.graphic.position.z + Math.sin(this.angle + Math.PI / 3)));
//     eyes.push(new THREE.Vector3(this.graphic.position.x - Math.cos(this.angle + Math.PI / 3), this.graphic.position.y, this.graphic.position.z - Math.sin(this.angle + Math.PI / 3)));
//     eyes.push(new THREE.Vector3(this.graphic.position.x + Math.cos(this.angle + Math.PI / 3), this.graphic.position.y, this.graphic.position.z - Math.sin(this.angle + Math.PI / 3)));
//     eyes.push(new THREE.Vector3(this.graphic.position.x - Math.cos(this.angle + Math.PI / 3), this.graphic.position.y, this.graphic.position.z - Math.sin(this.angle + Math.PI / 3)));
//     eyes.push(new THREE.Vector3(this.graphic.position.x + 1, this.graphic.position.y, this.graphic.position.z));
//     eyes.push(new THREE.Vector3(this.graphic.position.x - 1, this.graphic.position.y, this.graphic.position.z));
//     eyes.push(new THREE.Vector3(this.graphic.position.x , this.graphic.position.y, this.graphic.position.z+1));
//     eyes.push(new THREE.Vector3(this.graphic.position.x , this.graphic.position.y, this.graphic.position.z-1));

//     for (var eye = 0; eye < eyes.length; eye++) {
//         sight[eye] = 0;
//         directionVector = eyes[eye].sub(this.graphic.position);
//         colRaycaster.set(this.graphic.position, directionVector);
//         for (var i = 0; i < list.length; i++) {
//             var collisionResults = colRaycaster.intersectObject(list[i].graphic);
//             if (collisionResults.length > 0) {
//                 var distance = collisionResults[0].distance;
//                 if (distance <= 1000) {
//                     if (sight[eye] == 0 || sight[eye] > distance) {
//                         // console.log("collision",eye,i)
//                         sight[eye] = (1000-distance)*(1000-distance)/1000;
//                     }
//                 }
//             }
//         }
//     };
//     this.sight= sight.concat(this.decision);
//     return this.sight;
// }
MountainLion.prototype.getSenses = function() {
    var list = this.universe.game.foodBoxes;
    var senses = [];
    var angleDiff = Math.PI / 4;
    for (var k = 0; k < 8; k++) {
        var sightAngle = this.angle + k * angleDiff;
        var directionVector = new THREE.Vector3(Math.cos(sightAngle), 0, Math.sin(sightAngle));
        var closestBoxScore = 0;
        for (var i = 0; i < list.length; i++) {
            var distanceToBox = Math.sqrt(this.getPlanDist2(list[i]));
            if (distanceToBox < 800) {
                var boxVector = new THREE.Vector3(list[i].location.x - this.location.x, 0, list[i].location.z - this.location.z);
                var boxDirection = boxVector.clone();
                var isDirection = boxDirection.dot(directionVector) > 0 ? true : false;
                if (isDirection) {
                    boxVector.cross(directionVector);
                    var crossingDistance = boxVector.length() / directionVector.length();
                    if (crossingDistance < 35) {
                        closestBoxScore = Math.max(closestBoxScore, (1000 - distanceToBox) * (1000 - distanceToBox))
                    }
                }

            }
        };
        senses[k] = closestBoxScore;
    };
    senses = senses.concat(this.decision)
    return senses;
}

MountainLion.prototype.doAction = function(decision) {
    this.advance();
    if (decision[0] > 0.5) {
        this.turn(true)
    } else {
        this.turn(false)
    }

    this.advance();

}
