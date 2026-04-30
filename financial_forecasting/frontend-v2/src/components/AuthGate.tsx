import { Navigate, useLocation } from "react-router-dom";
import { type ReactNode } from "react";

import { useCurrentUser } from "@/services/auth";

/**
 * Wrap routes that require an authenticated session. If the user isn't
 * logged in, redirect to /login. While the auth check is in flight,
 * render a minimal loading shell — never the protected page.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="grid h-screen place-items-center bg-bg text-[13px] text-ink-3">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={`/login${
          location.pathname && location.pathname !== "/"
            ? `?next=${encodeURIComponent(location.pathname)}`
            : ""
        }`}
        replace
      />
    );
  }

  return <>{children}</>;
}
