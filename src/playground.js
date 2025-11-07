class Playground {
    constructor() {
        this.simulation = new Simulation();
        this.mousePos = Vector2.Zero();
        this.lastMousePos = Vector2.Zero();
        this.selectedShape = null;
    }

    update(dt) {
        this.simulation.update(0.25);
    }

    draw() {
        this.simulation.draw();

        // DrawUtils.drawLine(Vector2.Zero(), new Vector2(100, 100), "black", 10);
        // DrawUtils.drawPoint(new Vector2(100, 100), 20, "blue");
        // DrawUtils.strokePoint(new Vector2(100,100), 20, "red");
        // DrawUtils.drawRect(new Vector2(200,200), new Vector2(100,100), "green");
        // DrawUtils.drawText(new Vector2(300,300), 20, "white", "Hello World!");
    }
    onMouseMove(position) {
        this.lastMousePos = this.mousePos.Cpy();
        this.mousePos = position;

        if (this.selectedShape) {
            let delta = Sub(this.mousePos, this.lastMousePos);
            this.selectedShape.moveBy(delta);
        }
    }

    onMouseDown(button) {

        if (button === 0) {
            this.selectedShape = this.simulation.getShapeAt(this.mousePos);
        }

    }

    onMouseUp(button) {
        if (button === 0) {
            this.selectedShape = null;
        }
    }

    onKeyDown(key) {
        console.log("Key pressed: " + key);
        this.simulation.rotate = !this.simulation.rotate;
    }
}