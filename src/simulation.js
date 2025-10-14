class Simulation{
    constructor(){

    }

    update(dt){   

    }

    draw(){
        ctx.beginPath();
        ctx.rect(20,40,50,50);
        ctx.fillStyle="#FFA500";
        ctx.fill();
        ctx.closePath();
    }
}