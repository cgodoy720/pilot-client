"""Export research profiles as Markdown (and optionally PDF in the future)."""

from datetime import datetime, timezone


def render_profile_markdown(profile: dict, prospect_name: str, prospect_org: str) -> str:
    """Render a research profile as a Markdown document.

    Args:
        profile: Profile dict with claims, summary, confidence_score.
        prospect_name: Display name of the prospect.
        prospect_org: Organization name.

    Returns:
        Markdown string.
    """
    lines: list[str] = []
    generated = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    confidence = profile.get("confidence_score", "unknown")

    # Header
    lines.append(f"# Prospect Research: {prospect_name}")
    if prospect_org:
        lines.append(f"**Organization:** {prospect_org}")
    lines.append(f"**Generated:** {generated}")
    lines.append(f"**Confidence:** {confidence}")
    if profile.get("partial"):
        lines.append("**Status:** Partial (some agents failed)")
    lines.append("")

    # Summary
    summary = profile.get("summary", "")
    if summary:
        lines.append("## Summary")
        lines.append("")
        lines.append(summary)
        lines.append("")

    # Claims table
    claims = profile.get("claims", [])
    if claims:
        lines.append(f"## Claims ({len(claims)})")
        lines.append("")
        lines.append("| # | Claim | Source | Confidence | Status |")
        lines.append("|---|-------|--------|------------|--------|")
        for i, claim in enumerate(claims, 1):
            text = claim.get("text", "").replace("|", "\\|").replace("\n", " ")
            url = claim.get("source_url", "")
            source_link = f"[Link]({url})" if url else "-"
            conf = claim.get("confidence", "medium")
            temporal = claim.get("temporal_status", "")
            if temporal and temporal != "unknown":
                status = temporal
            else:
                status = "-"
            lines.append(f"| {i} | {text} | {source_link} | {conf} | {status} |")
        lines.append("")

    # Sources list (unique URLs)
    urls = sorted({c.get("source_url", "") for c in claims if c.get("source_url")})
    if urls:
        lines.append("## Sources")
        lines.append("")
        for url in urls:
            lines.append(f"- {url}")
        lines.append("")

    return "\n".join(lines)


def render_profile_pdf(markdown_text: str) -> bytes:
    """Best-effort PDF rendering from markdown text.

    Falls back to returning the markdown as UTF-8 bytes if PDF libraries
    are not available.
    """
    try:
        import markdown as md

        html = md.markdown(markdown_text, extensions=["tables"])
        # Wrap in minimal HTML for readability
        full_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
body {{ font-family: sans-serif; margin: 2em; }}
table {{ border-collapse: collapse; width: 100%; }}
th, td {{ border: 1px solid #ccc; padding: 6px 10px; text-align: left; }}
th {{ background: #f5f5f5; }}
</style></head><body>{html}</body></html>"""

        try:
            from weasyprint import HTML
            return HTML(string=full_html).write_pdf()
        except ImportError:
            # weasyprint not installed -- return markdown as bytes
            return markdown_text.encode("utf-8")
    except ImportError:
        # markdown library not installed -- return raw text
        return markdown_text.encode("utf-8")
