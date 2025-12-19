# Inventory QR Scanner (Offline PWA)

Offline-first PWA for high-volume QR inventory scanning on iOS and desktop browsers.

## Features
- Offline-first: scans and exports work without network after first load.
- Fast QR scanning with duplicate detection and optional beep feedback.
- Torch toggle when supported by the camera device.
- Session name editable directly on the Scan screen.
- List view, CSV export, and adjustable scan settings.
- Data stored locally in IndexedDB.

## Requirements
- Serve over **HTTPS** (camera APIs require a secure context).
- iOS: open in Safari and use "Share" -> "Add to Home Screen" for best PWA behavior.
- Grant camera permission when prompted.

## Usage
1. Open the app and go to the Scan tab.
2. Click the session name to edit it. Press Enter or click elsewhere to save, Esc to cancel.
3. Tap Start to begin scanning. Use Undo to remove the last scan.
4. Use List to review scans, Export to share/download CSV, and Settings to adjust behavior.

## Development
```bash
npm i
npm run dev
```

## Build (static assets)
```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to any static HTTPS host (intranet Nginx, etc.).

## License
See `LICENSE` for terms.
## Deployment
- GitHub Pages: https://funwilliam.github.io/Inventory-QR
