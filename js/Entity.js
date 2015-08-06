function Entity(universe, location) {
    "use strict";
    this.universe = universe;
    this.location = location || new THREE.Vector3(30, 30, 30);
    
    this.GroundRaycaster = new THREE.Raycaster(new THREE.Vector3(this.location.x, 500, this.location.z), (new THREE.Vector3(0, -1, 0)).normalize());
    var intersects = this.GroundRaycaster.intersectObject(this.universe.terrain);

    if (intersects.length > 0) {
        this.location.y = intersects[0].point.y
    }
    this.graphic = new THREE.Mesh(new THREE.BoxGeometry(500, 200, 10), new THREE.MeshNormalMaterial());
    this.graphic.position.set(this.location.x, this.location.y, this.location.z);

    this.universe.scene.add(this.graphic);
}



Entity.prototype.applyGravity = function(counter) {
    var direction = 1;
    if (counter) {
        direction = (-1);
    }
    var gravity = new THREE.Vector3(0, 0, 0);
    gravity.copy(this.universe.gravity);
    gravity.multiplyScalar(this.mass * direction);
    this.applyForce(gravity);
};
