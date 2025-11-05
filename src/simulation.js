class Simulation {
    constructor() {
        this.particles = [];


        this.AMOUNT_PARTICLES = 2000;
        this.VELOCITY_DAMPING = 0.99;
        this.GRAVITY = new Vector2(0, 1);
        this.REST_DESNITY = 10;
        this.K_NEAR = 3;
        this.K = 0.3;
        this.INTERACTION_RADIUS = 25;

        // viscouse parameter
        this.SIGMA = 0.7;
        this.BETA = 0.00;

        this.fluidHashGrid = new FluidHashGrid(this.INTERACTION_RADIUS);
        this.instantiateParticles();
        this.fluidHashGrid.initialize(this.particles);
    }

    instantiateParticles() {
        let padding = 10;
        let offsetAll = new Vector2(300, 100);

        let xParticles = Math.sqrt(this.AMOUNT_PARTICLES);
        let yParticles = xParticles;

        for (let x = 0; x < xParticles; x++) {
            for (let y = 0; y < yParticles; y++) {
                let position = new Vector2(
                    offsetAll.x + x * padding,
                    offsetAll.y + y * padding);

                let particle = new Particle(position);
                // particle.velocity = Scale(new Vector2(
                //     - 0.5 + Math.random(),
                //     - 0.5 + Math.random()), 200);

                this.particles.push(particle);
            }
        }
    }

    neighbourSearch(mousePos) {
        this.fluidHashGrid.clearGrid();
        this.fluidHashGrid.mapParticlesToCell();
    }

    update(dt) {
        this.applyGravity(dt);

        this.viscosity(dt);

        this.predictPositions(dt);

        this.neighbourSearch();

        this.doubleDensityRelaxation(dt)

        this.worldBoundary();

        this.computeNextVelocity(dt);
    }

    viscosity(dt){
        for (let i = 0; i < this.particles.length; i++) {
            let neighbours = this.fluidHashGrid.getNeighbourOfParticleId(i);
            let particleA = this.particles[i];

            for (let j = 0; j < neighbours.length; j++) {
                let particleB = neighbours[j];
                if (particleA == particleB) {
                    continue;
                }
                let rij = Sub(particleB.position, particleA.position);
                let velocityA = particleA.velocity;
                let velocityB = particleB.velocity;
                let q = rij.Length() / this.INTERACTION_RADIUS;

                if(q < 1){
                    rij.Normalize();
                    let u = Sub(velocityA, velocityB).Dot(rij);

                    if(u > 0){
                       let ITerm = dt * (1-q) * (this.SIGMA * u + this.BETA * u * u); 
                       let I = Scale(rij, ITerm);

                       particleA.velocity = Sub(particleA.velocity, Scale(I, 0.5));
                       particleB.velocity = Add(particleB.velocity, Scale(I, 0.5));
                    }
                }
            }
        }
    }

    doubleDensityRelaxation(dt) {
        for (let i = 0; i < this.particles.length; i++) {
            let density = 0;
            let densityNear = 0;
            let neighbours = this.fluidHashGrid.getNeighbourOfParticleId(i);
            let particleA = this.particles[i];

            for (let j = 0; j < neighbours.length; j++) {
                let particleB = neighbours[j];
                if (particleA == particleB) {
                    continue;
                }
                let rij = Sub(particleB.position, particleA.position);
                let q = rij.Length() / this.INTERACTION_RADIUS;

                if (q < 1.0) {
                    density += Math.pow(1 - q, 2);
                    densityNear += Math.pow(1 - q, 3);
                }
            }
            let pressure = this.K * (density - this.REST_DESNITY);
            let pressureNear = this.K_NEAR * densityNear;
            let particleADisplacement = Vector2.Zero();

            for (let j = 0; j < neighbours.length; j++) {
                let particleB = neighbours[j];
                if (particleA == particleB) {
                    continue;
                }
                let rij = Sub(particleB.position, particleA.position);
                let q = rij.Length() / this.INTERACTION_RADIUS;

                if (q < 1.0) {
                    rij.Normalize();
                    let displacementTerm = Math.pow(dt, 2) *
                        (pressure * (1 - q) + pressureNear * Math.pow(1 - q, 2));
                    let D = Scale(rij, displacementTerm);

                    particleB.position = Add(particleB.position, Scale(D, 0.5));
                    particleADisplacement = Sub(particleADisplacement, Scale(D, 0.5));
                }
            }
            particleA.position = Add(particleA.position, particleADisplacement);
        }
    }

    applyGravity(dt) {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].velocity = Add(this.particles[i].velocity, Scale(this.GRAVITY, dt));
        }
    }

    predictPositions(dt) {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].prevPosition = this.particles[i].position.Cpy();
            let positionDelta = Scale(this.particles[i].velocity, dt * this.VELOCITY_DAMPING);
            this.particles[i].position = Add(this.particles[i].position, positionDelta);
        }
    }

    computeNextVelocity(dt) {
        for (let i = 0; i < this.particles.length; i++) {
            let velocity = Scale(Sub(this.particles[i].position, this.particles[i].prevPosition), 1.0 / dt);
            this.particles[i].velocity = velocity;
        }
    }

    worldBoundary() {
        for (let i = 0; i < this.particles.length; i++) {
            let pos = this.particles[i].position;
            let prevPos = this.particles[i].prevPosition;

            if (pos.x < 0) {
                this.particles[i].position.x = 0;
                this.particles[i].prevPosition.x = 0;
            }
            if (pos.y < 0) {
                this.particles[i].position.y = 0;
                this.particles[i].prevPosition.y = 0;
            }
            if (pos.x > canvas.width) {
                this.particles[i].position.x = canvas.width - 1;
                this.particles[i].prevPosition.x = canvas.width - 1;
            }
            if (pos.y > canvas.height) {
                this.particles[i].position.y = canvas.height - 1;
                this.particles[i].prevPosition.y = canvas.height - 1;
            }
        }
    }

    draw() {
        for (let i = 0; i < this.particles.length; i++) {
            let position = this.particles[i].position;
            let color = this.particles[i].color;
            DrawUtils.drawPoint(position, 3, color);

        }
    }
}