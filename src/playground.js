class Playground {
    constructor() {
        this.simulation = new Simulation();
    }

    update(dt) {
        this.simulation.update(dt);
    }

    draw() {
        this.simulation.draw();
    }

    onMouseMove(x, y) {
        console.log("Mouse moved to: " + x + ", " + y);
    }

    onMouseDown(button) {
        console.log("Mouse button pressed: " + button);
    }

    onMouseUp(button){
        console.log("Mouse button released: " + button);
    }
}