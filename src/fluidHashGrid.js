class FluidHashGrid{
    constructor(cellSize){
        this.cellSize = cellSize;
        this.hashMap = new Map();
        this.hashmapSize = 100000000;
        this.prime1 = 6614058611;
        this.prime2 = 7528850467;
        this.particles = [];
    }

    initialize(particles){
        this.particles = particles;
    }

    clearGrid(){
        this.hashMap.clear();
    }

    getGridIdFromPos(pos){
        let x = parseInt(pos.x / this.cellSize);
        let y = parseInt(pos.y / this.cellSize);

        return new Vector2(x,y);
    }

    getGridHashFromPos(pos){
        let x = parseInt(pos.x / this.cellSize);
        let y = parseInt(pos.y / this.cellSize);

        return this.cellIndexToHash(x,y);
    }

    cellIndexToHash(x,y){
        let hash = (x*this.prime1 ^ y * this.prime2) % this.hashmapSize;
        return hash;
    }

    mapParticlesToCell(){
        for(let i=0; i<this.particles.length; i++){
            let pos = this.particles[i].position;
            let hash = this.getGridHashFromPos(pos);

            let entries = this.hashMap.get(hash);
            if(entries == null){
                let newArray = [this.particles[i]];
                this.hashMap.set(hash,newArray);
            }else{
                entries.push(this.particles[i]);
            }
        }
    }

    getContentOfCell(id){
        let content = this.hashMap.get(id);
        if(content == null){
            return [];
        }
        else{
            return content;
        }
    }
}