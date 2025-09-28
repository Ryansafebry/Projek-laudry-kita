# AI Development Rules

This document outlines the tech stack and specific rules for developing the "Laundry Kita" application. Following these rules ensures consistency, maintainability, and adherence to the project's architecture.

## Tech Stack

- **Framework & Build Tool:** React with Vite for a fast development experience.
- **Language:** TypeScript for type safety and improved code quality.
- **Styling:** Tailwind CSS for a utility-first styling approach.
- **UI Components:** shadcn/ui, a collection of beautifully designed, accessible, and reusable components.
- **Routing:** React Router (`react-router-dom`) for all client-side routing.
- **State Management:** A combination of React Context API for global state (auth, theme, orders) and TanStack Query for asynchronous state and caching.
- **Forms:** React Hook Form (`react-hook-form`) paired with Zod for robust schema validation.
- **Icons:** Lucide React (`lucide-react`) for a comprehensive and consistent set of icons.
- **Notifications:** `sonner` for toast notifications and a custom notification panel for persistent alerts.

## Library Usage Rules

### 1. UI and Styling
- **Component Library:** **ALWAYS** use components from the `shadcn/ui` library, imported from `@/components/ui/...`. Before creating a new component, check if a suitable one already exists in shadcn/ui.
- **Styling:** Use Tailwind CSS utility classes for all styling. Avoid writing custom CSS in `.css` files. Use the `cn()` utility from `@/lib/utils` to conditionally apply classes.
- **Icons:** All icons **MUST** come from the `lucide-react` package.

### 2. Routing and File Structure
- **Routing:** All application routes are managed in `src/App.tsx` using `<BrowserRouter>`, `<Routes>`, and `<Route>`.
- **Pages:** Create new pages as components within the `src/pages/` directory.
- **Components:**
    - Reusable, general-purpose components go into `src/components/`.
    - Application-specific layout components like `Header` and `Sidebar` go into `src/components/shared/`.
- **State & Logic:**
    - Global state providers go into `src/context/`.
    - Custom hooks go into `src/hooks/`.
    - General utility functions (e.g., date formatting, local storage) go into `src/utils/`.

### 3. State Management
- **Global State:** Use the React Context API for application-wide state that doesn't change frequently (e.g., `AuthContext`, `OrderContext`, `ThemeContext`).
- **Server State & Caching:** Use TanStack Query (`@tanstack/react-query`) for managing asynchronous operations, even when interacting with `localStorage` to simulate API calls. This provides caching, refetching, and optimistic updates.
- **Local State:** Use the `useState` hook for state that is local to a single component.

### 4. Forms
- **Form Handling:** All forms **MUST** be built using `react-hook-form`.
- **Validation:** Use `zod` to define validation schemas for all forms.

### 5. Notifications
- **Toast Notifications:** For immediate, non-critical feedback (e.g., "Order saved successfully"), use the `showSuccess` and `showError` utility functions from `src/utils/toast.ts`, which are wrappers around the `sonner` library.
- **Persistent Notifications:** For important, actionable alerts (e.g., "New order received," "Order ready for pickup"), use the `useNotifications` context to add notifications to the `NotificationPanel`.