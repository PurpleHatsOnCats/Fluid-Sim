class DrawUtils {
    static drawPoint(position, radius, color) {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(position.x, position.y, radius, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.closePath();
        ctx.restore();

    }

    static strokePoint(position, radius, color) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.arc(position.x, position.y, radius, 0, Math.PI * 2, true);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }

    static drawLine(startPosition, endPosition, color, lineThickness = 1) {
        ctx.save();
        ctx.lineWidth = lineThickness;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(startPosition.x, startPosition.y);
        ctx.lineTo(endPosition.x, endPosition.y);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }

    static drawRect(start, size, color) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.rect(start.x, start.y, size.x, size.y);
        ctx.stroke();
        ctx.closePath();
    }

    static drawText(position, size, color, text) {
        ctx.font = size + "px Arial";
        ctx.fillStyle = color;
        ctx.fillText(text, position.x, position.y);
    }
}