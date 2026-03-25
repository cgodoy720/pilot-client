-- Projects schema — idempotent (safe to re-run)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS project (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workstream (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id  UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS milestone (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workstream_id UUID NOT NULL REFERENCES workstream(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'On Track'
                  CHECK (status IN ('On Track', 'At Risk', 'Needs Attention', 'Completed')),
    priority      TEXT NOT NULL DEFAULT 'Now'
                  CHECK (priority IN ('Now', 'Later', 'On-going')),
    owner         TEXT NOT NULL DEFAULT '',
    description   TEXT NOT NULL DEFAULT '',
    source_links  TEXT[] NOT NULL DEFAULT '{}',
    sort_order    INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_task (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    milestone_id  UUID NOT NULL REFERENCES milestone(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'Not Started'
                  CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'Blocked', 'On Hold')),
    owner         TEXT NOT NULL DEFAULT '',
    deadline      DATE,
    description   TEXT NOT NULL DEFAULT '',
    updates       TEXT NOT NULL DEFAULT '',
    links         TEXT[] NOT NULL DEFAULT '{}',
    depends_on    UUID[] NOT NULL DEFAULT '{}',
    sort_order    INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add start_date for Gantt chart support (idempotent)
DO $$ BEGIN
    ALTER TABLE project_task ADD COLUMN start_date DATE;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Updated-at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
    FOR t IN SELECT unnest(ARRAY['project', 'workstream', 'milestone', 'project_task'])
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I; '
            'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I '
            'FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
            t, t, t, t
        );
    END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- Salesforce Task Dependencies (local storage — SF has no native dependency support)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sf_task_dependency (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id         TEXT NOT NULL,
    depends_on_id   TEXT NOT NULL,
    external_source TEXT NOT NULL DEFAULT 'salesforce',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (task_id, depends_on_id)
);
CREATE INDEX IF NOT EXISTS idx_sf_dep_task ON sf_task_dependency(task_id);
CREATE INDEX IF NOT EXISTS idx_sf_dep_depends ON sf_task_dependency(depends_on_id);

COMMENT ON TABLE sf_task_dependency IS
  'Stores dependency edges between external CRM tasks. Salesforce Task objects '
  'have no native dependency support, so this is stored locally. '
  'Migration note: when moving off Salesforce, convert these edges to '
  'project_task.depends_on UUID arrays (the native project task dependency model).';

-- ---------------------------------------------------------------------------
-- Salesforce Task ↔ Project Bridge (local link — SF tasks appear in Project views)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sf_task_project (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sf_task_id      TEXT NOT NULL,
    external_source TEXT NOT NULL DEFAULT 'salesforce',
    project_id      UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    milestone_id    UUID REFERENCES milestone(id) ON DELETE SET NULL,
    sort_order      INT DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (sf_task_id)
);
CREATE INDEX IF NOT EXISTS idx_stp_project ON sf_task_project(project_id);
CREATE INDEX IF NOT EXISTS idx_stp_source ON sf_task_project(external_source);

COMMENT ON TABLE sf_task_project IS
  'Bridge table linking external CRM tasks (currently Salesforce) to local projects. '
  'This is the critical coupling point between the external CRM and local project management. '
  'When migrating off Salesforce: (1) sf_task_id maps to the external Task ID, '
  '(2) external_source identifies which CRM system the task came from, '
  '(3) all task data lives in the CRM — this table only stores the relationship. '
  'Migration path: create project_task rows from CRM data, then drop this table.';

COMMENT ON COLUMN sf_task_project.sf_task_id IS
  'External CRM task identifier. Salesforce format: 00T + 12/15 alphanumeric chars. '
  'Stored as TEXT to accommodate any CRM ID format after migration.';

COMMENT ON COLUMN sf_task_project.external_source IS
  'CRM system this task originates from. Currently always "salesforce". '
  'Added for forward-compatibility when migrating to a different CRM.';

-- Add opportunity_id to project table for opportunity-based projects
DO $$ BEGIN
    ALTER TABLE project ADD COLUMN opportunity_id TEXT;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Permission Profiles & User Roles
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS permission_profile (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    is_default  BOOLEAN DEFAULT false,
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_user (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sf_user_id  TEXT UNIQUE,
    email       TEXT NOT NULL UNIQUE,
    name        TEXT DEFAULT '',
    profile_id  UUID REFERENCES permission_profile(id) ON DELETE SET NULL,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS opportunity_lock (
    sf_opportunity_id TEXT PRIMARY KEY,
    locked_by         TEXT NOT NULL,
    locked_at         TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_opp_lock_locked_by ON opportunity_lock(locked_by);

-- Seed permission profiles (idempotent via ON CONFLICT)
INSERT INTO permission_profile (name, description, is_default, permissions)
VALUES (
    'Admin',
    'Full access to all features',
    false,
    '{
        "view_opportunities": true,
        "edit_own_opportunities": true,
        "edit_all_opportunities": true,
        "create_opportunities": true,
        "bulk_update_opportunities": true,
        "lock_own_opportunities": true,
        "reassign_opportunities": true,
        "view_tasks": true,
        "edit_own_tasks": true,
        "edit_all_tasks": true,
        "create_tasks": true,
        "view_revenue_dashboard": true,
        "view_cashflow_forecasts": true,
        "view_sage_invoices_payments": true,
        "create_sage_invoices": true,
        "match_invoices": true,
        "manage_payment_schedules": true,
        "generate_financial_reports": true,
        "trigger_data_sync": true,
        "manage_users_roles": true
    }'::jsonb
) ON CONFLICT (name) DO NOTHING;

INSERT INTO permission_profile (name, description, is_default, permissions)
VALUES (
    'Fundraiser',
    'Standard fundraiser access — own opportunities and tasks, no financial writes',
    true,
    '{
        "view_opportunities": true,
        "edit_own_opportunities": true,
        "edit_all_opportunities": false,
        "create_opportunities": true,
        "bulk_update_opportunities": false,
        "lock_own_opportunities": true,
        "reassign_opportunities": true,
        "view_tasks": true,
        "edit_own_tasks": true,
        "edit_all_tasks": false,
        "create_tasks": true,
        "view_revenue_dashboard": true,
        "view_cashflow_forecasts": true,
        "view_sage_invoices_payments": false,
        "create_sage_invoices": false,
        "match_invoices": false,
        "manage_payment_schedules": false,
        "generate_financial_reports": false,
        "trigger_data_sync": false,
        "manage_users_roles": false
    }'::jsonb
) ON CONFLICT (name) DO NOTHING;

INSERT INTO permission_profile (name, description, is_default, permissions)
VALUES (
    'Manager',
    'Full CRM access — edit and reassign all opportunities, manage all tasks, view financials',
    false,
    '{
        "view_opportunities": true,
        "edit_own_opportunities": true,
        "edit_all_opportunities": true,
        "create_opportunities": true,
        "bulk_update_opportunities": true,
        "lock_own_opportunities": true,
        "reassign_opportunities": true,
        "view_tasks": true,
        "edit_own_tasks": true,
        "edit_all_tasks": true,
        "create_tasks": true,
        "view_revenue_dashboard": true,
        "view_cashflow_forecasts": true,
        "view_sage_invoices_payments": true,
        "create_sage_invoices": false,
        "match_invoices": false,
        "manage_payment_schedules": false,
        "generate_financial_reports": true,
        "trigger_data_sync": false,
        "manage_users_roles": false,
        "use_pebble_chat": true
    }'::jsonb
) ON CONFLICT (name) DO NOTHING;

-- Backfill: add reassign_opportunities to existing profiles that lack it
UPDATE permission_profile
SET permissions = permissions || '{"reassign_opportunities": true}'::jsonb
WHERE NOT (permissions ? 'reassign_opportunities');
