export const templates = {
    flowchart: [
        { type: 'rect', x: 200, y: 50, width: 140, height: 60, fill: '#4a86e8', stroke: '#2a5ab8', strokeWidth: 2, label: 'Start' },
        { type: 'rect', x: 200, y: 160, width: 140, height: 60, fill: '#ffffff', stroke: '#333', strokeWidth: 2, label: 'Process' },
        { type: 'diamond', x: 210, y: 270, width: 120, height: 80, fill: '#ffd700', stroke: '#b8960f', strokeWidth: 2, label: 'Decision' },
        { type: 'rect', x: 400, y: 280, width: 120, height: 60, fill: '#90ee90', stroke: '#228b22', strokeWidth: 2, label: 'Yes' },
        { type: 'rect', x: 40, y: 280, width: 120, height: 60, fill: '#ffb6c1', stroke: '#cd5c5c', strokeWidth: 2, label: 'No' },
        { type: 'rect', x: 200, y: 400, width: 140, height: 60, fill: '#ff6347', stroke: '#cd3333', strokeWidth: 2, label: 'End' },
        { type: 'arrow', startX: 270, startY: 110, endX: 270, endY: 160, stroke: '#333', strokeWidth: 2 },
        { type: 'arrow', startX: 270, startY: 220, endX: 270, endY: 270, stroke: '#333', strokeWidth: 2 },
        { type: 'arrow', startX: 330, startY: 310, endX: 400, endY: 310, stroke: '#333', strokeWidth: 2 },
        { type: 'arrow', startX: 210, startY: 310, endX: 160, endY: 310, stroke: '#333', strokeWidth: 2 },
        { type: 'arrow', startX: 270, startY: 350, endX: 270, endY: 400, stroke: '#333', strokeWidth: 2 }
    ],
    mindmap: [
        { type: 'rect', x: 300, y: 200, width: 120, height: 50, fill: '#4a86e8', stroke: '#2a5ab8', strokeWidth: 2, label: 'Central Idea' },
        { type: 'rect', x: 100, y: 80, width: 100, height: 40, fill: '#90ee90', stroke: '#228b22', strokeWidth: 1, label: 'Topic 1' },
        { type: 'rect', x: 500, y: 80, width: 100, height: 40, fill: '#ffb6c1', stroke: '#cd5c5c', strokeWidth: 1, label: 'Topic 2' },
        { type: 'rect', x: 100, y: 330, width: 100, height: 40, fill: '#ffd700', stroke: '#b8960f', strokeWidth: 1, label: 'Topic 3' },
        { type: 'rect', x: 500, y: 330, width: 100, height: 40, fill: '#dda0dd', stroke: '#9932cc', strokeWidth: 1, label: 'Topic 4' },
        { type: 'line', startX: 300, startY: 200, endX: 200, endY: 100, stroke: '#228b22', strokeWidth: 2 },
        { type: 'line', startX: 420, startY: 200, endX: 500, endY: 100, stroke: '#cd5c5c', strokeWidth: 2 },
        { type: 'line', startX: 300, startY: 250, endX: 200, endY: 330, stroke: '#b8960f', strokeWidth: 2 },
        { type: 'line', startX: 420, startY: 250, endX: 500, endY: 330, stroke: '#9932cc', strokeWidth: 2 }
    ],
    wireframe: [
        { type: 'rect', x: 50, y: 50, width: 700, height: 500, fill: '#ffffff', stroke: '#ccc', strokeWidth: 1, label: '' },
        { type: 'rect', x: 50, y: 50, width: 700, height: 50, fill: '#f0f0f0', stroke: '#ccc', strokeWidth: 1, label: 'Header' },
        { type: 'rect', x: 50, y: 100, width: 200, height: 450, fill: '#fafafa', stroke: '#ccc', strokeWidth: 1, label: 'Sidebar' },
        { type: 'rect', x: 250, y: 100, width: 500, height: 450, fill: '#ffffff', stroke: '#ccc', strokeWidth: 1, label: 'Content Area' },
        { type: 'rect', x: 270, y: 120, width: 200, height: 30, fill: '#e8e8e8', stroke: '#999', strokeWidth: 1, label: 'Search Bar' },
        { type: 'rect', x: 270, y: 170, width: 460, height: 150, fill: '#f5f5f5', stroke: '#ccc', strokeWidth: 1, label: 'Main Content' },
        { type: 'rect', x: 270, y: 340, width: 140, height: 180, fill: '#f5f5f5', stroke: '#ccc', strokeWidth: 1, label: 'Card 1' },
        { type: 'rect', x: 430, y: 340, width: 140, height: 180, fill: '#f5f5f5', stroke: '#ccc', strokeWidth: 1, label: 'Card 2' },
        { type: 'rect', x: 590, y: 340, width: 140, height: 180, fill: '#f5f5f5', stroke: '#ccc', strokeWidth: 1, label: 'Card 3' }
    ],
    diagram: [
        { type: 'rect', x: 300, y: 80, width: 160, height: 60, fill: '#4a86e8', stroke: '#2a5ab8', strokeWidth: 2, label: 'Database' },
        { type: 'rect', x: 100, y: 220, width: 140, height: 50, fill: '#90ee90', stroke: '#228b22', strokeWidth: 2, label: 'API Server' },
        { type: 'rect', x: 500, y: 220, width: 140, height: 50, fill: '#ffb6c1', stroke: '#cd5c5c', strokeWidth: 2, label: 'Web Client' },
        { type: 'rect', x: 300, y: 360, width: 160, height: 60, fill: '#ffd700', stroke: '#b8960f', strokeWidth: 2, label: 'Cache' },
        { type: 'arrow', startX: 380, startY: 140, endX: 170, endY: 220, stroke: '#333', strokeWidth: 2 },
        { type: 'arrow', startX: 380, startY: 140, endX: 570, endY: 220, stroke: '#333', strokeWidth: 2 },
        { type: 'arrow', startX: 170, startY: 270, endX: 380, endY: 360, stroke: '#333', strokeWidth: 2 },
        { type: 'arrow', startX: 570, startY: 270, endX: 380, endY: 360, stroke: '#333', strokeWidth: 2 }
    ]
};

export function loadTemplate(name) {
    const template = templates[name];
    if (!template) return [];

    return template.map(item => ({
        ...item,
        id: `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        visible: true,
        locked: false,
        opacity: 1
    }));
}
