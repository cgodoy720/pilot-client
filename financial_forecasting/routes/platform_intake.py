"""Platform Intake API — Bedrock-side submission endpoint.

Writes rows into the shared `public.platform_intake` table that the
Pursuit learning platform already uses for its own bug/feature reports.
Bedrock submissions are tagged with `source = 'bedrock'` so the routing
layer (Slack bridge, Linear sync, etc.) can tell the two products apart
without collisions.

Why public.platform_intake instead of a new Bedrock table:
    * Pursuit platform already routes platform_intake rows into the
      right Slack channel and Linear project.
    * A single shared inbox means we don't duplicate triage tooling.
    * The `source` column cleanly partitions Pursuit vs. Bedrock rows
      for anyone running reports.

Auth: any logged-in user (no permission check). Reporter email is taken
from the session cookie (`user["email"]`) — the form's reporter field
is a display-only convenience that can be overridden client-side but is
never trusted server-side.
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from auth import require_auth
from db import get_db
from services.gcs_intake import (
    GCSUploadError,
    MAX_UPLOAD_BYTES,
    resolve_user_folder,
    upload_intake_file,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/platform-intake", tags=["platform-intake"])

ALLOWED_TYPES = {"bug", "feature"}
ALLOWED_PRIORITIES = {"urgent", "high", "medium", "low"}

# Bedrock-specific component taxonomy. Intentionally narrower than the
# Pursuit platform's list — we don't ask Bedrock users "is this a Platform
# Intake bug?" because it always is, from their perspective.
ALLOWED_COMPONENTS = {
    "priorities",
    "details",
    "progress",
    "opportunities",
    "accounts",
    "contacts",
    "leads",
    "tasks",
    "salesforce_sync",
    "other",
}


def _clean(value: Optional[str], max_len: int) -> str:
    return (value or "").strip()[:max_len]


@router.post("")
async def submit_platform_intake(
    type: str = Form(..., description="bug | feature"),
    title: str = Form(..., min_length=1),
    description: str = Form(..., min_length=1),
    platform_component: str = Form(...),
    recommended_prioritization: str = Form(...),
    prioritization_justification: str = Form(""),
    reporter_name: str = Form(""),
    attachment: Optional[UploadFile] = File(None),
    user=Depends(require_auth),
    db=Depends(get_db),
):
    """Submit a Bedrock bug or feature request.

    Accepts `multipart/form-data` so the form can carry an optional file
    attachment (screenshot, screen recording, PDF, etc.). On success the
    response is `{id, upload_url, source}` — `upload_url` echoes back the
    `gs://...` URI so the frontend can log it or link to it from an
    admin UI later.
    """
    # --- Validate the basic form fields -------------------------------
    type_norm = _clean(type, 16).lower()
    if type_norm not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"type must be one of: {sorted(ALLOWED_TYPES)}",
        )

    priority_norm = _clean(recommended_prioritization, 16).lower()
    if priority_norm not in ALLOWED_PRIORITIES:
        raise HTTPException(
            status_code=400,
            detail=f"recommended_prioritization must be one of: "
                   f"{sorted(ALLOWED_PRIORITIES)}",
        )

    component_norm = _clean(platform_component, 64).lower()
    if component_norm not in ALLOWED_COMPONENTS:
        raise HTTPException(
            status_code=400,
            detail=f"platform_component must be one of: "
                   f"{sorted(ALLOWED_COMPONENTS)}",
        )

    title_clean = _clean(title, 200)
    description_clean = _clean(description, 5000)
    justification_clean = _clean(prioritization_justification, 2000)
    if not title_clean or not description_clean:
        raise HTTPException(
            status_code=400,
            detail="title and description are required.",
        )

    # --- Resolve the reporter identity from the auth cookie ----------
    reporter_email = (user.get("email") or "").strip().lower()
    if not reporter_email:
        # Extremely unlikely given require_auth, but guard anyway so we
        # never write an empty reporter_email to the shared table.
        raise HTTPException(
            status_code=401, detail="Session has no email claim."
        )
    reporter_display = _clean(reporter_name, 200) or user.get("name") or reporter_email

    # --- Optional attachment: upload to GCS first --------------------
    upload_url: Optional[str] = None
    if attachment is not None and attachment.filename:
        content = await attachment.read()
        if len(content) > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=413,
                detail=(
                    f"Attachment exceeds {MAX_UPLOAD_BYTES // (1024 * 1024)} "
                    f"MB limit."
                ),
            )
        folder, org_user_id = await resolve_user_folder(db, email=reporter_email)
        try:
            upload_url = upload_intake_file(
                folder=folder,
                filename=attachment.filename,
                content=content,
                content_type=attachment.content_type or "application/octet-stream",
            )
        except GCSUploadError as exc:
            # Surface the user-friendly message; the underlying error is
            # already logged inside upload_intake_file.
            raise HTTPException(status_code=500, detail=str(exc)) from exc
        logger.info(
            "Platform intake upload stored: %s (org_user_id=%s)",
            upload_url,
            org_user_id,
        )

    # --- Persist the row ---------------------------------------------
    try:
        row = await db.fetchrow(
            """
            INSERT INTO public.platform_intake
                (reporter, reporter_email, type, title, description,
                 platform_component, upload_url, recommended_prioritization,
                 prioritization_justification, source)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'bedrock')
            RETURNING id, created_at
            """,
            reporter_display,
            reporter_email,
            type_norm,
            title_clean,
            description_clean,
            component_norm,
            upload_url,
            priority_norm,
            justification_clean,
        )
    except Exception as exc:
        logger.exception("Failed to insert platform_intake row")
        raise HTTPException(
            status_code=500,
            detail="Could not save your submission. Please try again.",
        ) from exc

    logger.info(
        "Platform intake submitted: id=%s type=%s component=%s priority=%s "
        "reporter=%s has_upload=%s",
        row["id"], type_norm, component_norm, priority_norm,
        reporter_email, upload_url is not None,
    )
    return {
        "success": True,
        "id": str(row["id"]),
        "source": "bedrock",
        "upload_url": upload_url,
        "created_at": row["created_at"].isoformat() if row["created_at"] else None,
    }
