import { useState } from "react";

import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Avatar tile for an SF Account. Renders the company logo when one
 * exists in `public.companies` (via bedrock.sf_account_company_map),
 * falls back to a colored initials gradient otherwise. Same layout in
 * both states so list rows stay aligned.
 *
 * Image errors (404, broken Clearbit link, CORS) silently fall back to
 * initials — never shows a broken-image icon.
 */
export function AccountAvatar({
  name,
  logoUrl,
  size = 24,
  className,
}: {
  name: string | null | undefined;
  logoUrl: string | null | undefined;
  size?: number;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  const showLogo = logoUrl && !errored;

  return (
    <div
      className={cn(
        "grid flex-shrink-0 place-items-center overflow-hidden rounded-md font-semibold text-surface",
        className,
      )}
      style={{
        width: size,
        height: size,
        // Subtle ring so a white logo on white background still has a boundary
        background: showLogo
          ? "var(--surface-2, #f4f4f5)"
          : "linear-gradient(135deg, oklch(0.65 0.10 250), oklch(0.50 0.13 270))",
        fontSize: Math.max(9, Math.round(size / 3)),
      }}
      title={name ?? ""}
    >
      {showLogo ? (
        <img
          src={logoUrl}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setErrored(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <span>{initials(name ?? "?")}</span>
      )}
    </div>
  );
}
