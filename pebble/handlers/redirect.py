"""Redirect handler — out-of-scope queries with helpful handoff."""

from __future__ import annotations

from ..router import RouteResult
from . import HandlerResponse


def handle_redirect(route: RouteResult) -> HandlerResponse:
    """Return a redirect message pointing the user to the right tool."""
    return HandlerResponse(
        text=route.redirect_reason or "That's outside Pebble's scope.",
        level=-1,
        intent=route.intent,
        redirect_target=route.redirect_target,
        redirect_reason=route.redirect_reason,
    )
