var Neuron = function(index, layer) {
    this.layer = layer;
    this.output;
    this.network = this.layer.network;

    if (this.layer.index == 0) {

    } else {
        prevSize = this.network.sizes[this.layer.index - 1]
        this.bias = randomWeight();
        this.weights = randos(prevSize);
        this.changes = zeros(prevSize);
    }

}

var Layer = function(index, network) {
    this.index = index;
    this.network = network;
    this.size = network.sizes[index];

    this.nodes = [];

    this.deltas = zeros(this.size);
    this.errors = zeros(this.size);
    this.outputs = [];

    for (var nodeIndex = 0; nodeIndex < this.size; nodeIndex++) {
        this.nodes.push(new Neuron(nodeIndex, this));
    }
}

Layer.prototype.forward = function(input) {
    this.outputs = [];
    for (var j = 0; j < this.nodes.length; j++) {
        this.nodes[j].output = 0;
        for (var k = 0; k < input.length; k++) {
            this.nodes[j].output += this.nodes[j].weights[k] * input[k]; //incoming weights
        };
        this.nodes[j].output += this.nodes[j].bias;
        this.nodes[j].output = 1 / (1 + Math.exp(-this.nodes[j].output));
        this.outputs.push(this.nodes[j].output);
    }
    return this.outputs;
}

var Network = function(sizes) {

    this.sizes = sizes;
    this.layers = [];
    this.allWeights = [];

    for (var layerIndex = 0; layerIndex < sizes.length; layerIndex++) {
        this.layers.push(new Layer(layerIndex, this));
    }
}




Network.prototype.getWeights = function() {
    this.allWeights = [];
    for (var i = 1; i < this.layers.length; i++) {
        for (var j = 0; j < this.layers[i].nodes.length; j++) {
            for (var k = 0; k < this.layers[i].nodes[j].weights.length; k++) {
                this.allWeights.push(this.layers[i].nodes[j].weights[k])
            };
            this.allWeights.push(this.layers[i].nodes[j].bias)
        };
    };
    return this.allWeights;
}

Network.prototype.setWeights = function(weights) {
    var t = 0;
    for (var i = 1; i < this.layers.length; i++) {
        for (var j = 0; j < this.layers[i].nodes.length; j++) {
            for (var k = 0; k < this.layers[i].nodes[j].weights.length; k++) {
                this.layers[i].nodes[j].weights[k] = weights[t];
                t++;
            };
            this.layers[i].nodes[j].bias = weights[t];
            t++;
        };
    };
}

Network.prototype.forward = function(input, target) {
    var outputs = input;
    for (var i = 0; i < this.layers[0].nodes.length; i++) {
        this.layers[0].nodes[i].output = input[i]
    };
    this.layers[0].outputs = input; //important for backprop
    //idea to remove line on top : each neuron has number of inputs, go through them in the 
    //forward function. first layer weight 1 , input 1  neurons ?
    for (var i = 1; i < this.layers.length; i++) {
        outputs = this.layers[i].forward(outputs);
    }

    if (!target) {} else {
        this.calculateDeltas(target);
        this.adjustWeights();
        var e = mse(this.layers[this.sizes.length - 1].errors);
        // console.log("error=", e)
    }
    return outputs;
}


Network.prototype.calculateDeltas = function(target) {
    // console.log("calculateDelates")
    for (var layer = this.sizes.length - 1; layer > 0; layer--) {
        // console.log("layer =", layer)
        for (var node = 0; node < this.sizes[layer]; node++) {
            // console.log("node =", node)
            var output = this.layers[layer].nodes[node].output;
            var error = 0;
            if (layer == this.sizes.length - 1) {
                error = target[node] - output;
            } else {
                var deltas = this.layers[layer + 1].deltas;
                for (var k = 0; k < deltas.length; k++) {
                    error += deltas[k] * this.layers[layer + 1].nodes[k].weights[node];
                }
            }
            this.layers[layer].errors[node] = error;
            this.layers[layer].deltas[node] = error * output * (1 - output);
            // console.log("deltas =", error, output, output * (1 - output), this.layers[layer].deltas[node])
        }
    }
};

Network.prototype.adjustWeights = function() {
    var learningRate = 0.3;
    var momentum = 0.1;
    for (var layer = 1; layer < this.sizes.length; layer++) {
        var incoming = this.layers[layer - 1].outputs;
        for (var node = 0; node < this.layers[layer].size; node++) {
            var delta = this.layers[layer].deltas[node];

            for (var k = 0; k < incoming.length; k++) {
                var change = this.layers[layer].nodes[node].changes[k];
                change = (learningRate * delta * incoming[k]) + (momentum * change);

                this.layers[layer].nodes[node].changes[k] = change;
                this.layers[layer].nodes[node].weights[k] += delta * incoming[k];
            }
            this.layers[layer].nodes[node].bias += learningRate * delta;
        }
    }
};

function randomWeight() {
    return Math.random() * 0.4 - 0.2;
}

function zeros(size) {
    var array = [];
    for (var i = 0; i < size; i++) {
        array.push(0);
    }
    return array;
}

function randos(size) {
    var array = [];
    for (var i = 0; i < size; i++) {
        array.push(randomWeight());
    }
    return array;
}

function mse(errors) {
    // mean squared error
    var sum = 0;
    for (var i = 0; i < errors.length; i++) {
        sum += Math.pow(errors[i], 2);
    }
    return sum / errors.length;
}
