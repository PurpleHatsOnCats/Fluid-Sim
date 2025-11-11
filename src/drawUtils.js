export class DrawUtils {
    static ctx;

    static drawPoint = (position, radius, color) => {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2, true);
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();

    }

    static strokePoint = (position, radius, color) => {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2, true);
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    }

    static drawLine = (startPosition, endPosition, color, lineThickness = 1) => {
        this.ctx.save();
        this.ctx.lineWidth = lineThickness;
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(startPosition.x, startPosition.y);
        this.ctx.lineTo(endPosition.x, endPosition.y);
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    }

    static drawRect = (start, size, color) => {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.rect(start.x, start.y, size.x, size.y);
        this.ctx.stroke();
        this.ctx.closePath();
    }

    static drawText = (position, size, color, text) => {
        this.ctx.font = size + "px Arial";
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, position.x, position.y);
    }
}