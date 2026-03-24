"""L0 handler — direct CRM lookup, no LLM. Free, instant."""

from __future__ import annotations

import logging
from typing import Optional

from ..router import RouteResult
from . import HandlerResponse

logger = logging.getLogger("pebble.handlers.level0")


async def handle_l0(
    route: RouteResult,
    crm_bridge,
    search_results: Optional[dict] = None,
) -> HandlerResponse:
    """Handle L0 queries — direct CRM data formatted as text.

    No LLM involved. Covers: field lookups, entity lists, counts, pipeline.
    """
    intent = route.intent
    crm_match = route.entities.get("crm_match")

    # Contact field lookup — "What's Jane's title?"
    if intent == "contact_field_lookup" and search_results:
        contacts = search_results.get("Contact", [])
        if contacts:
            c = contacts[0]
            name = c.get("Name", "Unknown")
            title = c.get("Title", "No title listed")
            email = c.get("Email", "")
            account = (c.get("Account") or {}).get("Name", "")
            parts = [f"**{name}**"]
            if title:
                parts.append(f"Title: {title}")
            if account:
                parts.append(f"Organization: {account}")
            if email:
                parts.append(f"Email: {email}")
            return HandlerResponse(
                text="\n".join(parts),
                level=0,
                intent=intent,
                data={"contact": c},
            )

    # Pipeline query
    if intent == "pipeline_query" and crm_bridge:
        opps = await crm_bridge.get_opportunities()
        if opps:
            total = sum(float(o.get("Amount") or 0) for o in opps)
            open_count = len([o for o in opps if o.get("StageName", "").lower() not in ("closed won", "closed lost")])
            return HandlerResponse(
                text=f"Pipeline: **{open_count} open opportunities** totaling **${total:,.0f}**.",
                level=0,
                intent=intent,
                data={"open_count": open_count, "total": total},
            )

    # Entity list — "Show contacts" / "List accounts"
    if intent == "entity_list" and search_results:
        for obj_type in ("Contact", "Account", "Opportunity"):
            records = search_results.get(obj_type, [])
            if records:
                lines = [f"Found {len(records)} {obj_type.lower()}(s):"]
                for r in records[:10]:
                    name = r.get("Name", "Unknown")
                    lines.append(f"  - {name}")
                if len(records) > 10:
                    lines.append(f"  ... and {len(records) - 10} more")
                return HandlerResponse(
                    text="\n".join(lines),
                    level=0,
                    intent=intent,
                    data={obj_type: records},
                )

    # Generic: if we have a CRM match, show basic info
    if crm_match:
        return HandlerResponse(
            text=f"Found: **{crm_match['name']}** ({crm_match['type']})",
            level=0,
            intent=intent,
            data={"crm_match": crm_match},
        )

    # Fallback
    search_term = route.entities.get("person_name") or route.entities.get("org_name") or "that"
    return HandlerResponse(
        text=f"I couldn't find CRM data for '{search_term}'. Try a more specific name or check the spelling.",
        level=0,
        intent=intent,
    )
