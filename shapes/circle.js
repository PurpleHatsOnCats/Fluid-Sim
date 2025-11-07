class Circle extends Shape{
    constructor(position, radius, color){
        super([]);
        this.position = position;
        this.radius = radius;
        this.color = color;
    }

    isPointInside(pos){
        let distance = Sub(pos, this.position).Length();
        return distance < this.radius;
    }

    moveBy(delta){
        this.position = Add(this.position,delta);
    }

    draw(){
        DrawUtils.strokePoint(this.position, this.radius, this.color); 
    }
}