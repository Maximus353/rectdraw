/**
 * CargoLoad2 - Optimal Rectangle Packing Algorithm
 * Implements the MaxRects algorithm with Best-Short-Side-Fit heuristic.
 */

class Rectangle {
    constructor(width, height, label = '', id = null) {
        this.w = width;
        this.h = height;
        this.label = label;
        this.x = 0;
        this.y = 0;
        this.id = id || Math.random().toString(36).substr(2, 9);
        this.color = getColorForLabel(label);
    }
}

const labelColorMap = new Map();
function getColorForLabel(label) {
    if (!label) return `hsl(${Math.random() * 360}, 70%, 60%)`;
    if (!labelColorMap.has(label)) {
        labelColorMap.set(label, `hsl(${Math.random() * 360}, 70%, 60%)`);
    }
    return labelColorMap.get(label);
}

class MaxRectsPacker {
    constructor(width, height) {
        this.binWidth = width;
        this.binHeight = height;
        this.usedRectangles = [];
        this.freeRectangles = [new Rectangle(width, height)];
    }

    pack(rectangles) {
        this.usedRectangles = [];
        this.freeRectangles = [
            { x: 0, y: 0, w: this.binWidth, h: this.binHeight }
        ];

        // Sort rectangles by area (descending) for better packing efficiency
        const sorted = [...rectangles].sort((a, b) => (b.w * b.h) - (a.w * a.h));

        for (const rect of sorted) {
            this.placeRectangle(rect);
        }
    }

    placeRectangle(rect) {
        let bestNode = null;
        let bestShortSideFit = Infinity;
        let bestLongSideFit = Infinity;

        // Find the best free rectangle for this rect
        for (const freeRect of this.freeRectangles) {
            if (freeRect.w >= rect.w && freeRect.h >= rect.h) {
                let leftoverHorizontal = Math.abs(freeRect.w - rect.w);
                let leftoverVertical = Math.abs(freeRect.h - rect.h);
                let shortSideFit = Math.min(leftoverHorizontal, leftoverVertical);
                let longSideFit = Math.max(leftoverHorizontal, leftoverVertical);

                if (shortSideFit < bestShortSideFit || (shortSideFit === bestShortSideFit && longSideFit < bestLongSideFit)) {
                    bestNode = { x: freeRect.x, y: freeRect.y, w: rect.w, h: rect.h };
                    bestShortSideFit = shortSideFit;
                    bestLongSideFit = longSideFit;
                }
            }

            // Try rotation (optional, but requested "optimal", so we should consider it)
            if (freeRect.w >= rect.h && freeRect.h >= rect.w) {
                let leftoverHorizontal = Math.abs(freeRect.w - rect.h);
                let leftoverVertical = Math.abs(freeRect.h - rect.w);
                let shortSideFit = Math.min(leftoverHorizontal, leftoverVertical);
                let longSideFit = Math.max(leftoverHorizontal, leftoverVertical);

                if (shortSideFit < bestShortSideFit || (shortSideFit === bestShortSideFit && longSideFit < bestLongSideFit)) {
                    bestNode = { x: freeRect.x, y: freeRect.y, w: rect.h, h: rect.w };
                    bestShortSideFit = shortSideFit;
                    bestLongSideFit = longSideFit;
                }
            }
        }

        if (bestNode) {
            this.splitFreeRectangles(bestNode);
            rect.x = bestNode.x;
            rect.y = bestNode.y;
            rect.actualW = bestNode.w; // might be rotated
            rect.actualH = bestNode.h;
            this.usedRectangles.push(rect);
            return true;
        }

        return false;
    }

    splitFreeRectangles(usedNode) {
        let newFreeRects = [];
        for (const freeRect of this.freeRectangles) {
            if (this.isOverlapping(freeRect, usedNode)) {
                // Split into up to 4 smaller rectangles
                if (usedNode.x < freeRect.x + freeRect.w && usedNode.x + usedNode.w > freeRect.x) {
                    // New rect above
                    if (usedNode.y > freeRect.y && usedNode.y < freeRect.y + freeRect.h) {
                        newFreeRects.push({ x: freeRect.x, y: freeRect.y, w: freeRect.w, h: usedNode.y - freeRect.y });
                    }
                    // New rect below
                    if (usedNode.y + usedNode.h < freeRect.y + freeRect.h) {
                        newFreeRects.push({ x: freeRect.x, y: usedNode.y + usedNode.h, w: freeRect.w, h: freeRect.y + freeRect.h - (usedNode.y + usedNode.h) });
                    }
                }

                if (usedNode.y < freeRect.y + freeRect.h && usedNode.y + usedNode.h > freeRect.y) {
                    // New rect left
                    if (usedNode.x > freeRect.x && usedNode.x < freeRect.x + freeRect.w) {
                        newFreeRects.push({ x: freeRect.x, y: freeRect.y, w: usedNode.x - freeRect.x, h: freeRect.h });
                    }
                    // New rect right
                    if (usedNode.x + usedNode.w < freeRect.x + freeRect.w) {
                        newFreeRects.push({ x: usedNode.x + usedNode.w, y: freeRect.y, w: freeRect.x + freeRect.w - (usedNode.x + usedNode.w), h: freeRect.h });
                    }
                }
            } else {
                newFreeRects.push(freeRect);
            }
        }

        // Clean up redundant free rectangles
        this.freeRectangles = this.pruneFreeList(newFreeRects);
    }

    isOverlapping(r1, r2) {
        return !(r1.x >= r2.x + r2.w || r1.x + r1.w <= r2.x || r1.y >= r2.y + r2.h || r1.y + r1.h <= r2.y);
    }

    pruneFreeList(list) {
        // Remove rectangles that are fully contained within others
        for (let i = 0; i < list.length; i++) {
            for (let j = i + 1; j < list.length; j++) {
                if (this.isContainedIn(list[i], list[j])) {
                    list.splice(i, 1);
                    i--;
                    break;
                }
                if (this.isContainedIn(list[j], list[i])) {
                    list.splice(j, 1);
                    j--;
                }
            }
        }
        return list;
    }

    isContainedIn(r1, r2) {
        return r1.x >= r2.x && r1.y >= r2.y && r1.x + r1.w <= r2.x + r2.w && r1.y + r1.h <= r2.y + r2.h;
    }
}

// UI State & Elements
let rectanglesToAdd = [];
let lastPlacedRectangles = []; // For persistence on resize
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const rectListEl = document.getElementById('rectList');
const roomWidthInput = document.getElementById('roomWidth');
const roomHeightInput = document.getElementById('roomHeight');
const lockRatioCheckbox = document.getElementById('lockRatio');
const statsEl = document.getElementById('stats');

let currentRatio = parseInt(roomWidthInput.value) / parseInt(roomHeightInput.value);

roomWidthInput.addEventListener('input', () => {
    if (lockRatioCheckbox.checked) {
        const newW = parseInt(roomWidthInput.value);
        if (newW > 0) {
            roomHeightInput.value = Math.round(newW / currentRatio);
        }
    } else {
        updateRatio();
    }
    draw(lastPlacedRectangles); // Redraw with last packing
});

roomHeightInput.addEventListener('input', () => {
    if (lockRatioCheckbox.checked) {
        const newH = parseInt(roomHeightInput.value);
        if (newH > 0) {
            roomWidthInput.value = Math.round(newH * currentRatio);
        }
    } else {
        updateRatio();
    }
    draw(lastPlacedRectangles); // Redraw with last packing
});

lockRatioCheckbox.addEventListener('change', () => {
    if (lockRatioCheckbox.checked) {
        updateRatio();
    }
});

function updateRatio() {
    const w = parseInt(roomWidthInput.value);
    const h = parseInt(roomHeightInput.value);
    if (w > 0 && h > 0) {
        currentRatio = w / h;
    }
}

function updateRectList() {
    rectListEl.innerHTML = '';
    rectanglesToAdd.forEach((r, index) => {
        const item = document.createElement('div');
        item.className = 'rect-item';
        const labelText = r.label ? ` (${r.label})` : '';
        item.innerHTML = `
            <span style="width: 12px; height: 12px; border-radius: 3px; background: ${r.color}"></span>
            ${r.w}x${r.h}cm${labelText}
            <span class="remove" onclick="removeRect(${index})">✕</span>
        `;
        rectListEl.appendChild(item);
    });
    document.getElementById('totalCount').innerText = rectanglesToAdd.length;
}

window.removeRect = (index) => {
    rectanglesToAdd.splice(index, 1);
    updateRectList();
};

document.getElementById('addRect').addEventListener('click', () => {
    const w = parseInt(document.getElementById('rectWidth').value);
    const h = parseInt(document.getElementById('rectHeight').value);
    const label = document.getElementById('rectLabel').value;
    const count = parseInt(document.getElementById('rectCount').value);

    if (w > 0 && h > 0 && count > 0) {
        for (let i = 0; i < count; i++) {
            rectanglesToAdd.push(new Rectangle(w, h, label));
        }
        updateRectList();
        document.getElementById('rectLabel').value = '';
    }
});

document.getElementById('clearAll').addEventListener('click', () => {
    rectanglesToAdd = [];
    lastPlacedRectangles = [];
    updateRectList();
    draw([]);
});

document.getElementById('packAll').addEventListener('click', () => {
    const roomW = parseInt(roomWidthInput.value);
    const roomH = parseInt(roomHeightInput.value);

    const packer = new MaxRectsPacker(roomW, roomH);
    packer.pack(rectanglesToAdd);

    lastPlacedRectangles = packer.usedRectangles;
    draw(lastPlacedRectangles, roomW, roomH);

    // Update stats
    const totalArea = roomW * roomH;
    const usedArea = packer.usedRectangles.reduce((sum, r) => sum + (r.w * r.h), 0);
    const waste = ((totalArea - usedArea) / totalArea * 100).toFixed(1);

    document.getElementById('wasteValue').innerText = waste;
    document.getElementById('placedCount').innerText = packer.usedRectangles.length;
});

function draw(placedRects, roomW, roomH) {
    if (!roomW || !roomH) {
        roomW = parseInt(roomWidthInput.value) || 10;
        roomH = parseInt(roomHeightInput.value) || 10;
    }

    // High DPI Support & Precise Scaling
    const dpr = window.devicePixelRatio || 1;
    const paddingL = 60; // Space for left ruler
    const paddingT = 50; // Space for top ruler
    const paddingR = 30; // Margin right
    const paddingB = 30; // Margin bottom

    const availableW = canvas.parentElement.clientWidth - paddingL - paddingR;
    const availableH = 600 - paddingT - paddingB; // Balanced height

    // Scale must be identical for both axes to prevent distortion
    const scale = Math.min(availableW / roomW, availableH / roomH);

    // Calculate final display dimensions
    const displayW = roomW * scale + paddingL + paddingR;
    const displayH = roomH * scale + paddingT + paddingB;

    // Set internal resolution (DPR aware)
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;

    // Set display size via CSS
    canvas.style.width = `${displayW}px`;
    canvas.style.height = `${displayH}px`;

    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayW, displayH);

    // Origin for room drawing
    const offsetX = paddingL;
    const offsetY = paddingT;

    // Draw Rulers
    drawRulers(ctx, roomW, roomH, scale, offsetX, offsetY);

    // Draw Room Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, roomW * scale, roomH * scale);

    // Draw Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridStep = 50;
    for (let i = 0; i <= roomW; i += gridStep) {
        ctx.beginPath();
        ctx.moveTo(offsetX + i * scale, offsetY);
        ctx.lineTo(offsetX + i * scale, offsetY + roomH * scale);
        ctx.stroke();
    }
    for (let i = 0; i <= roomH; i += gridStep) {
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY + i * scale);
        ctx.lineTo(offsetX + roomW * scale, offsetY + i * scale);
        ctx.stroke();
    }

    // Draw Rectangles
    placedRects.forEach(r => {
        const rx = offsetX + r.x * scale;
        const ry = offsetY + r.y * scale;
        const rw = r.actualW * scale;
        const rh = r.actualH * scale;

        ctx.fillStyle = r.color;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(rx, ry, rw, rh);

        ctx.strokeStyle = 'white';
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = 1;
        ctx.strokeRect(rx, ry, rw, rh);

        // Label
        if (rw > 35 && rh > 25) {
            ctx.fillStyle = 'white';
            ctx.font = '600 11px Outfit';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const centerX = rx + rw / 2;
            const centerY = ry + rh / 2;

            if (r.label) {
                ctx.fillText(r.label, centerX, centerY - 6);
                ctx.font = '400 9px Outfit';
                ctx.fillText(`${r.actualW}x${r.actualH}cm`, centerX, centerY + 8);
            } else {
                ctx.fillText(`${r.actualW}x${r.actualH}cm`, centerX, centerY);
            }
        }
    });
}

function drawRulers(ctx, roomW, roomH, scale, offsetX, offsetY) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px Outfit';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;

    const step = 50; // Mark every 50cm
    const smallStep = 10; // Tick every 10cm

    // Top Ruler (Länge)
    for (let i = 0; i <= roomW; i += smallStep) {
        const x = offsetX + i * scale;
        const tickSize = (i % step === 0) ? 10 : 5;
        ctx.beginPath();
        ctx.moveTo(x, offsetY);
        ctx.lineTo(x, offsetY - tickSize);
        ctx.stroke();

        if (i % step === 0) {
            ctx.textAlign = 'center';
            ctx.fillText(`${i}`, x, offsetY - 15);
        }
    }
    // "cm" Label for top ruler
    ctx.fillText('cm', offsetX + roomW * scale + 15, offsetY - 5);

    // Left Ruler (Breite)
    for (let i = 0; i <= roomH; i += smallStep) {
        const y = offsetY + i * scale;
        const tickSize = (i % step === 0) ? 10 : 5;
        ctx.beginPath();
        ctx.moveTo(offsetX, y);
        ctx.lineTo(offsetX - tickSize, y);
        ctx.stroke();

        if (i % step === 0) {
            ctx.textAlign = 'right';
            ctx.fillText(`${i}`, offsetX - 15, y + 3);
        }
    }
    // "cm" Label for left ruler
    ctx.fillText('cm', offsetX - 5, offsetY + roomH * scale + 15);
}

// Initial Call
updateRectList();
window.addEventListener('resize', () => draw(lastPlacedRectangles));
