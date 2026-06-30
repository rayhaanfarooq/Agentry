# Runloop Landing Page

Separate React + TypeScript marketing site scaffold for Runloop.

## Purpose

This app is intentionally independent from the authenticated dashboard in `frontend/`.
It exists so the public-facing landing page can evolve, deploy, and scale separately.

## Development

```bash
npm install
npm run dev
```

The landing page defaults to `http://localhost:3000` and validates its environment at startup.

## Build

```bash
npm run build
npm run lint
npm run format:check
```

## Environment

```bash
VITE_API_URL=http://localhost:8000
PORT=3000
HOST=0.0.0.0
```

`VITE_API_URL` is validated on boot so the landing page fails early when its environment is incomplete.
