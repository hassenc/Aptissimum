var BoxGame = function(universe) {
    this.universe = universe;
    this.boxes = [];
    this.foodBoxes = [];
    this.timePlayed = 0;
    this.generation = 0;
    this.bestGene;
    this.creatures = [];

    this.bestFitnessCount = 0; // reset count for burst
    this.bestFitness = 0; // record the best fitness score

    this.nbBox = 20;
    this.popInit = 20;
    this.initialLife = 200;
    this.lifeGain = 100;
    this.maxPlayTime = 800;
    this.brainSize = [9, 4, 1];
    // this.initGene = [1.830099685290166, -3.2845037781788116, -3.8219647656195153, -3.391535318454331, -1.6327849434148494, 0.02127550810297918, -1.1329374282924616, 2.513752413002042, 0.6023153714928039, 0.33212494110563506, -2.1197830169858585, 0.5735993638080513, 1.8669254755762361, 0.6964594261067195, 1.1974311649239036, 0.4433262524571656, 2.6336207208896316, -1.3120371359190157, 2.650278875392414, -1.2976846556139623, 2.590146519247789, 1.0630819856739349, 1.084566604282403, -0.8662618927897557, -1.0318534286136856, -0.024776635591247875, 2.084335261548091, 1.9792598597241695, -0.9630745315489011, -2.056079292593327, 1.6271565677090913, -1.5523138704060506, 0.7195434467094086, 0.009601198818927736, 3.0875257459961576, -0.9280148746733579, -1.3906264172319864, 0.8388714498101236, -2.0673621466296863, -3.0843209873434763, 1.0610989010973522, 0.08407770329717923, -2.3519923130834215, 1.4863028979086377, 1.9631492313334387, -0.07229151556793256, 1.3794936330855616, -1.7738599597373734, -1.4576183669954559, -2.998430200997361, -0.6015209047676708, 1.774255263714039, -1.155760785930989, 2.3908665672260487, 1.4186351064525113, -2.035711603864091, -1.1307899263936112, -2.1074393219730765, 1.748634376105719, -1.1463750545498426, -0.24197042149873768, 3.1785777114485074, -0.18194283209511736, 2.001142551538739, 0.11206760218143264, 1.65800161738434, -0.8898948729380427, 2.405727792517558, -1.4318694831204997, 2.698951526610338, 1.5173937316577346, -0.280371723830246, 0.18587052215857758, 1.651787831023503, -0.6518509783184149, -2.635761541253824, 2.675771987001226, -4.980238922089393, -1.1914006517727207, 2.3701308910199055, 4.807426778140593, 3.507964718762361, 3.1668825380680143, -4.923234543142714, -1.1571683371595716, 0.4639482182566256, 2.444173896134413, -4.4915945118201295, 1.1320384410393323, 0.2668320383899879, -4.004650635735304, -4.69704480563199, 2.5479217726772427, 0.775962639251399, -3.4508092405028927, 1.3541470967033684, -0.9053090935668534, 0.41027357886585947, 1.362949048492776, 1.1568094829668387, 2.5185127077794744, -2.303103959001154, 0.580505771268254, -0.3522519525137259, 0.8058684651457972, 0.3256559873273136, 0.37456452292917525, -1.2768823150267927, 2.9625660875968713, -3.4234978011244173, -3.2505181653904485, 2.0306001517163614, -1.8110914732761505, 2.1732361654126313, -5.138209483325457, 1.2609642093248556, 2.7278316999109333, 2.71604483282991, -1.6543639158429109, -0.3675498666531309, -0.2912119683161627, 0.324930354924849, 2.10424485049922, 0.15509048003183273, -4.350387609973147, 0.3979825733506688, 2.2757351002614548, -0.47881466816921725, 0.5074696893662389, 0.29804402135120406, -2.234794925093822, 0.20875657994913435, 1.123959488222494, 1.8286323139739484, 2.4687458767321346, -2.3268244787157446, 2.922669910879224, -0.2338765654425371, 2.0697807002858464, 0.026660457351080774, 0.6525152659858093, 0.5523732587471792, 4.807286203160085, 2.079562762857362, 2.1651472146447577, -0.814787672477401, -1.6432726958504675, -2.025618776218968, -1.3203016467294453, -0.040286506562274504, -0.9727229351705124, 0.7444796751423943, -0.07066759326514405, 2.8057782061642693, -0.45572452445088124]
    this.trainer = new GATrainer(new Network(this.brainSize), {
        population_size: this.popInit,
        mutation_size: 0.3,
        mutation_rate: 0.05,
        num_match: 4 * 2,
        elite_percentage: 0.20,
    }, false);

    for (var i = 0; i < this.nbBox; i++) {
        var fixedBox = new FixedBox(this.universe, new THREE.Vector3(-100, 100, -400));
        this.foodBoxes.push(fixedBox);
    };


    this.survivors = this.trainer.population_size;
    for (var i = 0; i < this.survivors; i++) {
        var creature = new MountainLion(this.universe, new THREE.Vector3(Math.random() * 200, 100, Math.random() * 200));
        if (this.universe.showGraphics) {
            this.universe.scene.add(creature.graphic);
        }
        creature.isAlive = true;
        creature.fitness = 0;
        creature.gene = this.initGene || [];
        creature.life = this.initialLife;
        creature.decision = [0];
        creature.brain = new Network(this.brainSize);
        this.creatures.push(creature);
    };

    for (var i = 0; i < this.creatures.length; i++) {
        this.creatures[i].chromosome = this.trainer.chromosomes[i];
        this.creatures[i].brain.setWeights(this.trainer.chromosomes[i].gene);
    }
}

BoxGame.prototype.trainNetwork = function() {
    var fitnessSort = function(a, b) {
        if (a.fitness > b.fitness) {
            return -1;
        }
        if (a.fitness < b.fitness) {
            return 1;
        }
        return 0;
    };
    this.creatures.sort(fitnessSort)
    this.bestGene = this.creatures[0].chromosome.gene;
    console.log("generation", this.generation)
    console.log("best gene", JSON.stringify(this.bestGene))
    console.log("fitnesses",this.creatures[0].fitness,this.creatures[1].fitness,this.creatures[2].fitness)
    var Nelite = Math.floor(Math.floor(this.trainer.elite_percentage * this.creatures.length) / 2) * 2; // even number
    console.log("Nelite",Nelite)
    for (i = Nelite; i < this.creatures.length; i += 2) {
        var p1 = randi(0, Nelite);
        var p2 = randi(0, Nelite);
        this.creatures[p1].chromosome.crossover(this.creatures[p2].chromosome, this.creatures[i].chromosome, this.creatures[i+1].chromosome);
    }
    for (i = 1; i < this.creatures.length; i++) { // keep best guy the same.  don't mutate the best one, so start from 1, not 0.
        this.creatures[i].chromosome.mutate(this.trainer.mutation_rate, this.trainer.mutation_size);
    }

    var bestFitness = this.creatures[0].fitness;
    console.log("bestFitness", bestFitness, "bestFitnessEver", this.bestFitness, "stagnating for:", this.bestFitnessCount)
    if (bestFitness < this.bestFitness) { // didn't beat the record this time
        this.bestFitnessCount++;
        if (this.bestFitnessCount > this.trainer.burst_generations) { // stagnation, do burst mutate!
            console.log("stagnation")
            for (i = 1; i < this.creatures.length; i++) {
                this.creatures[i].chromosome.copyFrom(this.creatures[0].chromosome);
                this.creatures[i].chromosome.burst_mutate(this.trainer.mutation_size);
            }
        }

    } else {
        this.bestFitnessCount = 0; // reset count for burst
        this.bestFitness = bestFitness; // record the best fitness score
    }

    for (var i = 0; i < this.creatures.length; i++) {
        this.creatures[i].brain.setWeights(this.creatures[i].chromosome.gene)
    };
}

BoxGame.prototype.init = function() {
    for (var i = 0; i < this.boxes.length; i++) {
        if (this.universe.showGraphics) {
            this.universe.scene.remove(this.boxes[i].graphic)
        }
    };
    for (var i = 0; i < this.foodBoxes.length; i++) {
        if (this.universe.showGraphics) {
            this.universe.scene.remove(this.foodBoxes[i].graphic)
        }
    };
    this.boxes = [];
    this.foodBoxes = [];

    this.generation++;
    this.timePlayed = 0;
    this.survivors = this.creatures.length;

    if (this.universe.trainingMode) {
        this.trainNetwork();
    }

    for (var i = 0; i < this.creatures.length; i++) {
        this.creatures[i].location = new THREE.Vector3(Math.random() * 200, 100, Math.random() * 200);
        if (this.universe.showGraphics) {
            this.universe.scene.add(this.creatures[i].graphic);
        }
        this.creatures[i].isAlive = true;
        this.creatures[i].fitness = 0;
        this.creatures[i].life = this.initialLife;
    };

    for (var i = 0; i < this.nbBox; i++) {
        var fixedBox = new FixedBox(this.universe, new THREE.Vector3(-100, 100, -400));
        this.foodBoxes.push(fixedBox);
    };

}

BoxGame.prototype.run = function() {

    // for (var i = this.boxes.length - 1; i >= 0; i--) {
    //     if (this.boxes[i].location.x > this.universe.width / 2 || this.boxes[i].location.x < -this.universe.width / 2 || this.boxes[i].location.z > this.universe.height / 2 || this.boxes[i].location.z < -this.universe.height / 2) {
    //         this.universe.scene.remove(this.boxes[i].graphic)
    //         this.boxes.splice(i, 1);
    //     } else {
    //         this.boxes[i].update();
    //     }
    // }

    // if (this.timePlayed % 40 == 0) {
    //     var fixedBox = new FixedBox(this.universe, new THREE.Vector3(-100, 100, -400));
    //     this.boxes.push(fixedBox);
    // }



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
            this.creatures[i].life--;
            this.creatures[i].doAction(decision);
            this.creatures[i].update();

            // console.log(this.foodBoxes)
            // var collision = this.creatures[i].checkCollision2(this.boxes);
            if (this.creatures[i].life == 0) {
                if (this.universe.showGraphics) {
                    this.universe.scene.remove(this.creatures[i].graphic)
                }
                this.creatures[i].isAlive = false;
                
                console.log("dead")
                this.survivors--;
            }
            for (var j = this.foodBoxes.length - 1; j >= 0; j--) {
                // console.log(this.foodBoxes[j])
                var collision = this.creatures[i].checkCollision2(this.foodBoxes[j]);
                if (collision) {
                    if (this.universe.showGraphics) {
                        this.universe.scene.remove(this.foodBoxes[j].graphic)
                    }

                    this.foodBoxes.splice(j, 1);
                    this.creatures[i].life += this.lifeGain;
                    this.creatures[i].fitness += 1;
                    console.log("got food");
                }
            };


        }
    }
    this.timePlayed++;
    // console.log(this.timePlayed)
    if (this.survivors == 0 || this.timePlayed > this.maxPlayTime) {
        console.log("restart", this.timePlayed, this.survivors)
        this.init();
    }
}
