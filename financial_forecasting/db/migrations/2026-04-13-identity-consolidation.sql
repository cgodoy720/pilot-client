-- ============================================================================
-- Migration: Staff identity consolidation — backfill org_users + user_config
-- Date: 2026-04-13
--
-- Makes public.org_users the canonical staff identity table.
-- Copies sf_user_id and profile data from bedrock.app_user into
-- org_users + user_config. Creates org_users rows for any app_user
-- entries that don't have a match.
--
-- Idempotent: safe to re-run (ON CONFLICT DO NOTHING, WHERE ... IS NULL).
-- ============================================================================

BEGIN;

-- Step 1: Copy sf_user_id from app_user to org_users (by email match)
UPDATE public.org_users ou
SET sf_user_id = au.sf_user_id
FROM bedrock.app_user au
WHERE LOWER(au.email) = LOWER(ou.email)
  AND au.sf_user_id IS NOT NULL
  AND ou.sf_user_id IS NULL;

-- Step 2: Copy is_active deactivations from app_user to org_users
UPDATE public.org_users ou
SET is_active = au.is_active
FROM bedrock.app_user au
WHERE LOWER(au.email) = LOWER(ou.email)
  AND au.is_active = false;

-- Step 3: Populate user_config from app_user (where org_users match exists)
INSERT INTO bedrock.user_config (org_user_id, profile_id)
SELECT ou.id, au.profile_id
FROM bedrock.app_user au
JOIN public.org_users ou ON LOWER(ou.email) = LOWER(au.email)
ON CONFLICT (org_user_id) DO NOTHING;

-- Step 4: Create org_users rows for any app_user entries without a match
INSERT INTO public.org_users (id, email, display_name, sf_user_id, is_active)
SELECT
    uuid_generate_v4(),
    au.email,
    COALESCE(au.name, ''),
    au.sf_user_id,
    au.is_active
FROM bedrock.app_user au
WHERE NOT EXISTS (
    SELECT 1 FROM public.org_users ou WHERE LOWER(ou.email) = LOWER(au.email)
)
ON CONFLICT (email) DO NOTHING;

-- Step 5: Create user_config for any newly created org_users rows
INSERT INTO bedrock.user_config (org_user_id, profile_id)
SELECT ou.id, au.profile_id
FROM bedrock.app_user au
JOIN public.org_users ou ON LOWER(ou.email) = LOWER(au.email)
WHERE NOT EXISTS (
    SELECT 1 FROM bedrock.user_config uc WHERE uc.org_user_id = ou.id
)
ON CONFLICT (org_user_id) DO NOTHING;

-- Report
SELECT
    (SELECT COUNT(*) FROM bedrock.app_user) AS app_user_total,
    (SELECT COUNT(*) FROM bedrock.user_config) AS user_config_total,
    (SELECT COUNT(*) FROM public.org_users WHERE sf_user_id IS NOT NULL) AS org_users_with_sf_id;

COMMIT;
