(function(g) {

var render3d = g.render3d = {};
var r3d = g.r3d = {}; // short names

render3d.Vector3d = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

render3d.orthograficProjectionMatrix = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 0]
]

render3d.perspectiveProjectionMatrix = function(distance, z) {
    var z = 1 / (distance - z);
    return [
        [z, 0, 0],
        [0, z, 0],
        [0, 0, 0]
    ]
}

render3d.rotationXMatrix = function(angle) {
    return [
        [1, 0, 0],
        [0, Math.cos(angle), -Math.sin(angle)],
        [0, Math.sin(angle), Math.cos(angle)]
    ]
}
render3d.rotationYMatrix = function(angle) {
    return [
        [Math.cos(angle), 0, -Math.sin(angle)],
        [0, 1, 0],
        [Math.sin(angle), 0, Math.cos(angle)]
    ]
}
render3d.rotationZMatrix = function(angle) {
    return [
        [Math.cos(angle), -Math.sin(angle), 0],
        [Math.sin(angle), Math.cos(angle), 0],
        [0, 0, 1]
    ]
}

render3d.vectorToMatrix = function(vector) {
    var matrix = [];
    for (var i = 0; i < 3; i++) {
        matrix[i] = [];
    }
    matrix[0][0] = vector.x;
    matrix[1][0] = vector.y;
    matrix[2][0] = vector.z;
    return matrix;
}
render3d.matrixToVector = function(matrix) {
    return new render3d.Vector3d(matrix[0][0], matrix[1][0], matrix.length > 2 ? matrix[2][0] : 0);
}

render3d.matrixMultiplication = function(matrix1, matrix2) {
    if (matrix2 instanceof render3d.Vector3d) {
        return render3d.matrixMultiplicationVector(matrix1, matrix2);
    }

    var columnsA = matrix1[0].length;
    var rowsA = matrix1.length;
    var columnsB = matrix2[0].length;
    var rowsB = matrix2.length;

    if (columnsA !== rowsB) {
        return null;
    }

    result = [];
    for (var i1 = 0; i1 < rowsA; i1++) {
        result[i1] = [];
        for (var i2 = 0; i2 < columnsB; i2++) {
            var sum = 0;
            for (var i3 = 0; i3 < columnsA; i3++) {
                sum += matrix1[i1][i3] * matrix2[i3][i2];
            }
            result[i1][i2] = sum;
        }
    }
    return result;
}
render3d.matrixMultiplicationVector = function(matrix, vector) {
    var matrix2 = render3d.vectorToMatrix(vector);
    var result = render3d.matrixMultiplication(matrix, matrix2);
    return render3d.matrixToVector(result);
}
render3d.multiplyVector = function(vector, by) {
    vector.x *= by;
    vector.y *= by;
    vector.z *= by;
}

r3d.vec3d = render3d.Vector3d;
r3d.ortProjMat = render3d.orthograficProjectionMatrix;
r3d.perspProjMat = render3d.perspectiveProjectionMatrix;
r3d.rotXMat = render3d.rotationXMatrix;
r3d.rotYMat = render3d.rotationYMatrix;
r3d.rotZMat = render3d.rotationZMatrix;
r3d.vec2Mat = render3d.vectorToMatrix;
r3d.mat2Vec = render3d.matrixToVector;
r3d.matmul = render3d.matrixMultiplication;
r3d.matmulvec = render3d.matrixMultiplicationVector;
r3d.multVec = render3d.multiplyVector;

})(this);
