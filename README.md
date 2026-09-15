# SketchVector

A fast, free collaborative whiteboard built for creators. Draw shapes, sketch ideas, and bring your vision to life — all in the browser.

![SketchVector](https://sketchvector.vercel.app/og-image.png)

## Live Demo

**[sketchvector.vercel.app](https://sketchvector.vercel.app)**

## Features

- **Shapes & Lines** — Rectangles, circles, diamonds, arrows, lines with customizable stroke, fill, and style
- **Freehand Drawing** — Smooth pen tool with Bezier curve interpolation
- **Text Tool** — Draw a box and type inside, editable after closing
- **Selection & Resize** — Click or marquee select, drag to move, resize handles on shapes
- **Right-Click Menu** — Duplicate, copy, paste, delete, export
- **Export** — PNG (with white background), SVG, or .sketchvector project files
- **Import** — Load previously saved .sketchvector files
- **Infinite Canvas** — Pan and zoom freely with dot grid alignment
- **Keyboard Shortcuts** — Everything accessible from the keyboard
- **Dark/Light Themes** — Toggle with system preference support
- **Local Storage** — Auto-saves your work

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `V` | Selection tool |
| `P` | Pen / Draw tool |
| `H` | Hand (pan) tool |
| `E` | Eraser |
| `R` | Rectangle |
| `O` | Circle / Ellipse |
| `L` | Line |
| `A` | Arrow |
| `D` | Diamond |
| `T` | Text |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Delete` / `Backspace` | Delete selected |
| `Space` + drag | Pan canvas |
| `Shift` + click | Multi-select |
| `Escape` | Finalize text edit |
| `+` / `-` | Zoom in / out |

## Tech Stack

- **Vite** — Fast build tool
- **Vanilla JS** — No frameworks, pure JavaScript
- **HTML5 Canvas** — Hardware-accelerated rendering
- **LocalStorage** — Persistence without a backend

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
SketchVector/
├── index.html          # Landing page
├── app.html            # Whiteboard application
├── public/
│   ├── favicon.svg     # Site favicon
│   └── logo.svg        # Logo
├── src/
│   ├── main.js         # Entry point
│   ├── app.js          # Application core
│   ├── canvas/
│   │   ├── Viewport.js # Zoom, pan, transforms
│   │   └── Renderer.js # Shape rendering, grid
│   ├── tools/
│   │   ├── ToolManager.js    # Tool registration & events
│   │   ├── SelectionTool.js  # Select, move, resize
│   │   ├── ShapeTool.js      # Rect, circle, line, arrow, diamond
│   │   ├── PenTool.js        # Freehand drawing
│   │   ├── TextTool.js       # Text with draw-box UX
│   │   └── EraserTool.js     # Eraser
│   ├── components/
│   │   ├── Toolbar.js        # Top toolbar
│   │   ├── BottomBar.js      # Zoom controls
│   │   ├── PropertiesBar.js  # Tool-specific properties
│   │   └── ContextMenu.js    # Right-click menu
│   ├── state/
│   │   ├── StateManager.js   # State store
│   │   ├── History.js        # Undo/redo
│   │   └── Storage.js        # LocalStorage persistence
│   └── styles/
│       └── main.css          # All styles
└── Excalifont-Regular.woff2  # Font file
```

## License

This project is licensed under the **SketchVector Community License** — see [LICENSE.md](LICENSE.md) for details.

**Free to use** for personal and commercial projects. **Attribution required** — credit "SketchVector" or link back to the project.

## Author

**Mr-Dev-Loper** — [GitHub](https://github.com/Mr-Dev-Loper)
