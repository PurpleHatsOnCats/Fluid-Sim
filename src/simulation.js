import { Add, Sub, Scale, Vector2 } from "./vector2.js";
import {Spring} from "./spring.js"
import { ParticleEmitter } from "./particleEmitter.js";
import {Particle} from "./particle.js";
import { FluidHashGrid } from "./fluidHashGrid.js";
import {Circle, Polygon} from "./shapes.js";
import { DrawUtils } from "./drawUtils.js";
export class Simulation {
    constructor() {
        this.particles = [];
        this.particleEmitters = []
        this.shapes = [];
        this.springs = new Map();

        this.AMOUNT_PARTICLES = 150;
        this.MAX_PARTICLES = 10000;
        this.VELOCITY_DAMPING = 0.99;
        this.GRAVITY = new Vector2(0, 1);

        // relaxation parameters
        this.REST_DESNITY = 50;
        this.K_NEAR = 35;
        this.K = 0.9;
        this.INTERACTION_RADIUS = 50;

        // viscouse parameter
        this.SIGMA = 0.1;
        this.BETA = 0.1;

        // plasticity parameters
        this.GAMMA = 0.5;
        this.PLASTICITY = 0.01;
        this.SPRING_STIFFNESS = 0.5;

        this.fluidHashGrid = new FluidHashGrid(this.INTERACTION_RADIUS);
        this.instantiateParticles();
        this.fluidHashGrid.initialize(this.particles);

        this.emitter = this.createParticleEmitter(
            new Vector2(canvas.width / 2, 200), // pos
            new Vector2(0, -1), // dir
            30,
            1,
            5,
            20
        );
        let circle = new Circle(new Vector2(200, 400,), 100, "orange")
        let polygon = new Polygon([
            new Vector2(600, 600),
            new Vector2(800, 600),
            new Vector2(800, 700),
            new Vector2(600, 700)
        ], "orange");
        this.shapes.push(circle);
        this.shapes.push(polygon);
    }

    createParticleEmitter(position, direction, size, spawnInterval, amount, velocity){
        let emitter = new ParticleEmitter(position, direction, size, spawnInterval, amount, velocity);
        this.particleEmitters.push(emitter);
        return emitter;
    }

    getShapeAt(pos){
        for (let i = 0; i < this.shapes.length; i++) {
            if (this.shapes[i].isPointInside(pos)) {
                return this.shapes[i];
            }
        }
        return null;
    }

    instantiateParticles(){
        let padding = this.INTERACTION_RADIUS/3;
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

    neighbourSearch(mousePos){
        this.fluidHashGrid.clearGrid();
        this.fluidHashGrid.mapParticlesToCell();
    }

    update(dt){
        if (this.rotate) {
            this.emitter.spawn(dt, this.particles);
            this.emitter.rotate(0.01);
        }

        this.neighbourSearch();

        this.applyGravity(dt);

        //this.viscosity(dt);

        this.predictPositions(dt);

        //this.adjustSprings(dt);
        //this.springDisplacement(dt);

        this.doubleDensityRelaxation(dt)

        this.worldBoundary();

        this.computeNextVelocity(dt);
    }

    adjustSprings(dt){
        for (let i = 0; i < this.particles.length; i++) {
            let neighbours = this.fluidHashGrid.getNeighbourOfParticleId(i);
            let particleA = this.particles[i];
            for (let j = 0; j < neighbours.length; j++) {
                let particleB = this.particles[neighbours[j]];
                if (particleA == particleB) {
                    continue;
                }

                // Prevent making too many springs
                let springId = i + neighbours[j] * this.MAX_PARTICLES;
                if (this.springs.has(springId)) {
                    continue;
                }
                let rij = Sub(particleB.position, particleA.position);
                let q = rij.Length() / this.INTERACTION_RADIUS;
                if (q < 1) {
                    let newSpring = new Spring(i, neighbours[j], this.INTERACTION_RADIUS/2);
                    this.springs.set(springId, newSpring);
                }
            }

        }
        for (let [key, spring] of this.springs) {
            let pi = this.particles[spring.particleAIdx];
            let pj = this.particles[spring.particleBIdx];

            let rij = Sub(pi.position, pj.position).Length();
            let Lij = spring.length;
            let d = this.GAMMA * Lij;

            if (rij > Lij + d) { // stretching
                spring.length += dt * this.PLASTICITY * (rij - Lij - d);
            } else if (rij < Lij - d) { // compression
                spring.length -= dt * this.PLASTICITY * (Lij - d - rij);
            }

            if (spring.length > this.INTERACTION_RADIUS) {
                this.springs.delete(key);
            }
        }
    }

    springDisplacement(dt){
        let dtSquared = dt * dt;

        for (let [key, spring] of this.springs) {
            let pi = this.particles[spring.particleAIdx];
            let pj = this.particles[spring.particleBIdx];

            let rij = Sub(pi.position, pj.position);
            let distance = rij.Length();

            if (distance < 0.0001) {
                continue; // prevent explosions
            }

            rij.Normalize();
            let displacementTerm = dtSquared * this.SPRING_STIFFNESS *
                (1 - spring.length / this.INTERACTION_RADIUS) * (spring.length - distance);

            rij = Scale(rij, displacementTerm * 0.5);

            pi.position = Add(pi.position, rij);
            pj.position = Sub(pj.position, rij);
        }
    }

    viscosity(dt){
        for (let i = 0; i < this.particles.length; i++) {
            let neighbours = this.fluidHashGrid.getNeighbourOfParticleId(i);
            let particleA = this.particles[i];

            for (let j = 0; j < neighbours.length; j++) {
                let particleB = this.particles[neighbours[j]];
                if (particleA == particleB) {
                    continue;
                }
                let rij = Sub(particleB.position, particleA.position);
                let velocityA = particleA.velocity;
                let velocityB = particleB.velocity;
                let q = rij.Length() / this.INTERACTION_RADIUS;

                if (q < 1) {
                    rij.Normalize();
                    let u = Sub(velocityA, velocityB).Dot(rij);

                    if (u > 0) {
                        let ITerm = dt * (1 - q) * (this.SIGMA * u + this.BETA * u * u);
                        let I = Scale(rij, ITerm);

                        particleA.velocity = Sub(particleA.velocity, Scale(I, 0.5));
                        particleB.velocity = Add(particleB.velocity, Scale(I, 0.5));
                    }
                }
            }
        }
    }

    doubleDensityRelaxation(dt){
        for (let i = 0; i < this.particles.length; i++) {
            let density = 0;
            let densityNear = 0;
            let neighbours = this.fluidHashGrid.getNeighbourOfParticleId(i);
            let particleA = this.particles[i];

            for (let j = 0; j < neighbours.length; j++) {
                let particleB = this.particles[neighbours[j]];
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
                let particleB = this.particles[neighbours[j]];
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

    applyGravity(dt){
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].velocity = Add(this.particles[i].velocity, Scale(this.GRAVITY, dt));
        }
    }

    predictPositions(dt){
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
        for (let i = 0; i < this.particleEmitters.length; i++) {
            this.particleEmitters[i].draw();
        }
        for (let i = 0; i < this.particles.length; i++) {
            let position = this.particles[i].position;
            let color = this.particles[i].color;
            DrawUtils.drawPoint(position, 3, color);
        }
        for (let i = 0; i < this.shapes.length; i++) {
            this.shapes[i].draw();
        }
        // Draw Springs
        for (let [key, spring] of this.springs) {
            DrawUtils.drawLine(this.particles[spring.particleAIdx].position,this.particles[spring.particleBIdx].position,"rgba(255,0,255,0.02)");
            
        }
    
    }
}