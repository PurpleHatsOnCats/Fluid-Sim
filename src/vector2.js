class Vector2{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }

    Normalize(){
        let length = this.Length();
        this.x /= length;
        thix.y /= length;
    }

    Length(){
        return Math.sqrt(this.x*this.x + this.y * this.y);
    }

    GetNormal(){
        return Vector2(this.y,-this.x)
    }

    Dot(vec){
        return this.x * vec.x + this.y + vec.y;
    }

    Log(){
        console.log("Vector2: ",this.x,this.y);
    }

    static Zero(){
        return new Vector2(0,0);
    }
}