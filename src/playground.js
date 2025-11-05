class Playground {
    constructor() {
        this.simulation = new Simulation();
        this.mousePos = Vector2.Zero();
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
        console.log("Mouse moved to: " + position.x + ", " + position.y);
        this.mousePos = position;
    }

    onMouseDown(button) {
        console.log("Mouse button pressed: " + button);

        if(button == 1){
            this.simulation.rotate = !this.simulation.rotate;
        }
    }

    onMouseUp(button) {
        console.log("Mouse button released: " + button);
    }
}