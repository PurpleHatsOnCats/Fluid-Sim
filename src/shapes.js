import { Add, Sub, Scale } from "./vector2.js";
import { DrawUtils } from "./drawUtils.js";

export class Shape {
    constructor(vertices) {
        this.vertices = vertices;
        this.color = "black";

        if (new.target === Shape) {
            throw new TypeError("Cannot construct abstract instance of class Shape");
        }
    }

    isPointInside(position) {
        let isInside = false;
        for (let i = 0; i < this.vertices.length; i++) {
            let vertex = this.vertices[i];
            let normal = this.normals[i];

            let vertToPoint = Sub(position, vertex);
            let dot = vertToPoint.Dot(normal);
            if (dot > 0) return false;
            else isInside = true;
        }
        return isInside;
    }

    getDirectionOut(pos) {
        let bestNormal = null;
        let smallest = -Number.MAX_VALUE;

        for (let i = 0; i < this.vertices.length; i++) {
            let vertex = this.vertices[i];
            let normal = this.normals[i];

            let vertToPoint = Sub(pos, vertex);
            let dot = vertToPoint.Dot(normal);
            
            if (dot > 0){
                return null;
            }else if(dot > smallest){
                smallest = dot;
                bestNormal = normal.Cpy();
            }
        }

        if(!bestNormal){
            return null;
        }
        return Scale(bestNormal, smallest * -1);
    }

    moveBy(delta) {
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i] = Add(this.vertices[i], delta);
        }
    }

    draw() {
        for (let i = 1; i < this.vertices.length; i++) {
            DrawUtils.drawLine(this.vertices[i - 1], this.vertices[i], this.color);
        }
        DrawUtils.drawLine(this.vertices[this.vertices.length - 1], this.vertices[0], this.color);
    }
}

export class Polygon extends Shape {
    constructor(vertices, color) {
        super(vertices);
        this.color = color;
        this.normals = [];
        // calculate normals
        this.calculateNormals();
    }

    calculateNormals() {
        for (let i = 0; i < this.vertices.length - 1; i++) {
            let direction = Sub(this.vertices[i + 1], this.vertices[i]);
            let normal = direction.GetNormal();
            normal.Normalize();
            this.normals.push(normal);
        }
        let direction = Sub(this.vertices[0], this.vertices[this.vertices.length - 1]);
        let normal = direction.GetNormal();
        normal.Normalize();
        this.normals.push(normal);
    }

    draw() {
        super.draw();
        for (let i = 0; i < this.vertices.length; i++) {
            let start = this.vertices[i];
            let end = Add(start, Scale(this.normals[i], 15));
            //DrawUtils.drawLine(start,end,"red");
        }
    }
}

export class Circle extends Shape {
    constructor(position, radius, color) {
        super([]);
        this.position = position;
        this.radius = radius;
        this.color = color;
    }

    isPointInside(pos) {
        let distance = Sub(pos, this.position).Length();
        return distance < this.radius;
    }

    getDirectionOut(pos) {
        let direction = Sub(pos, this.position);
        if (direction.Length2() < this.radius * this.radius) {
            let penetration = this.radius - direction.Length();
            direction.Normalize();
            direction = Scale(direction, penetration);
            return direction;
        }
        else{
            return null;
        }
        
    }

    moveBy(delta) {
        this.position = Add(this.position, delta);
    }

    draw() {
        DrawUtils.strokePoint(this.position, this.radius, this.color);
    }
}