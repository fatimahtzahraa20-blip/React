---
name: Academic Command
colors:
  surface: '#faf9fd'
  surface-dim: '#dad9dd'
  surface-bright: '#faf9fd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f7'
  surface-container: '#efedf1'
  surface-container-high: '#e9e7eb'
  surface-container-highest: '#e3e2e6'
  on-surface: '#1a1b1e'
  on-surface-variant: '#44474e'
  inverse-surface: '#2f3033'
  inverse-on-surface: '#f1f0f4'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#465f88'
  primary: '#000a1e'
  on-primary: '#ffffff'
  primary-container: '#002147'
  on-primary-container: '#708ab5'
  inverse-primary: '#aec7f6'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fc'
  on-secondary-container: '#57657a'
  tertiary: '#180500'
  on-tertiary: '#ffffff'
  tertiary-container: '#3d1500'
  on-tertiary-container: '#b97958'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aec7f6'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#2d476f'
  secondary-fixed: '#d5e3fc'
  secondary-fixed-dim: '#b9c7df'
  on-secondary-fixed: '#0d1c2e'
  on-secondary-fixed-variant: '#3a485b'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb691'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#6c391d'
  background: '#faf9fd'
  on-background: '#1a1b1e'
  surface-variant: '#e3e2e6'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  sidebar-width: 260px
  max-content-width: 1440px
---

## Brand & Style

The design system is engineered for the high-stakes environment of a University CS Department. It adopts the persona of a **Digital Command Centre**: authoritative, precise, and systematically organized. The visual language balances academic prestige with the efficiency of a modern SaaS platform.

The aesthetic follows a **Corporate / Modern** direction with a focus on high information density. It prioritizes clarity over decoration, using structured layouts and a restrained palette to reduce cognitive load for Department Heads and administrators managing complex faculty allocations and student data.

## Colors

This design system utilizes a traditional "Oxford Blue" as its primary anchor to evoke institutional trust and authority. 

- **Primary (#002147):** Used for global navigation, primary actions, and headers. It represents the "Command" aspect of the interface.
- **Secondary (#475569):** A neutral slate used for secondary buttons, icon accents, and metadata to maintain a professional hierarchy.
- **Semantic Colors:** Emerald, Amber, and Crimson are utilized strictly for status indicators (Workload, Capacity, Deadlines). These are tuned to be legible against white backgrounds.
- **Surface:** The background is a crisp `#F8FAFC`, providing a cool-toned, "paper-like" canvas that minimizes eye strain during long administrative sessions.

## Typography

The design system relies on **Inter** for its exceptional legibility in data-dense environments. It utilizes a tight scale to maximize the amount of information visible on screen without sacrificing hierarchy.

- **Headlines:** Set with slight negative letter-spacing to feel "compact" and authoritative.
- **Labels:** Uppercase labels are used for table headers and section overviews to differentiate structural elements from dynamic content.
- **Monospace Integration:** **JetBrains Mono** is introduced specifically for ID numbers, course codes, and technical metrics, allowing faculty members to scan alphanumeric strings with absolute precision.

## Layout & Spacing

This design system uses a **Fluid Grid** model optimized for dashboard views. 

- **Desktop Layout:** A fixed left-hand sidebar (260px) houses the primary navigation. The main content area uses a 12-column grid with 16px gutters.
- **Data Density:** Vertical rhythm is built on a 4px baseline. Table rows and list items should use condensed padding (e.g., 8px or 12px) to ensure significant data remains "above the fold."
- **Mobile Adaptivity:** On mobile, the sidebar collapses into a bottom navigation bar for high-frequency actions, while secondary management tools are housed in a top-right "Drawer" menu.

## Elevation & Depth

The design system employs **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows to maintain a clean, professional "Command Centre" feel.

- **Level 0 (Background):** `#F8FAFC` - The foundation layer.
- **Level 1 (Cards/Sidebar):** White (#FFFFFF) with a 1px solid border in `#E2E8F0`. No shadow. This is used for standard content containers.
- **Level 2 (Active/Hover):** A very soft, diffused shadow (`0 4px 12px rgba(0,0,0,0.05)`) is applied only when a card is interactive or being "dragged" (e.g., reallocating a faculty member to a course).
- **Glassmorphism:** Reserved exclusively for global overlays (modals), using a light backdrop blur (8px) to maintain context without visual clutter.

## Shapes

The shape language is **Soft (0.25rem / 4px)**. This sharp-but-not-brutal radius reinforces the professional, systematic nature of an academic institution.

- **Buttons & Inputs:** 4px radius.
- **Cards & Large Containers:** 8px (`rounded-lg`) to provide a clear boundary for data sets.
- **Status Badges:** 2px or 4px radius. Avoid pill shapes (full rounding) to keep the UI feeling "structured" rather than "playful."

## Components

### Status Badges
Used for workload and allocation tracking. They feature a light background tint of the semantic color with high-contrast text.
- *Overload:* Crimson text on Light Red background.
- *Balanced:* Emerald text on Light Green background.

### Buttons
- **Primary:** Oxford Blue background, White text. Squared edges (4px) convey stability.
- **Secondary:** White background, Slate border. 
- **Ghost:** For table actions (Edit/Delete) to minimize visual noise in rows.

### Data Tables
The core of the system. Headers are `label-caps` in Slate. Rows alternate with a very subtle ghost-gray zebra stripe for readability. High-priority metrics (e.g., "Credits Assigned") use `data-mono` typography.

### Sidebar Navigation
Solid Oxford Blue or Dark Slate background. Active states are indicated by a high-contrast primary blue vertical bar on the left edge and a subtle background highlight.

### Capacity Gauges
Small, horizontal progress bars within table cells or cards. The color of the bar transitions from Emerald to Amber to Crimson as the value approaches 100%.

### Input Fields
Minimalist design with 1px borders. Focus states use a 2px Oxford Blue ring to ensure the "Command" action is clear.