"""L1 handler — CRM analysis with Haiku synthesis. ~$0.003, 2-5s."""

from __future__ import annotations

import logging
from typing import Optional

from ..router import RouteResult
from . import HandlerResponse

logger = logging.getLogger("pebble.handlers.level1")


async def handle_l1(
    route: RouteResult,
    crm_bridge,
    search_results: Optional[dict] = None,
    client=None,
) -> HandlerResponse:
    """Handle L1 queries — CRM data + Haiku synthesis.

    Builds a context block from CRM data, then uses a single Haiku call
    to synthesize a natural language response.
    """
    intent = route.intent
    person_name = route.entities.get("person_name", "")
    org_name = route.entities.get("org_name", "")
    crm_match = route.entities.get("crm_match")

    # Build context from CRM data
    context_parts = []
    cost = 0.0

    if search_results:
        contacts = search_results.get("Contact", [])
        accounts = search_results.get("Account", [])
        opportunities = search_results.get("Opportunity", [])

        if contacts:
            context_parts.append(f"Contacts ({len(contacts)}):")
            for c in contacts[:5]:
                name = c.get("Name", "Unknown")
                title = c.get("Title", "")
                account = (c.get("Account") or {}).get("Name", "")
                context_parts.append(f"  - {name}, {title} at {account}".rstrip(" at "))

        if accounts:
            context_parts.append(f"Accounts ({len(accounts)}):")
            for a in accounts[:5]:
                context_parts.append(f"  - {a.get('Name', 'Unknown')} ({a.get('Type', '')})")

        if opportunities:
            context_parts.append(f"Opportunities ({len(opportunities)}):")
            for o in opportunities[:5]:
                name = o.get("Name", "Unknown")
                amount = o.get("Amount")
                stage = o.get("StageName", "")
                amt_str = f" — ${float(amount):,.0f}" if amount else ""
                context_parts.append(f"  - {name}{amt_str} ({stage})")

    # If we have enough context for synthesis, use Haiku
    if context_parts and client is not None:
        try:
            context_text = "\n".join(context_parts)
            search_term = person_name or org_name or "the query"

            system_prompt = (
                "You are Pebble, a CRM intelligence assistant. Given CRM data, "
                "provide a concise, actionable analysis. Be specific with numbers "
                "and dates. Use markdown formatting (bold for names and amounts)."
            )
            user_prompt = (
                f"User asked about: {search_term}\n"
                f"Query intent: {intent}\n\n"
                f"CRM data:\n{context_text}\n\n"
                f"Provide a brief, useful analysis."
            )

            result = client.complete("l1_synthesizer", user_prompt, system_prompt)
            text = result.get("text", "")
            usage = result.get("usage", {})
            input_tokens = usage.get("input_tokens", 0)
            output_tokens = usage.get("output_tokens", 0)
            # Haiku: $1/Mtok input, $5/Mtok output
            cost = (input_tokens * 1.0 + output_tokens * 5.0) / 1_000_000

            if text:
                return HandlerResponse(
                    text=text,
                    level=1,
                    intent=intent,
                    cost_usd=cost,
                    data=search_results,
                )
        except Exception as e:
            logger.warning("L1 Haiku synthesis failed: %s", e)

    # Fallback: structured text without LLM
    if context_parts:
        return HandlerResponse(
            text="\n".join(context_parts),
            level=1,
            intent=intent,
            data=search_results,
        )

    # No data at all
    search_term = person_name or org_name or "that"
    return HandlerResponse(
        text=f"I don't have enough CRM data to analyze '{search_term}'. Try a more specific query.",
        level=1,
        intent=intent,
    )
