# Task 14: Reusable Tabs Component

An accessible, keyboard-navigable tabs component built with React 18 and Vite. It supports controlled and uncontrolled state, semantic ARIA relationships, disabled tabs, optional badges, and an animated selection indicator.

The included workspace demo uses the component for four interactive sections: Tasks, Contributions, Activity, and Settings.

## Features

- Reusable compound component API
- Controlled and uncontrolled selection
- Mouse and keyboard navigation
- Accessible `tablist`, `tab`, and `tabpanel` semantics
- Automatic tab and panel ID relationships
- Animated indicator that responds to tab and viewport size changes
- Optional tab badges and disabled states
- Responsive layout with no UI framework
- Functional task management, contributor invitations, activity filtering, and workspace settings

## Keyboard Controls

| Key | Action |
| --- | --- |
| `ArrowRight` | Selects and focuses the next enabled tab |
| `ArrowLeft` | Selects and focuses the previous enabled tab |
| `Home` | Selects and focuses the first enabled tab |
| `End` | Selects and focuses the last enabled tab |

Navigation wraps between the first and last tabs. Disabled tabs are skipped.

## Component API

The reusable components are exported from `src/App.jsx`:

```jsx
import { Tabs, TabList, Tab, TabPanel, TabIndicator } from "./App";

<Tabs defaultValue="overview" onValueChange={setSelectedTab}>
  <TabList ariaLabel="Project sections">
    <TabIndicator />
    <Tab value="overview">Overview</Tab>
    <Tab value="members" badge={3}>Members</Tab>
    <Tab value="archive" disabled>Archive</Tab>
  </TabList>

  <TabPanel value="overview">Overview content</TabPanel>
  <TabPanel value="members">Member content</TabPanel>
  <TabPanel value="archive">Archive content</TabPanel>
</Tabs>
```

### Props

| Component | Prop | Description |
| --- | --- | --- |
| `Tabs` | `value` | Selected value for controlled usage |
| `Tabs` | `defaultValue` | Initial value for uncontrolled usage |
| `Tabs` | `onValueChange` | Called whenever a tab is selected |
| `Tabs` | `className` | Optional class added to the root element |
| `TabList` | `ariaLabel` | Accessible label for the tab group |
| `Tab` | `value` | Unique value shared with its panel |
| `Tab` | `badge` | Optional count or label beside the tab text |
| `Tab` | `disabled` | Prevents selection and keyboard focus |
| `TabPanel` | `value` | Associates the panel with a matching tab |

## Demo Functionality

- **Tasks:** add, complete, reopen, and delete tasks; remaining counts update automatically.
- **Contributions:** invite contributors by email and view their access status.
- **Activity:** see workspace changes as they happen and filter them by type.
- **Settings:** rename the workspace, toggle notifications, and enable compact task spacing.

Demo data is stored in React state and resets when the page is refreshed.

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Install and Run

```bash
npm install
npm run dev
```

Open the local address printed by Vite, typically `http://localhost:5173`.

## Production Build

```bash
npm run build
npm run preview
```

The optimized output is generated in `dist/`.

## Project Structure

```text
task-14/
|-- src/
|   |-- App.jsx       # Tabs components and interactive workspace demo
|   |-- index.css     # Component and responsive styles
|   `-- main.jsx      # React application entry point
|-- index.html
|-- package.json
`-- vite.config.js
```

## Technology

- React 18
- Vite 5
- Plain CSS
- Native browser APIs, including `ResizeObserver`

No external component or styling libraries are used.
