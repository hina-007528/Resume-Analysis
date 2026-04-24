# Neural Resume Analyzer
*Forced re-build for Render spaCy fixes*

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Monorepo Layout

```text
resume-analyzer/
├── frontend/          # Next.js service wrapper
├── backend/           # FastAPI app
├── supabase/          # Migrations + functions
├── docker-compose.yml
├── .github/workflows/
│   ├── frontend-ci.yml
│   └── backend-ci.yml
└── README.md
```

## Environment Setup

Copy and populate:

- `./.env.local.example` -> `./.env.local`
- `./backend/.env.example` -> `./backend/.env`
- `./.env.docker` for docker-compose services

Frontend variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL=http://localhost:8000`
- `NEXT_PUBLIC_SENTRY_DSN`

Backend variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGINS=http://localhost:3000`
- `MAX_UPLOAD_SIZE_MB=5`
- `RATE_LIMIT_PER_MINUTE=20`
- `SENTRY_DSN`

## Testing Strategy

### Backend (pytest)

Run from `backend/`:

```bash
pytest --asyncio-mode=auto --cov=app --cov-report=html -v
```

Implemented suites:

- `tests/test_nlp.py` - NLP unit tests (tokenization, stopwords, lemmatization, skill extraction, TF-IDF, cosine score)
- `tests/test_api.py` - analyze/history endpoint integration tests
- `tests/test_performance.py` - latency and concurrent request checks

### Frontend (Vitest + RTL + MSW)

Run unit tests:

```bash
npm run test:frontend
```

Run E2E tests:

```bash
npm run test:e2e
```

Implemented suites:

- `src/__tests__/ResumeDropzone.test.tsx`
- `src/__tests__/ScoreDisplay.test.tsx`
- `src/__tests__/KeywordCard.test.tsx`
- `src/__tests__/SuggestionPanel.test.tsx`
- `src/__tests__/useAnalyzer.test.ts`
- `src/__tests__/analyzerClient.test.ts`
- `e2e/full-flow.spec.ts`
- `e2e/auth-flow.spec.ts`
- `e2e/responsive.spec.ts`

## Debugging Setup

- VS Code launch configs: `./.vscode/launch.json`:
  - Next.js dev server
  - FastAPI debugger
  - debugpy remote attach (Docker-compatible port `5678`)
- API tracing:
  - `X-Request-ID` is now attached to every backend response
- Frontend error handling:
  - Global `ErrorBoundary` in app layout with optional Sentry capture (set `NEXT_PUBLIC_SENTRY_DSN`)
- Logging:
  - backend uses `structlog`
  - frontend server-side logging helper: `src/lib/logging/serverLogger.ts` (winston)
- Dev tooling:
  - React DevTools recommended for component debugging
  - Redux DevTools recommended if you later add Redux/Zustand devtools integration
- Supabase:
  - enable query logging in Supabase dashboard during development

## Development Commands

- `npm run dev` - run frontend + backend together
- `npm run test` - run frontend + backend tests
- `npm run lint` - run frontend + backend lint checks
- `npm run build` - build frontend + backend artifacts

## Docker Compose

Run both services with shared docker env:

```bash
docker compose up --build
```

Services:

- frontend: Next.js on `http://localhost:3000`
- backend: FastAPI on `http://localhost:8000`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
