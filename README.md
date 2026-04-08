# MyPortfolio

Portfolio built with Vite + React + TypeScript.

## AI Assistant Integration (With Limits)

This project now includes a constrained portfolio assistant:

- UI: floating chat widget on the home page.
- API: serverless endpoint at `/api/portfolio-chat`.
- Language-aware replies (EN/FR/AR) based on current site language.
- Portfolio knowledge source file: `data/portfolio-context.json`.
- Safety and cost limits:
	- input length cap
	- output token cap
	- per-IP hourly rate limit
	- global daily cap
	- request timeout
	- response cache for repeated questions
	- fallback answers when API is unavailable

	## Portfolio Knowledge Source

	Update `data/portfolio-context.json` to modify assistant knowledge without editing API code.

	## Admin Usage Panel

	- Open the assistant and click the shield icon.
	- Enter `CHAT_ADMIN_KEY` and press `Load`.
	- The panel shows:
		- total/success/failed requests
		- rate-limit and daily-cap hits
		- cache hits/misses and cache size
		- limit status (hourly limit, daily used, daily remaining)

	Note: the admin panel only works when `/api/portfolio-chat` is actually deployed or proxied. A plain Vite dev server does not expose that route by itself.

## Configuration

1. Copy environment template and fill values:

```bash
cp .env.example .env
```

2. Set at least:

- `LLM_API_KEY`
- `LLM_MODEL`
- `LLM_API_URL`

### OpenAI setup

- Go to the OpenAI dashboard and create an API key.
- Paste that value into `LLM_API_KEY` in [`.env`](.env).
- Keep `LLM_MODEL=gpt-4o-mini` and `LLM_API_URL=https://api.openai.com/v1/chat/completions` unless you want a different model or provider.

3. Optional limit tuning:

- `CHAT_RATE_LIMIT_PER_HOUR`
- `CHAT_DAILY_CAP`
- `CHAT_MAX_INPUT_CHARS`
- `CHAT_MAX_OUTPUT_TOKENS`
- `CHAT_TIMEOUT_MS`
- `CHAT_CACHE_TTL_MS`
- `CHAT_ADMIN_KEY`

Client-side (UX-only) controls:

- `VITE_CHAT_MAX_INPUT_CHARS`
- `VITE_CHAT_COOLDOWN_MS`

Analytics (optional):

- `VITE_GA_MEASUREMENT_ID` (Google Analytics 4, format: `G-XXXXXXXXXX`)

## Visitor Analytics Setup (GA4)

1. Create a GA4 property and a Web Data Stream in Google Analytics.
2. Copy the Measurement ID (looks like `G-XXXXXXXXXX`).
3. Put it in [`.env`](.env):

```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

4. Restart dev server.
5. Open your portfolio and check Realtime in GA4 to confirm page views.

Notes:

- Route changes in this SPA are tracked as `page_view` events.
- If `VITE_GA_MEASUREMENT_ID` is empty, analytics is disabled automatically.

Custom GA events emitted by the app:

- `assistant_opened`
- `assistant_message_sent`
- `contact_form_submit_attempt`
- `contact_form_submit_success`
- `contact_form_submit_error`

## Local Development

```bash
npm install
npm run dev
```

Note: The app will run with fallback mode even if `/api/portfolio-chat` is not available in local Vite-only runs.

## Deployment

For full AI functionality, deploy with a platform that supports serverless API routes (for example Vercel with the `api/` directory).
