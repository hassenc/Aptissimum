var MOUNTAINS_COLORS = {
    Apply: function(inGeometry, inParameters) {
        var step = 1000;
        var colors = inGeometry.getAttribute('color').array;
        var positions = inGeometry.getAttribute('position').array;

        for (var i = 0; i < positions.length; i += 3) {
            var depth = Math.min(1, +0.5 + (0.85 + 0.3 * inParameters.alea.Random()) * 0.8 * Math.round(step * positions[i + 1] / inParameters.depth) / step);

            colors[i] = (depth * depth) * 2;
            colors[i + 1] = depth * 0.2;
            colors[i + 2] = depth * depth * depth * 0.2;
        }
    },

};

var DESTRUCTURE_EFFECT = {
    Apply: function(inGeometry, inParameters) {
        var positions = inGeometry.getAttribute('position').array,
            densityWidth = inParameters.width / inParameters.widthSegments,
            densityHeight = inParameters.height / inParameters.heightSegments,
            densityDepth = inParameters.depth / 255,
            param = 1;
        for (var i = 0; i < positions.length; i++) {
            if (i % 3 == 0) {
                positions[i] += (inParameters.alea.Random() - 0.5) * densityWidth * param;
            } else if (i % 3 == 1) {
                positions[i] += (inParameters.alea.Random() - 0.5) * densityDepth * param;
            } else if (i % 3 == 2) {
                positions[i] += (inParameters.alea.Random() - 0.5) * densityHeight * param;
            }
        }
    },

};

// var DESTRUCTURE_EFFECT =
// {
//     Apply: function( inGeometry, inParameters )
//     {
//         var densityWidth = inParameters.width / inParameters.widthSegments,
//             densityHeight = inParameters.height / inParameters.heightSegments,
//             densityDepth = inParameters.depth / 255,
//             param = 1;

//         for( var i = 0; i < inGeometry.vertices.length; ++i )
//         {
//             var vertex = inGeometry.vertices[i];

//             vertex.x += inParameters.alea.Random() * densityWidth * param;
//             vertex.y += inParameters.alea.Random() * densityDepth * param;
//             vertex.z += inParameters.alea.Random() * densityHeight * param;
//         }
//     },

// };

var BLUR_FILTER = {
    Apply: function(inCanvas, inParameters) {
        boxBlurCanvasRGB(inCanvas, 0, 0, inCanvas.width, inCanvas.height, Math.round(inParameters.filterparam), 2);
    }
};
