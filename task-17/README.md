# Dialogues — Accessible Modal System

A polished React demo of reusable, accessible dialog patterns. It includes a standard form dialog, confirmation alert, native form validation, and a working response workspace persisted with localStorage.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

## Accessibility features

- Semantic `dialog` and `alertdialog` roles with `aria-modal`
- Programmatic title and description relationships
- Initial focus placement and focus restoration on close
- Focus trapped inside the active dialog
- Escape key and visible close-button support
- Optional backdrop dismissal for non-critical dialogs
- Body scroll locking while a dialog is open
- Keyboard-visible focus states and reduced-motion support
- Status announcements after successful actions

## Structure

The reusable `Modal` component lives in `src/main.jsx`. It renders through a React portal into `#modal-root`, keeping dialogs outside the application layout while preserving React context.

For a larger application, move `Modal` into its own component file and add automated accessibility checks with axe-core alongside keyboard interaction tests.


