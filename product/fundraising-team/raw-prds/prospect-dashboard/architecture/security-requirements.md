---
type: architecture-doc
id: arch-security
status: draft
created: 2026-03-13
updated: 2026-03-13
---

# Security Requirements

## What data we're protecting

This application handles sensitive data that requires careful handling:

- **Donor PII:** Names, emails, phone numbers, LinkedIn profiles, organizational affiliations
- **Wealth estimates:** Giving capacity tiers, net worth indicators — highly sensitive if leaked
- **Relationship intelligence:** Who Nick knows, how long, what the connection is — competitive advantage
- **Pipeline financials:** Estimated and confirmed donation/contract amounts
- **Internal strategy:** Which prospects are being cultivated, which funders are being approached

A data breach would damage donor trust, violate privacy expectations, and potentially expose Pursuit to legal liability.

## Prototype phase (Phases 1-3): Minimum viable security

### Data storage
- All data stored client-side in IndexedDB — no server, no cloud database
- This means data lives on the user's browser/device only
- Limitation: IndexedDB is NOT encrypted at rest by default. Browser data could be accessed by anyone with physical access to the machine.
- Mitigation for prototype: acceptable risk for internal team use on Pursuit-managed devices. NOT acceptable if deployed to personal devices.

### Secrets management
- API keys (Claude API in Phase 2) stored in `.env` files, never in code
- `.env` added to `.gitignore` before any keys are created
- Environment variables loaded at build time via Vite's `import.meta.env`
- No secrets in client-side JavaScript bundles — Claude API calls should go through a lightweight proxy or serverless function (Phase 2)

### Salesforce connection (current vs target)
- **Settings already has a Salesforce connection:** Users can connect or disconnect their Salesforce account via OAuth in the app’s Settings page; when connected, their actions are attributed to their Salesforce identity.
- **Current backend:** The server may still use a **server-side Salesforce config** (e.g. `config.py` / `SALESFORCE_CONFIG`) with shared credentials (username, password, client id/secret) as a fallback when the user has not connected their own Salesforce.
- **Target:** Eventually **remove the SF config that holds shared secrets** and switch to **user-based Salesforce connection only** where possible (each user connects via OAuth in Settings; backend uses that user’s tokens for API calls). This avoids storing org credentials in config and aligns with per-user attribution. Document any remaining need for a service account (e.g. background sync) separately.

### Data files
- LinkedIn CSVs, prospect lists, and Salesforce exports must NEVER be committed to git
- `.gitignore` must include: `*.csv`, `data/`, `.env`, `.env.local`, `.env.production`
- Data files should be stored outside the repo directory when possible

### Deployment
- Vercel/Netlify deployment should be behind a shared link (not indexed by search engines)
- Consider Vercel password protection (available on Pro plan) or basic auth via Netlify
- No sensitive data should be in the deployed bundle — all data is loaded via CSV upload at runtime

### What we're NOT doing in prototype
- No authentication or user accounts
- No encryption at rest
- No role-based access control
- No audit logging
- These are all deferred to Phase 4+ (PostgreSQL migration)

## Phase 4+: Production security

### Authentication
- SSO via Google Workspace (Pursuit already uses Google)
- All users must authenticate before accessing any data
- Session management with secure, httpOnly cookies

### Authorization (RBAC)
- **Admin:** Full access (JP, Nick)
- **Team member:** Read/write own opportunities, leads, tasks. Read-only on others.
- **Executive view:** Read-only pipeline summary and network search highlights (Nick)
- Network search results (especially wealth tiers) should be restricted to authorized users

### Encryption
- **At rest:** PostgreSQL Transparent Data Encryption (TDE) for the database. Column-level encryption for wealth_tier and composite_score fields.
- **In transit:** HTTPS everywhere (enforced at deployment layer)
- **Backups:** Encrypted with separate key from production database

### PII handling
- **Data minimization:** Don't store data you don't need. If a prospect list field isn't used in scoring, don't import it.
- **Access logging:** Record who viewed which prospect records and when (audit trail)
- **Data retention policy:** Define how long prospect data is kept. Archive or purge records for prospects not contacted within 12 months.
- **Right to deletion:** Be able to remove a specific person's data if requested (even though this is internal, it's good practice and may be legally required depending on jurisdiction)

### Backup and redundancy (the 3-2-1 rule)
- **3** copies of all data
- On **2** different storage types (e.g., PostgreSQL primary + cloud backup)
- **1** copy offsite (e.g., encrypted S3 bucket in different region)
- Automated daily backups with point-in-time recovery
- Backup restoration tested monthly
- Replication: secondary database mirrors primary in real-time (for future phases where uptime matters)

### API security (Claude API, Phase 2+)
- API calls routed through server-side proxy — never directly from client
- API key stored in server environment variables, never exposed to browser
- Rate limiting on proxy to prevent abuse
- Request/response logging for audit (excluding PII in logs)

## Security checklist for every phase

Before deploying any phase, verify:
- [ ] `.env` is in `.gitignore`
- [ ] No CSV data files in the git repo
- [ ] No API keys in client-side code
- [ ] No sensitive data in URL parameters
- [ ] Deployment URL is not publicly indexed
- [ ] Team members know not to share the deployment URL externally
