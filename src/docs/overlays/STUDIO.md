# Overlay: Studio

**File Path**: `/components/overlays/StudioOverlay.tsx`

The Studio is a full-screen overlay application that provides a suite of productivity tools. It's designed for content creation and editing directly within the main application.

## Navigation
The Studio has its own L1/L2 navigation system, similar to the main modules.

### L1 Tabs
-   **Design**: (Placeholder) A tool for graphic design.
-   **Video**: (Placeholder) A video editing tool.
-   **Coder**: (Placeholder) A code editor.
-   **Office**: A suite of office productivity applications.

### L2 Sidebar
When an L1 tab is selected, the L2 sidebar on the left shows the specific tools available in that category.

## Office Suite Tools

The "Office" category is the most developed part of the Studio, offering several key applications:

### 1. Word Processor (`/components/overlays/studio/WordProcessor.tsx`)
-   **Functionality**: A simple, clean document editor.
-   **UI**: Features a basic toolbar with controls for bold, italic, underline, and text alignment. The main area presents a "page" on a darker background for a focused writing experience. The title and body are `contentEditable` divs.

### 2. Spreadsheet (`/components/overlays/studio/Spreadsheet.tsx`)
-   **Functionality**: A basic spreadsheet application.
-   **UI**:
    -   **Formula Bar**: Displays the active cell's name (e.g., A1) and an input for formulas.
    -   **Grid Area**: A scrollable grid of cells with column headers (A, B, C...) and row headers (1, 2, 3...). Each cell is a `contentEditable` div.

### 3. Presentation (`/components/overlays/studio/Presentation.tsx`)
-   **Functionality**: A tool for creating slide-based presentations.
-   **UI**:
    -   **Thumbnails Bar**: A sidebar on the left shows small previews of each slide in the presentation.
    -   **Main Area**: The central area displays the currently selected slide in a 16:9 aspect ratio, ready for editing.

### 4. Diagram Tool (`/components/overlays/studio/DiagramTool.tsx`)
-   **Functionality**: A simple tool for creating flowcharts and diagrams.
-   **UI**:
    -   **Toolbar**: A vertical toolbar provides basic shapes (rectangle, circle, diamond) and connectors (arrow).
    -   **Canvas**: An infinite, grid-backed canvas where users can place and connect shapes.
