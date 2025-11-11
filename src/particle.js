import { Vector2 } from "./vector2.js";
export class Particle{
    constructor(position){
        this.position = position;
        this.prevPosition = position;
        this.velocity = Vector2.Zero();
        this.color = "#28b0ff";
    }
}