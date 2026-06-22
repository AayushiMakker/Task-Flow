# TaskFlow

A clean, lightweight to-do list app built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step — just open it in a browser. Your tasks are saved automatically in the browser's local storage, so they persist between visits.

## Screenshots

![TaskFlow main view](screenshots/01-main.png)

More views in [SCREENSHOTS.md](SCREENSHOTS.md).

## Features

- **Add tasks** — type and press Enter or click **Add** (minimum 2 characters, with inline validation)
- **Complete tasks** — tick the checkbox to mark a task done
- **Delete tasks** — remove individual tasks with a smooth animation
- **Filter** — view **All**, **Active**, or **Completed** tasks
- **Clear done** — remove all completed tasks at once
- **Live stats** — total and completed counters plus a progress bar
- **Persistent storage** — tasks are saved to `localStorage` and restored on reload
- **Accessible** — ARIA labels, live regions, and keyboard support throughout

## Tech Stack

- HTML5
- CSS3 (custom properties, Google Fonts: Inter & Plus Jakarta Sans)
- Vanilla JavaScript (ES6+)
- Browser `localStorage` for persistence

## Getting Started

No installation or dependencies required.

1. Clone the repository:
   ```bash
   git clone https://github.com/AayushiMakker/Task-Flow.git
   ```
2. Open `index.html` in your browser.

That's it — start adding tasks.

## Project Structure

```
.
├── index.html   # Markup and app layout
├── style.css    # Styling and theming
└── script.js    # App logic (state, rendering, localStorage)
```

## How It Works

Tasks are stored as an array of objects (`{ id, text, completed, createdAt }`) in memory and serialized to `localStorage` under the key `taskflow_v2`. The UI re-renders from this state on every change, keeping the stats, progress bar, filters, and empty states in sync.

## License

Free to use and modify.
