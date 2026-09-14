export default class ContextMenu {
    constructor(app) {
        this.app = app;
        this.menu = null;
        this.visible = false;
        this._createMenu();
        this._bindGlobalEvents();
    }

    _createMenu() {
        this.menu = document.createElement('div');
        this.menu.className = 'sv-context-menu';
        this.menu.style.display = 'none';
        document.body.appendChild(this.menu);
    }

    _bindGlobalEvents() {
        document.addEventListener('click', () => this.hide());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hide();
        });
    }

    show(x, y, items) {
        if (!items || items.length === 0) {
            items = this._getDefaultItems();
        }

        this.menu.innerHTML = '';
        for (const item of items) {
            if (item === '---') {
                const sep = document.createElement('div');
                sep.className = 'sv-context-menu__separator';
                this.menu.appendChild(sep);
            } else {
                const btn = document.createElement('button');
                btn.className = 'sv-context-menu__item';
                if (item.disabled) btn.classList.add('sv-context-menu__item--disabled');
                btn.innerHTML = `
                    <span class="sv-context-menu__label">${item.label}</span>
                    ${item.shortcut ? `<span class="sv-context-menu__shortcut">${item.shortcut}</span>` : ''}
                `;
                if (!item.disabled && item.action) {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        item.action();
                        this.hide();
                    });
                }
                this.menu.appendChild(btn);
            }
        }

        this.menu.style.display = 'block';

        const menuRect = this.menu.getBoundingClientRect();
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        let posX = x;
        let posY = y;
        if (x + menuRect.width > winW) posX = x - menuRect.width;
        if (y + menuRect.height > winH) posY = y - menuRect.height;

        this.menu.style.left = posX + 'px';
        this.menu.style.top = posY + 'px';
        this.visible = true;
    }

    hide() {
        this.menu.style.display = 'none';
        this.visible = false;
    }

    _getDefaultItems() {
        const app = this.app;
        const state = app.state?.getState();
        const hasSelection = state?.selectedIds?.length > 0;

        return [
            { label: 'Cut', shortcut: 'Ctrl+X', disabled: !hasSelection, action: () => app._cutShapes?.() },
            { label: 'Copy', shortcut: 'Ctrl+C', disabled: !hasSelection, action: () => app._copyShapes?.() },
            { label: 'Paste', shortcut: 'Ctrl+V', action: () => app._pasteShapes?.() },
            { label: 'Delete', shortcut: 'Del', disabled: !hasSelection, action: () => app._deleteSelected?.() },
            '---',
            { label: 'Select All', shortcut: 'Ctrl+A', action: () => app._selectAll?.() },
            '---',
            { label: 'Undo', shortcut: 'Ctrl+Z', disabled: !app.history?.canUndo(), action: () => app._onUndo() },
            { label: 'Redo', shortcut: 'Ctrl+Shift+Z', disabled: !app.history?.canRedo(), action: () => app._onRedo() },
            '---',
            { label: 'Export as PNG', action: () => app._onExport('png') },
            { label: 'Export as SVG', action: () => app._onExport('svg') },
            '---',
            { label: app.grid?.enabled ? 'Grid: ON' : 'Grid: OFF', action: () => { app.grid?.toggle(); app._drawCanvas?.(); } },
            { label: app.grid?.snapEnabled ? 'Snap: ON' : 'Snap: OFF', action: () => { app.grid?.toggleSnap(); } }
        ];
    }
}
