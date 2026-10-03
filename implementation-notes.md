# Daylight — implementation notes

## Overview

Daylight is a responsive daily planner that demonstrates plain JavaScript DOM manipulation and event handling. The page pairs a small task list with a live completion summary and a calm, accessible interface.

## Interactive features

- Add a task with a name and Personal, Work, or Wellbeing category. Whitespace-only entries are rejected with an inline status message.
- Mark tasks complete, remove individual tasks, or clear all completed tasks.
- Filter the list to show all, unfinished, or completed tasks. Adding a task returns the view to All.
- See task totals, completion percentage, a progress ring, and a context-sensitive encouragement update immediately.
- Switch between light and dark themes. Tasks and theme preference persist in `localStorage` across visits.
- Display the current local date and adapt the layout to narrow screens; reduced-motion preferences are respected.

## Structure and implementation choices

- `index.html` contains semantic sections, a labeled form, filter buttons, an accessible live region, and the planner summary.
- `styles.css` defines the visual system, responsive layouts, focus states, dark theme, and reduced-motion behavior.
- `script.js` keeps task data in a small array and uses `render()` as the single source of truth for updating the list and summary. Event listeners handle form submission, completion, deletion, filtering, clearing, and theme changes.
- User-entered task text is added with `textContent`, not interpreted as HTML. Saved data is parsed defensively and checked before it is rendered.
- No framework or build step is needed: open `index.html` in a modern browser.

## Challenges addressed

Keeping the task list, completion ring, counts, and filters in sync can lead to inconsistent UI when each is updated separately. Re-rendering those views from the same task array keeps the behavior predictable. Browser storage can be unavailable or contain malformed data, so reads and writes are guarded and the page can still run for the current visit. Empty and filtered states have separate copy so each view remains understandable.

## Try it

Add a few tasks, try a blank submission, switch filters, complete and remove tasks, clear completed items, and reload the page to confirm persistence. Toggle the theme and resize the browser to view the responsive layout.
