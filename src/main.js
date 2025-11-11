import { Playground } from "./playground.js";
import { DrawUtils } from "./drawUtils.js";
import { Vector2 } from "./vector2.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
DrawUtils.ctx = ctx;

let lastTime = performance.now();
let currentTime = 0;
let deltaTime = 0;

let playground = new Playground();

let updatePlayground = (dt) => {
    clear();
    playground.update(dt);
    playground.draw();
}

let mainLoop = () => {
    window.requestAnimationFrame(mainLoop);

    currentTime = performance.now();
    deltaTime = (currentTime - lastTime) / 1000;

    updatePlayground(deltaTime);
    lastTime = currentTime;
}

let clear = () => {
    ctx.fillStyle = "#242321";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

let getMousePos = (canvas, e) => {
    let rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}
let onKeyDown = (e) => {
    playground.onKeyDown(e.keyCode);
}

canvas.addEventListener('mousemove', (e) => {
    let mouse = getMousePos(canvas, event);
    playground.onMouseMove(new Vector2(mouse.x, mouse.y));
}, false);

canvas.addEventListener('mousedown', (e) => {
    playground.onMouseDown(e.button);
}, false);

canvas.addEventListener('mouseup', (e) => {
    playground.onMouseUp(e.button);
}, false);

window.addEventListener('keydown', onKeyDown);

mainLoop();