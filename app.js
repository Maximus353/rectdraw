const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');
const widthInput = document.getElementById('rect-width');
const heightInput = document.getElementById('rect-height');
const labelInput = document.getElementById('rect-label');
const colorInput = document.getElementById('rect-color');
const areaWidthInput = document.getElementById('area-width');
const areaHeightInput = document.getElementById('area-height');
const randomColorCheckbox = document.getElementById('random-color');
const clearBtn = document.getElementById('clear-btn');
const deleteBtn = document.getElementById('delete-btn');
const controlsTitle = document.getElementById('controls-title');

let rectangles = [];
let nextId = 1;
let selectedRectIndex = null;
let isDragging = false;
let draggedRectIndex = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

const AREA_OFFSET_X = 40;
const AREA_OFFSET_Y = 40;

// Sync UI with selected rectangle
function updateUIForSelection() {
    if (selectedRectIndex !== null) {
        const rect = rectangles[selectedRectIndex];
        widthInput.value = rect.w;
        heightInput.value = rect.h;
        colorInput.value = rect.color;
        labelInput.value = rect.label || '';
        controlsTitle.innerText = `Rechteck #${rect.id} bearbeiten`;
        deleteBtn.style.display = 'block';
    } else {
        controlsTitle.innerText = 'Neues Rechteck';
        deleteBtn.style.display = 'none';
        // Optional: Reset inputs to defaults if desired
    }
}

// Live Update Selected Rectangle
[widthInput, heightInput, colorInput, labelInput].forEach(input => {
    input.addEventListener('input', () => {
        if (selectedRectIndex !== null) {
            const rect = rectangles[selectedRectIndex];
            const areaW = parseInt(areaWidthInput.value) || 1000;
            const areaH = parseInt(areaHeightInput.value) || 800;

            const oldW = rect.w;
            const oldH = rect.h;
            const oldColor = rect.color;
            const oldLabel = rect.label;

            // Apply new values temporarily
            if (input === widthInput) rect.w = parseInt(widthInput.value) || 10;
            if (input === heightInput) rect.h = parseInt(heightInput.value) || 10;
            if (input === colorInput) rect.color = colorInput.value;
            if (input === labelInput) rect.label = labelInput.value;

            // Check boundaries and collisions
            const hasCollision = rectangles.some((other, idx) => {
                if (idx === selectedRectIndex) return false;
                return checkCollision(rect, other);
            });

            if (hasCollision || !isInsideArea(rect, areaW, areaH)) {
                // Revert
                rect.w = oldW;
                rect.h = oldH;
                rect.color = oldColor;
                rect.label = oldLabel;
            }

            draw();
        }
    });
});

function checkCollision(r1, r2) {
    return r1.x < r2.x + r2.w &&
        r1.x + r1.w > r2.x &&
        r1.y < r2.y + r2.h &&
        r1.y + r1.h > r2.y;
}

function isInsideArea(rect, areaW, areaH) {
    return rect.x >= 0 &&
        rect.y >= 0 &&
        rect.x + rect.w <= areaW &&
        rect.y + rect.h <= areaH;
}

// Resize canvas to fit container
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    draw();
}

window.addEventListener('resize', resizeCanvas);
[areaWidthInput, areaHeightInput].forEach(input => input.addEventListener('input', draw));
resizeCanvas();

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[0 | (Math.random() * 16)];
    }
    return color;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const areaW = parseInt(areaWidthInput.value) || 1000;
    const areaH = parseInt(areaHeightInput.value) || 800;

    // Draw Area Boundary with Offset
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(AREA_OFFSET_X, AREA_OFFSET_Y, areaW, areaH);
    ctx.setLineDash([]); // Reset

    // Draw Rulers/Labels for Area
    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.font = '12px Outfit';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${areaW}px`, AREA_OFFSET_X + areaW + 8, AREA_OFFSET_Y + 4);
    ctx.fillText(`${areaH}px`, AREA_OFFSET_X + 4, AREA_OFFSET_Y + areaH + 8);
    ctx.fillText("0,0", AREA_OFFSET_X - 25, AREA_OFFSET_Y - 15);

    rectangles.forEach((rect, index) => {
        // Selection highlight
        const isSelected = selectedRectIndex === index;

        // Drop shadow settings
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        // Visual position with offset
        const vx = rect.x + AREA_OFFSET_X;
        const vy = rect.y + AREA_OFFSET_Y;

        ctx.fillStyle = rect.color;
        ctx.strokeStyle = isSelected ? '#ffffff' : '#ffffff'; // White for selection (same as base now, but we can stick to white)
        ctx.lineWidth = (draggedRectIndex === index || isSelected) ? 3 : 0;

        ctx.beginPath();
        ctx.roundRect(vx, vy, rect.w, rect.h, 8); // Modern rounded corners
        ctx.fill();
        if (draggedRectIndex === index || isSelected) {
            ctx.stroke();
        }

        // Reset shadow for text
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw ID
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '500 10px Outfit, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`#${rect.id}`, vx + 8, vy + 8);

        // Draw Label (Kenner)
        if (rect.label) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '600 14px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(rect.label, vx + rect.w / 2, vy + rect.h / 2);
        }
    });
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left - AREA_OFFSET_X,
        y: e.clientY - rect.top - AREA_OFFSET_Y
    };
}

function isPointInRect(px, py, rect) {
    return px >= rect.x && px <= rect.x + rect.w &&
        py >= rect.y && py <= rect.y + rect.h;
}

canvas.addEventListener('mousedown', (e) => {
    const pos = getMousePos(e);
    const areaW = parseInt(areaWidthInput.value) || 1000;
    const areaH = parseInt(areaHeightInput.value) || 800;

    // Check if we clicked on an existing rectangle (from top to bottom)
    let found = false;
    for (let i = rectangles.length - 1; i >= 0; i--) {
        if (isPointInRect(pos.x, pos.y, rectangles[i])) {
            isDragging = true;
            draggedRectIndex = i;
            selectedRectIndex = i; // Select on click
            dragOffsetX = pos.x - rectangles[i].x;
            dragOffsetY = pos.y - rectangles[i].y;

            // Move dragged rect to top
            const draggedRect = rectangles.splice(i, 1)[0];
            rectangles.push(draggedRect);
            draggedRectIndex = rectangles.length - 1;
            selectedRectIndex = rectangles.length - 1;

            updateUIForSelection();
            found = true;
            break;
        }
    }

    if (!found) {
        // Deselect if clicked on empty space
        selectedRectIndex = null;
        updateUIForSelection();
        // Create new rectangle
        const w = parseInt(widthInput.value) || 100;
        const h = parseInt(heightInput.value) || 100;
        const color = randomColorCheckbox.checked ? getRandomColor() : colorInput.value;
        const label = labelInput.value;

        const newRect = {
            id: nextId,
            x: pos.x - w / 2,
            y: pos.y - h / 2,
            w: w,
            h: h,
            color: color,
            label: label
        };

        // Boundary Check (Must be fully inside area)
        if (!isInsideArea(newRect, areaW, areaH)) return;

        // Check if new rectangle collides with any existing one
        const hasCollision = rectangles.some(rect => checkCollision(newRect, rect));

        if (!hasCollision) {
            rectangles.push(newRect);
            nextId++;
        }
    }
    draw();
});

window.addEventListener('mousemove', (e) => {
    if (isDragging && draggedRectIndex !== null) {
        const pos = getMousePos(e);
        const rect = rectangles[draggedRectIndex];
        const areaW = parseInt(areaWidthInput.value) || 1000;
        const areaH = parseInt(areaHeightInput.value) || 800;

        // Temporarily store old position
        const oldX = rect.x;
        const oldY = rect.y;

        // Try moving
        rect.x = pos.x - dragOffsetX;
        rect.y = pos.y - dragOffsetY;

        // Constraint within area
        rect.x = Math.max(0, Math.min(rect.x, areaW - rect.w));
        rect.y = Math.max(0, Math.min(rect.y, areaH - rect.h));

        // Check collisions with all OTHER rectangles
        const hasCollision = rectangles.some((other, idx) => {
            if (idx === draggedRectIndex) return false;
            return checkCollision(rect, other);
        });

        // If collision, revert to old position
        if (hasCollision) {
            rect.x = oldX;
            rect.y = oldY;
        }

        draw();
    }
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    draggedRectIndex = null;
    draw();
});

deleteBtn.addEventListener('click', () => {
    if (selectedRectIndex !== null) {
        rectangles.splice(selectedRectIndex, 1);
        selectedRectIndex = null;
        updateUIForSelection();
        draw();
    }
});

clearBtn.addEventListener('click', () => {
    rectangles = [];
    nextId = 1;
    selectedRectIndex = null;
    updateUIForSelection();
    draw();
});

// Initial draw
draw();
