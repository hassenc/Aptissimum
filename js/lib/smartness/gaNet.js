//Inspired from hardmaru/convnetjs

// Random number utilities
  var return_v = false;
  var v_val = 0.0;
  var gaussRandom = function() {
    if(return_v) { 
      return_v = false;
      return v_val; 
    }
    var u = 2*Math.random()-1;
    var v = 2*Math.random()-1;
    var r = u*u + v*v;
    if(r == 0 || r > 1) return gaussRandom();
    var c = Math.sqrt(-2*Math.log(r)/r);
    v_val = v*c; // cache this
    return_v = true;
    return u*c;
  }
var randf = function(a, b) {
    return Math.random() * (b - a) + a;
}
var randi = function(a, b) {
    return Math.floor(Math.random() * (b - a) + a);
}
var randn = function(mu, std) {
    return mu + gaussRandom() * std;
}


// chromosome implementation using an array of floats
var Chromosome = function(floatArray) {
    this.fitness = 0; // default value
    this.nTrial = 0; // number of trials subjected to so far.
    this.gene = floatArray;
};

Chromosome.prototype = {
    burst_mutate: function(burst_magnitude_) { // adds a normal random variable of stdev width, zero mean to each gene.
        var burst_magnitude = burst_magnitude_ || 0.1;
        var i, N;
        N = this.gene.length;
        for (i = 0; i < N; i++) {
            this.gene[i] += randn(0.0, burst_magnitude);
        }
    },
    randomize: function(burst_magnitude_) { // resets each gene to a random value with zero mean and stdev
        var burst_magnitude = burst_magnitude_ || 0.1;
        var i, N;
        N = this.gene.length;
        for (i = 0; i < N; i++) {
            this.gene[i] = randn(0.0, burst_magnitude);
        }
    },
    mutate: function(mutation_rate_, burst_magnitude_) { // adds random gaussian (0,stdev) to each gene with prob mutation_rate
        var mutation_rate = mutation_rate_ || 0.1;
        var burst_magnitude = burst_magnitude_ || 0.1;
        var i, N;
        N = this.gene.length;
        for (i = 0; i < N; i++) {
            if (randf(0, 1) < mutation_rate) {
                this.gene[i] += randn(0.0, burst_magnitude);
            }
        }
    },
    crossover: function(partner, kid1, kid2) { // performs one-point crossover with partner to produce 2 kids
        //assumes all chromosomes are initialised with same array size. pls make sure of this before calling
        var i, N;
        N = this.gene.length;
        var l = randi(0, N); // crossover point
        for (i = 0; i < N; i++) {
            if (i < l) {
                kid1.gene[i] = this.gene[i];
                kid2.gene[i] = partner.gene[i];
            } else {
                kid1.gene[i] = partner.gene[i];
                kid2.gene[i] = this.gene[i];
            }
        }
    },
    copyFrom: function(c) { // copies c's gene into itself
        var i, N;
        this.copyFromGene(c.gene);
    },
    copyFromGene: function(gene) { // gene into itself
        var i, N;
        N = this.gene.length;
        for (i = 0; i < N; i++) {
            this.gene[i] = gene[i];
        }
    },
    clone: function() { // returns an exact copy of itself (into new memory, doesn't return reference)
        var newGene = zeros(this.gene.length);
        var i;
        for (i = 0; i < this.gene.length; i++) {
            newGene[i] = Math.round(10000 * this.gene[i]) / 10000;
        }
        var c = new Chromosome(newGene);
        c.fitness = this.fitness;
        return c;
    }
};


var GATrainer = function(net, options_, initGene) {

    this.net = net;
    var options = options_ || {};
    this.population_size = typeof options.population_size !== 'undefined' ? options.population_size : 100;
    this.population_size = Math.floor(this.population_size / 2) * 2; // make sure even number
    this.mutation_rate = typeof options.mutation_rate !== 'undefined' ? options.mutation_rate : 0.01;
    this.elite_percentage = typeof options.elite_percentage !== 'undefined' ? options.elite_percentage : 0.2;
    this.mutation_size = typeof options.mutation_size !== 'undefined' ? options.mutation_size : 0.05;
    this.target_fitness = typeof options.target_fitness !== 'undefined' ? options.target_fitness : 10000000000000000;
    this.burst_generations = typeof options.burst_generations !== 'undefined' ? options.burst_generations : 10;
    this.best_trial = typeof options.best_trial !== 'undefined' ? options.best_trial : 1;
    this.num_match = typeof options.num_match !== 'undefined' ? options.num_match : 1;
    this.chromosome_size = this.net.getWeights().length;
    console.log("chromosome size =",this.chromosome_size);

    var initChromosome = null;
    if (initGene) {
        initChromosome = new Chromosome(initGene);
    }

    this.chromosomes = []; // population
    for (var i = 0; i < this.population_size; i++) {
        var chromosome = new Chromosome(zeros(this.chromosome_size));
        if (initChromosome) { // if initial gene supplied, burst mutate param.
            chromosome.copyFrom(initChromosome);
            if (i > 0) { // don't mutate the first guy.
                chromosome.burst_mutate(this.mutation_size);
            }
        } else {
            chromosome.randomize(1.0);
        }
        this.chromosomes.push(chromosome);
    }
    this.net.setWeights(this.chromosomes[0].gene); // push first chromosome to neural network. (replaced *1 above)

    this.bestFitness = -10000000000000000;
    this.bestFitnessCount = 0;

};

