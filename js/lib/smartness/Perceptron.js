var Perceptron = function(n) {
    this.weights = [];
    for (var i = 0; i < n; i++) {
        this.weights.push(Math.random() * 2 - 1)
    };
    this.learningConstant = 0.01;
};

Perceptron.prototype.activate = function(sum) {
    if (sum > 0) {
        return 1
    } else {
        return -1
    }
}

Perceptron.prototype.feedforward = function(inputs) {
    var sum = 0;
    for (var i = 0; i < this.weights.length; i++) {
        sum = sum + this.weights[i] * inputs[i]
    };
    return this.activate(sum)
};


Perceptron.prototype.train = function(inputs, desired) {
    var guess = this.feedforward(inputs);
    var error = desired - guess;
    for (var i = 0; i < this.weights.length; i++) {
        this.weights[i] = this.weights[i] + this.learningConstant * error * inputs[i];
    }
}
