# Inventory QR Scanner (Offline PWA)

Offline-first PWA for high-volume QR inventory scanning on iOS.

## Requirements
- Serve over **HTTPS** (camera APIs require secure context).
- Open in Safari, then "Share" → "Add to Home Screen".

## Dev
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
