# Pebble — Prospect Research Pipeline

Pebble powers prospect research for Bedrock. Integration #9.

## Quick Start

```bash
# From repo root
pip install -r pebble/requirements.txt
cp pebble/.env.example pebble/.env
# Edit pebble/.env: set ANTHROPIC_API_KEY
uvicorn pebble.main:app --reload --port 8001
```

Bedrock (financial_forecasting) runs on 8000. Set `REACT_APP_PEBBLE_API_URL=http://localhost:8001` in the frontend .env to call Pebble.

## Testing Pebble in Bedrock

1. **Start Pebble** (terminal 1):
   ```bash
   uvicorn pebble.main:app --reload --port 8001
   ```

2. **Configure Bedrock frontend** — create or edit `financial_forecasting/frontend/.env.local`:
   ```
   REACT_APP_PEBBLE_API_URL=http://localhost:8001
   ```

3. **Start Bedrock** (terminal 2):
   ```bash
   cd financial_forecasting && python simple_server.py
   # Or: cd financial_forecasting/frontend && npm start
   ```

4. **Open** `http://localhost:3000/pebble` (or your Bedrock URL + `/pebble`).

5. **Test**: Enter First Name, Last Name, Organization (e.g. "Goldman Sachs"), click "Request Research". With `ANTHROPIC_API_KEY` set, Pebble will enrich and return a profile.

## API

- `POST /api/v1/research/request` — Submit contact IDs for research
- `GET /api/v1/research/profiles/{contact_id}` — Get research profile
- `POST /api/v1/research/feedback` — Submit claim feedback (claim_id, correct)

## Env Vars

| Var | Required | Description |
|-----|----------|-------------|
| ANTHROPIC_API_KEY | Yes | Anthropic API key |
| FEC_API_KEY | No | FEC API key (use DEMO_KEY for testing) |
| PEBBLE_API_KEY | No | If set, Bedrock must send X-Api-Key header |

## Architecture

- **Bee hierarchy:** Worker → Haiku (MVP), Drone → Haiku, Forager → Sonnet, Queen → Opus
- **WorkerHarness:** Timeout, retries, schema validation, cost cap
- **ProspectBudgetTracker:** $0.50/prospect cap

## Day 5 Verification

Run 5–10 contacts end-to-end to confirm profiles, costs, and harness_log:

1. Start Pebble and Bedrock (see Testing above).
2. Test contacts with org names (e.g. "American Red Cross", "Goldman Sachs") — ProPublica lookup works without EIN.
3. Inspect `pebble/pebble.db`:
   ```bash
   sqlite3 pebble/pebble.db "SELECT agent_name, outcome, cost_usd, prospect_id FROM harness_log ORDER BY created_at DESC LIMIT 20;"
   ```
4. Confirm cost per prospect < $0.50 and profiles have claims with `source_url`.
