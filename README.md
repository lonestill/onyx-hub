# Onyx Hub

Cloud control plane, telemetry ingestion, and community feedback hub for [Onyx Launcher](https://github.com/lonestill/onyx-launcher).

## Routes

- `/reviews`: Public community feedback & reviews feed with upvoting.
- `/admin`: Private engineering dashboard for telemetry, crash reports, and feedback triage.
- `/api/v1/telemetry`: Telemetry ingestion endpoint.
- `/api/v1/feedback`: Feedback submission endpoint.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **Styling**: Tailwind CSS (Linear-inspired obsidian aesthetic)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

## Local Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```
