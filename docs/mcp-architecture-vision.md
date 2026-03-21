# MCP Architecture Vision

## Naming Clarification

"MCP Client" in this codebase refers to `UnifiedMCPClient` — a **unified service abstraction layer** that manages connections to external APIs (Salesforce, Sage, Slack, Google, Fireflies). It is **not** Anthropic's Model Context Protocol, though the transport layer was originally designed with MCP-style stdio/websocket communication in mind.

The naming predates the MCP protocol spec. Today, `transport=None` (direct API calls via SDK libraries) is the default and only mode used in production.

## Current Service Inventory

`UnifiedMCPClient` in `mcp_client/unified_client.py` manages 7 services:

| Service | SDK | Directory | What It Does |
|---------|-----|-----------|-------------|
| **Salesforce** | `simple_salesforce` | `mcp_client/services/salesforce.py` | SOQL queries, opportunity/account/contact CRUD, pagination |
| **Sage Intacct** | Custom XML API | `mcp_client/services/sage_intacct.py` | Customers, GL accounts, departments, invoicing |
| **Slack** | `slack_sdk` | `mcp_client/services/slack.py` | Channel messages, pipeline updates, health checks |
| **Google Drive** | Google API client | `mcp_client/services/google_drive.py` | Account activity, document search |
| **Google Calendar** | Google API client | `mcp_client/services/google_calendar.py` | Meeting events, PBD calendar |
| **Gmail** | Google API client | `mcp_client/services/gmail.py` | Account email activity |
| **Fireflies** | GraphQL | `mcp_client/services/fireflies.py` | Meeting transcripts, account search |

Each service wraps a synchronous SDK in async methods (via `run_in_executor`), providing a consistent interface regardless of the underlying library.

## Transport Abstraction

The service layer supports multiple transport modes, though only direct API is used today:

| Transport | How It Works | Status |
|-----------|-------------|--------|
| `None` (direct API) | Service instantiates the SDK library directly | **Production default** |
| `WebSocketTransport` | Connects to an MCP server over WebSocket | Built, not used |
| `StdioTransport` | Connects to an MCP server over stdio subprocess | Built, removed in Phase 1 |

The transport abstraction exists so that services can eventually be swapped to run behind dedicated MCP servers without changing route code. For now, direct API is simpler and has no subprocess overhead.

## How Bedrock Uses Services

```
main.py startup
  └── UnifiedMCPClient()
        ├── connect_salesforce(None)   → SalesforceMCPService
        ├── connect_sage_intacct(None) → SageIntacctMCPService
        ├── connect_slack(None)        → SlackMCPService
        ├── connect_google_drive(t)    → GoogleDriveMCPService
        ├── connect_google_calendar()  → GoogleCalendarMCPService
        ├── connect_gmail()            → GmailMCPService
        └── connect_fireflies()        → FirefliesMCPService

Route files access services via dependency injection:
  client = Depends(get_mcp_client)
  salesforce = client.salesforce
  result = await salesforce.query_all(soql)
```

Services fail independently. If Slack credentials are missing, Slack endpoints return 503 but all other services work normally.

## Pebble Integration

Pebble (the prospect research AI pipeline) does **not** use `UnifiedMCPClient`. It operates as a separate service:

```
Bedrock (main.py, port 8000)
    │
    │  REST API calls
    │  POST /api/v1/research/request
    │  GET  /api/v1/research/profiles/{contact_id}
    │  POST /api/v1/research/feedback
    │
    ▼
Pebble (port 8001)
    │
    │  Direct API calls (no MCP layer)
    │  ProPublica 990s, SEC EDGAR, FEC, USAspending, Wikipedia
    │
    ▼
  Anthropic API (Claude models via bee hierarchy)
```

Pebble has its own data source clients and LLM orchestration. It does not share `UnifiedMCPClient` services. The integration between Bedrock and Pebble is plain REST (Integration #9 in `product/crm-architecture/integration-register.md`).

## Future Vision

### Near-Term (Pebble Stages 2-3)

**Tighter Bedrock-Pebble coupling**: As Pebble evolves into Stages 2-3 (internal data integration, bulk categorization), it will need Salesforce data from Bedrock:
- Contact lookups (`GET /api/salesforce/contacts/lookup`)
- Giving history (`GET /api/salesforce/contacts/{id}/giving-history`)
- Bulk research requests tied to Bedrock Task creation

These endpoints will be added to `main.py` routes and consumed by Pebble over REST. Pebble will not directly use `UnifiedMCPClient`.

### Medium-Term

**Per-user OAuth**: Currently services use a shared service account. Future work adds per-user OAuth for Slack, Salesforce, and Google — enabling DMs, private channels, and user-specific data access. The `UnifiedMCPClient` will support both service-account and per-user connections.

### Long-Term

**MCP Protocol alignment**: If and when it makes sense, individual services could be extracted into standalone MCP servers (conforming to Anthropic's Model Context Protocol spec). The existing transport abstraction makes this possible without changing route code — swap `transport=None` for a WebSocket or stdio transport pointing at the MCP server.

This is not planned for any specific milestone. Direct API calls are simpler, have less latency, and are easier to debug. The migration to MCP servers would only happen if there's a clear benefit (e.g., sharing services across multiple applications, or leveraging MCP-native tooling).

## Related Documents

- [architecture-server-migration.md](architecture-server-migration.md) — Why and how we migrated from `simple_server.py` to `main.py`
- `product/crm-architecture/integration-register.md` — Integration #9 (Pebble)
- `tasks/pebble-evolution-roadmap.md` — Pebble Stages 1-4 spec
