class Shape{
    constructor(vertices){
        this.vertices = vertices;
        this.color = "black";

        if(new.target === Shape){
            throw new TypeError("Cannot construct abstract instance of class Shape");
        }
    }

    isPointInside(position){
        let isInside = false;
        for(let i = 0; i < this.vertices.length; i++){
            let vertex = this.vertices[i];
            let normal = this.normals[i];

            let vertToPoint = Sub(position,vertex);
            let dot = vertToPoint.Dot(normal); 
            if(dot > 0) return false;
            else isInside = true;
        }
        return isInside;
    }

    moveBy(delta){
        for(let i = 0; i < this.vertices.length; i++){
            this.vertices[i] = Add(this.vertices[i],delta);
        }
    }

    draw(){
        for(let i = 1; i < this.vertices.length; i++){
            DrawUtils.drawLine(this.vertices[i-1],this.vertices[i], this.color);
        }
        DrawUtils.drawLine(this.vertices[this.vertices.length-1],this.vertices[0], this.color);
    }
}