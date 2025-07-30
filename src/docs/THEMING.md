# Advanced Theming System

**File Path**: `/components/modules/settings/Branding.tsx`

The application features a powerful, real-time theming system that gives administrators full control over the application's color scheme. This is managed through the "Advanced Branding" screen within the System Settings module.

## How It Works

The theming system is built upon CSS Custom Properties (Variables).

1.  **State Management**: The `Branding` component holds a React state object (`themeColors`) that contains key-value pairs for all customizable colors in the application (e.g., `mainBackground: '#1e1935'`).

2.  **Applying the Theme**: A `useEffect` hook calls the `applyTheme` function whenever the `themeColors` state changes. This function:
    -   Finds or creates a `<style>` tag in the document's `<head>` with the ID `dynamic-theme-style`.
    -   Generates a CSS string that defines a series of CSS variables within the `:root` selector. Each variable corresponds to a key in the `themeColors` state.
    -   Injects this CSS string into the `<style>` tag.

    ```css
    /* Example of generated CSS */
    :root {
        --color-main-bg: #1e1935;
        --color-header-border: rgba(96, 165, 250, 0.4);
        --color-l1-tab-active-bg: rgba(192, 132, 252, 0.5);
        /* ... and so on */
    }
    ```

3.  **Component Styling**: Throughout the application's CSS files, components use these variables instead of hardcoded color values.
    ```css
    /* Example from a component's CSS file */
    .global-header-container-bordered {
      background-color: var(--color-header-bg);
      border-color: var(--color-header-border);
    }
    ```

This architecture allows the entire application's UI to update instantly and in real-time as an administrator adjusts the colors in the branding settings.

## User Interface

The "Advanced Branding" screen provides a user-friendly interface for theme customization.

-   **Accordions**: Colors are grouped into logical categories (Layout, Navigation, Cards, UI Elements) using accordions to keep the interface organized.
-   **Color Pickers**: Each color property has a dedicated color picker component, which includes both a standard visual color wheel and a text input for precise hex or rgba values.
-   **Live Preview**: A section of the screen displays sample components (like a Stat Card and navigation buttons) that update in real-time, giving the administrator an immediate preview of their changes.

## Persistence

-   **Saving**: When the "Save Theme" button is clicked, the current `themeColors` state object is serialized to JSON and saved in the browser's `localStorage` under the key `aura-theme`.
-   **Loading**: When the application loads, the `Branding` component's initial state is hydrated from `localStorage`. If no saved theme is found, it falls back to the `defaultTheme`.
-   **Resetting**: The "Reset to Default" button removes the theme from `localStorage` and resets the state to the `defaultTheme`, immediately reverting the application's appearance.
