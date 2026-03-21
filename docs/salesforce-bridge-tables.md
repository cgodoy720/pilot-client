# Salesforce Bridge Tables

## Purpose

Salesforce's Task object lacks native support for:
1. **Task dependencies** — no way to say "Task A depends on Task B"
2. **Project assignment** — tasks can link to Opportunities via `WhatId`, but not to our local Project management system (Gantt/Kanban/List views)

These bridge tables store that missing relationship data locally in PostgreSQL while keeping Salesforce as the source of truth for task content.

## Tables

### `sf_task_dependency`

Stores dependency edges between Salesforce tasks.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `task_id` | TEXT | Salesforce Task ID (the dependent task) |
| `depends_on_id` | TEXT | Salesforce Task ID (the prerequisite task) |
| `external_source` | TEXT | CRM origin, currently always `'salesforce'` |
| `created_at` | TIMESTAMPTZ | When the dependency was created |

**Constraint:** `UNIQUE (task_id, depends_on_id)` — prevents duplicate edges.

### `sf_task_project`

Links Salesforce tasks to local projects so they appear in Gantt/Kanban/List views.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `sf_task_id` | TEXT | Salesforce Task ID |
| `external_source` | TEXT | CRM origin, currently always `'salesforce'` |
| `project_id` | UUID | FK to `project(id)`, CASCADE on delete |
| `milestone_id` | UUID | FK to `milestone(id)`, SET NULL on delete |
| `sort_order` | INT | Display ordering within milestone |
| `created_at` | TIMESTAMPTZ | When the link was created |
| `updated_at` | TIMESTAMPTZ | Last modification |

**Constraint:** `UNIQUE (sf_task_id)` — a task belongs to at most one project.

### `project.opportunity_id`

Column added to the existing `project` table. Links a project to a Salesforce Opportunity for opportunity-based project grouping.

## Data Flow

```
Salesforce (MCP)          PostgreSQL (local)         Frontend
─────────────────         ──────────────────         ─────────
Task object ─────────────────────────────────────→ TaskPanel
  (Subject, Status,                                  (edit form)
   Priority, etc.)

                          sf_task_dependency ──────→ Dependency chips
                            (task_id,                 in edit/view
                             depends_on_id)

                          sf_task_project ──────→ Project views
                            (sf_task_id,            (Gantt, Kanban, List)
                             project_id,            Normalized to ProjectTask
                             milestone_id)          interface for rendering
```

## The `external_source` Column

Both bridge tables include an `external_source` column (defaults to `'salesforce'`). This serves two purposes:

1. **Forward-compatibility:** If the org switches from Salesforce to another CRM (e.g., HubSpot), new bridge records use a different source value. Both old and new records coexist during migration.
2. **Audit trail:** During migration, identifies which system each record originated from.

## API Endpoints

### Dependencies (`routes/sf_dependencies.py`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/salesforce/opportunities/_/task-dependencies` | All dependency edges |
| GET | `/api/salesforce/tasks/{id}/dependencies` | Dependencies for one task |
| POST | `/api/salesforce/tasks/{id}/dependencies` | Add dependency |
| DELETE | `/api/salesforce/task-dependencies/{id}` | Remove dependency |

### Project Bridge (`routes/projects.py`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/projects/{id}/sf-tasks` | Link SF task to project |
| DELETE | `/api/sf-task-project/{id}` | Unlink SF task |
| GET | `/api/projects/{id}/sf-tasks` | All SF tasks in a project |
| GET | `/api/projects/by-opportunity/{id}` | Find project by opportunity |
| GET | `/api/sf-task-project/by-task/{id}` | Find project link for a task |

## Schema Definition

See: `db/init.sql` (search for `sf_task_dependency` and `sf_task_project`)

## Migration Playbook: Moving Off Salesforce

When the organization migrates away from Salesforce, these bridge tables are the critical coupling points. Follow these steps:

### Step 1: Materialize Tasks

For each row in `sf_task_project`:
1. Fetch the Salesforce task data (Subject, Status, Priority, ActivityDate, Description, OwnerId)
2. Create a native `project_task` row with:
   - `title` = Subject
   - `status` = mapped Status (see status mapping below)
   - `deadline` = ActivityDate
   - `description` = Description
   - `milestone_id` from the bridge record
3. Record the mapping: `sf_task_id → new project_task.id`

### Step 2: Convert Dependencies

For each row in `sf_task_dependency`:
1. Look up the new `project_task.id` for both `task_id` and `depends_on_id`
2. Add the dependency UUID to the dependent task's `depends_on` array

### Step 3: Migrate Opportunities

Create a local `opportunity` table (schema TBD based on target platform). Populate from Salesforce export. Update `project.opportunity_id` references if needed.

### Step 4: Verify

- All tasks appear correctly in Project views (Gantt, Kanban, List)
- Dependency arrows render correctly in Gantt chart
- No orphaned references

### Step 5: Clean Up

1. Drop `sf_task_project` table
2. Drop `sf_task_dependency` table
3. Remove `external_source` checks from API routes
4. Retire MCP Salesforce client

### Status Mapping Reference

| Salesforce | Project Task |
|------------|-------------|
| Not Started | Not Started |
| In Progress | In Progress |
| Completed | Completed |
| Deferred | On Hold |
| Waiting on someone else | Blocked |
