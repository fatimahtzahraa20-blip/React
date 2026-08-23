# Role-Based Admin Panel

A responsive React admin dashboard demonstrating role-based access control (RBAC). The built-in role switcher lets you preview the application as an `admin`, `editor`, or `viewer`, with navigation, dashboard content, page access, and available actions updating immediately.

## Features

- Live role switching between admin, editor, and viewer.
- Dashboard messaging tailored to the selected role.
- Permission-aware navigation with locked pages clearly indicated.
- Automatic Dashboard redirect if a new role cannot access the current page.
- Reusable page-level and action-level permission components.
- Functional in-page user invitation form.
- User name, email, and role validation.
- Duplicate-email protection.
- User role updates and user removal.
- Editable workspace settings.
- Payment-method update flow with four-digit validation.
- Clear success and validation feedback.
- Persistent demo data using browser `localStorage`.
- Responsive layouts for forms and data tables.

## Role permissions

| Capability | Admin | Editor | Viewer |
| --- | :---: | :---: | :---: |
| View Dashboard | Yes | Yes | Yes |
| View Users | Yes | Yes | Yes |
| Invite Users | Yes | No | No |
| Change User Roles | Yes | No | No |
| Remove Users | Yes | No | No |
| View Billing | Yes | Yes | No |
| Update Payment Method | Yes | No | No |
| View Settings | Yes | Yes | No |
| Edit Workspace Settings | Yes | No | No |

## Role behavior

### Admin

Administrators have full access. They can invite users, change user roles, remove users, update the payment method, and save workspace settings.

### Editor

Editors can view the Dashboard, Users, Billing, and Settings pages. Administrative fields and actions are read-only or hidden.

### Viewer

Viewers can access the Dashboard and view the user directory. Billing and Settings are locked.

## Functional pages

### Dashboard

The Dashboard is available to every role. Its heading and description change to explain the selected role's access level.

### Users

Administrators can open an in-page invitation form containing name, email, and role fields. The form validates required values, checks email formatting, and prevents duplicate addresses. Administrators can also change roles or remove existing users.

Editors and viewers receive a read-only user directory with role badges instead of editing controls.

### Billing

Administrators can update the stored card's last four digits. The current card ending is displayed separately from the update button. Editors can view billing details without changing them, while viewers cannot open the page.

This demo does not collect complete card information or communicate with a payment provider.

### Settings

Administrators can update and save the workspace name. Editors can view the setting without editing it, while viewers cannot open the page.

## Project structure

```text
src/
├── App.jsx          # Pages, shared state, forms, and actions
├── access.jsx       # Authentication context and access components
├── permissions.js  # Centralized roles and permissions
├── index.css        # Application and responsive styling
└── main.jsx         # React application entry point
```

## Access-control architecture

Role permissions are centrally defined in `src/permissions.js`. UI components request specific permissions instead of duplicating role checks throughout the application.

- `AuthProvider` supplies the active role.
- `useAuth()` reads the active role from context.
- `can(role, permission)` checks the central permission table.
- `Can` conditionally renders individual actions or fallback content.
- `ProtectedSection` protects complete pages and sections.

Client-side access control improves the interface but is not a security boundary. A production application must repeat every authorization check on its server or API.

## Local persistence

The demo saves data in the browser using these `localStorage` keys:

| Key | Stored data |
| --- | --- |
| `admin-users` | Added users, role changes, and removals |
| `workspace-name` | Saved workspace name |
| `payment-last4` | Last four digits of the demonstration card |

Changes remain available after navigating, switching roles, or refreshing the browser. Clearing site data resets the stored demo values.

## Getting started

Requirements:

- Node.js
- npm

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open the local address printed by Vite, typically `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

Vite writes the production files to `dist/`.

## Technology

- React 18
- Vite 5
- JavaScript
- CSS
