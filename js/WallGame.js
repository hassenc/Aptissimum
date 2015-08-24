var WallGame = function(universe) {
    this.universe = universe;
    this.walls = [];
    this.timePlayed = 0;
    this.generation = 0;
    this.bestGene;
    this.creatures = [];



    this.trainer = new GATrainer(new Network([9,10,1]),{
      population_size: 2,
      mutation_size: 0.3,
      mutation_rate: 0.05,
      num_match: 4*2,
      elite_percentage: 0.20
    }, false);

    this.survivors = this.trainer.population_size;
    for (var i = 0; i < this.survivors; i++) {
        var creature = new MountainLion(this.universe,new THREE.Vector3(Math.random() * 200, 100, Math.random() * 200));
        this.universe.scene.add(creature.graphic);
        creature.isAlive = true;
        creature.fitness = 0;
        creature.gene = [];
        creature.decision = [0];
        creature.brain = new Network([9,10,1]);
        this.creatures.push(creature);
    };

    for (var i = 0; i < this.creatures.length; i++) {
        this.creatures[i].chromosome = this.trainer.chromosomes[i];
        this.creatures[i].brain.setWeights(this.trainer.chromosomes[i].gene);
    }
}

WallGame.prototype.trainNetwork = function() {
    var fitnessSort = function(a, b) {
        if (a.fitness > b.fitness) {
            return -1;
        }
        if (a.fitness < b.fitness) {
            return 1;
        }
        return 0;
    };

    this.creatures.sort(fitnessSort);
    this.bestGene = this.creatures[0].chromosome.gene;
    console.log("generation",this.generation)
    console.log("best gene",this.bestGene)
    for (i = 1; i < this.creatures.length; i++) { // keep best guy the same.  don't mutate the best one, so start from 1, not 0.
       this.creatures[i].chromosome.mutate(this.trainer.mutation_rate, this.trainer.mutation_size);
    }
    for (var i = 0; i < this.creatures.length; i++) {
        this.creatures[i].brain.setWeights(this.creatures[i].chromosome.gene)
    };
}

WallGame.prototype.init = function() {
    for (var i = 0; i < this.walls.length; i++) {
        this.universe.scene.remove(this.walls[i].graphic)
    };
    this.walls = [];

    this.generation++;
    this.timePlayed = 0;
    this.survivors = this.creatures.length;
    this.trainNetwork();

    for (var i = 0; i < this.creatures.length; i++) {
        this.creatures[i].location = new THREE.Vector3(Math.random() * 200, 100, Math.random() * 200);
        this.universe.scene.add(this.creatures[i].graphic);
        this.creatures[i].isAlive = true;
        this.creatures[i].fitness = 0;
    };
}

WallGame.prototype.run = function() {

    for (var i = this.walls.length - 1; i >= 0; i--) {
        if (this.walls[i].location.x > this.universe.width / 2 || this.walls[i].location.x < -this.universe.width / 2 || this.walls[i].location.z > this.universe.height / 2 || this.walls[i].location.z < -this.universe.height / 2) {
            this.universe.scene.remove(this.walls[i].graphic)
            this.walls.splice(i, 1);
        } else {
            this.walls[i].update();
        }
    }

    if (this.timePlayed % 40 == 0) {
        var movingWall = new MovingWall(this.universe, new THREE.Vector3(-100, 100, -400));
        this.walls.push(movingWall);
    }
    for (var i = this.creatures.length - 1; i >= 0; i--) {

        if (this.creatures[i].graphic && this.creatures[i].isAlive) {
            var senses = this.creatures[i].getSenses();
            // console.log(this.decision,senses[senses.length-1])
            var decision = this.creatures[i].brain.forward(senses);
            // console.log(i,senses,decision)
            for (var k = 0; k < decision.length; k++) {
                if (decision[k] > 0.5) {
                    decision[k] = 1;
                } else {
                    decision[k] = 0;
                }
            };
            this.decision = decision;
            this.creatures[i].doAction(decision);
            this.creatures[i].update();

            var collision = this.creatures[i].checkCollision(this.walls);
            if (collision) {
                this.universe.scene.remove(this.creatures[i].graphic)
                this.creatures[i].isAlive = false;
                this.creatures[i].fitness = this.timePlayed;
                console.log("dead")
                this.survivors--;
            }
        }
    }
    this.timePlayed++;
    // console.log(this.timePlayed)
    if (this.timePlayed > 500 || this.survivors == 0) {
        console.log("restart",this.timePlayed,this.survivors)
        this.init();
    }
}