# Task 12 - Image Cropper

A browser-based image cropping tool built with React and Vite. Users can upload an image, position and resize a crop area, preview the result, and download the cropped image as a PNG.

## Features

- Upload PNG, JPG, WEBP, or another browser-supported image format
- Move the crop area with a mouse or touch gesture
- Resize the crop area using its bottom-right handle
- Enter exact crop width and height values in pixels
- Keep the crop selection within the image boundaries
- Preview the cropped result before downloading
- Reset the preview and adjust the crop again
- Export the result as `cropped-image.png`

All image processing happens locally in the browser with the Canvas API. Images are not uploaded to a server.

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Vite opens the app automatically. By default, it is available at [http://localhost:5173](http://localhost:5173).

## How to Use

1. Select **Choose an image** and upload an image from your device.
2. Drag the outlined crop area to position it over the part of the image you want to keep.
3. Drag the bottom-right handle to resize the selection, or enter an exact width and height in the settings panel.
4. Select **Crop image** to generate a preview.
5. Select **Download** to save the result, or **Reset** to discard the preview and continue editing.

## Production Build

```bash
npm run build
npm run preview
```

The optimized production files are generated in `dist/`.

## Project Structure

```text
src/
  App.jsx       Image upload, crop controls, Canvas processing, and download logic
  index.css     Application layout and component styles
  main.jsx      React application entry point
index.html      Vite HTML entry point
vite.config.js  Vite and development server configuration
```

## Tech Stack

- React 18
- Vite 5
- HTML Canvas API
- Plain CSS

## Available Scripts

- `npm run dev` starts the development server.
- `npm run build` creates an optimized production build.
- `npm run preview` serves the production build locally for verification.
