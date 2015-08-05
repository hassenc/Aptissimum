// Function wiring prototypes to achieve inheritance
function inherits(Parent, Child) {
  function F() {}
  F.prototype = Parent.prototype;
  Child.prototype = new F();
}




function PinaCollada(modelname, scale) {
    var loader = new THREE.ColladaLoader();
    var localObject;
    loader.options.convertUpAxis = true;
    loader.load( 'models/'+modelname+'.dae', function colladaReady( collada ) {
        localObject = collada.scene;
        localObject.scale.x = localObject.scale.y = localObject.scale.z = scale;
        localObject.updateMatrix();
    } );
    return localObject;
}


// // JSON
// var loader = new THREE.JSONLoader(true);
// loader.load({
//     model: "model.js",
//     callback: function(geometry) {
//         mesh = new THREE.Mesh(geometry,new THREE.MeshFaceMaterial);
//         mesh.position.set(0,0,0);
//         mesh.scale.set(20,20,20);
//         scene.add(mesh);
//         renderer.render(scene, camera);
//     }
// });