import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  GitBranch,
  Trophy,
  FolderOpen,
  CheckSquare,
  Users,
  Search,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useCurrentUser, useSalesforceStatus } from "@/services/auth";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/accounts", label: "Accounts", icon: Building2 },
  { to: "/pipeline", label: "Pipeline", icon: GitBranch },
  { to: "/awards", label: "Awards", icon: Trophy },
  { to: "/projects", label: "Projects", icon: FolderOpen },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/contacts", label: "Contacts", icon: Users },
] as const;

const NAV_COLLAPSED_W = 52;
const NAV_EXPANDED_W = 232;

function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("bedrock:sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });
  const toggle = () =>
    setCollapsed((c) => {
      const next = !c;
      try { localStorage.setItem("bedrock:sidebar-collapsed", String(next)); } catch {}
      return next;
    });
  return { collapsed, toggle };
}

export function AppShell() {
  const { collapsed, toggle } = useSidebarCollapsed();
  return (
    <div
      className="grid h-screen overflow-hidden transition-[grid-template-columns] duration-200"
      style={{
        gridTemplateColumns: `${collapsed ? NAV_COLLAPSED_W : NAV_EXPANDED_W}px 1fr`,
      }}
    >
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <main className="flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { data: user } = useCurrentUser();
  const sf = useSalesforceStatus();

  return (
    <aside
      className={cn(
        "relative flex flex-col gap-1 overflow-hidden border-r border-border bg-surface-2 transition-all duration-200",
        collapsed ? "p-2" : "p-3",
      )}
    >
      {/* Logo / wordmark */}
      <div
        className={cn(
          "flex items-center gap-2 px-1 py-3",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-md bg-ink text-[13px] font-bold tracking-tight text-surface">
          B
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-semibold tracking-tight">Bedrock</span>
            <span className="text-[11px] text-ink-3">Pursuit · Workspace</span>
          </div>
        )}
      </div>

      {/* Search — hidden when collapsed */}
      {!collapsed && (
        <div className="mb-2 mt-1 flex h-[30px] items-center gap-2 rounded-md border border-border-strong bg-surface px-3 text-ink-3">
          <Search size={13} />
          <input
            placeholder="Search records, contacts…"
            className="min-w-0 flex-1 border-0 bg-transparent text-[12.5px] text-ink outline-none placeholder:text-ink-4"
          />
          <kbd className="rounded border border-border-strong px-1.5 py-px text-[10px] text-ink-3">
            ⌘K
          </kbd>
        </div>
      )}

      {!collapsed && (
        <div className="px-2 pb-1 pt-3 text-[10.5px] font-semibold uppercase tracking-wider text-ink-3">
          Workspace
        </div>
      )}

      <nav className="flex flex-col gap-px">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                "flex select-none items-center rounded-md text-[13px] font-medium text-ink-2 hover:bg-black/[0.04] hover:text-ink",
                collapsed
                  ? "h-9 w-9 justify-center"
                  : "gap-2.5 px-2.5 py-1.5",
                isActive &&
                  "border border-border-strong bg-surface text-ink shadow-sm",
              )
            }
          >
            <item.icon size={16} className="flex-shrink-0 opacity-70" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-px pt-4">
        {/* SF status dot */}
        {!sf.isLoading && (
          <NavLink
            to="/settings"
            title={
              collapsed
                ? sf.data?.connected
                  ? `Salesforce: ${sf.data.user_name ?? "connected"}`
                  : "Salesforce not connected"
                : undefined
            }
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-md hover:bg-black/[0.04]",
                collapsed ? "h-9 w-9 justify-center" : "gap-2 px-2.5 py-1.5 text-[12px]",
                isActive && "bg-surface",
              )
            }
          >
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full",
                sf.data?.connected ? "bg-green" : "bg-amber",
              )}
            />
            {!collapsed && (
              <span className="text-ink-3">
                {sf.data?.connected ? "Salesforce connected" : "Not connected"}
              </span>
            )}
          </NavLink>
        )}

        <NavLink
          to="/settings"
          title={collapsed ? "Settings" : undefined}
          className={({ isActive }) =>
            cn(
              "flex select-none items-center rounded-md text-[13px] font-medium text-ink-2 hover:bg-black/[0.04] hover:text-ink",
              collapsed ? "h-9 w-9 justify-center" : "gap-2.5 px-2.5 py-1.5",
              isActive && "border border-border-strong bg-surface text-ink shadow-sm",
            )
          }
        >
          <SettingsIcon size={16} className="flex-shrink-0 opacity-70" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        {/* User avatar */}
        {user && (
          <div
            className={cn(
              "mt-2 flex items-center rounded-md px-1 py-2",
              collapsed ? "justify-center" : "gap-2 px-2.5",
            )}
          >
            {user.picture ? (
              <img
                src={user.picture}
                alt=""
                className="h-6 w-6 flex-shrink-0 rounded-full border border-border-strong"
              />
            ) : (
              <div className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-surface text-[11px] font-semibold text-ink-2">
                {user.name?.[0] ?? "?"}
              </div>
            )}
            {!collapsed && (
              <div className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate text-[12px] font-medium">{user.name}</span>
                <span className="truncate text-[11px] text-ink-4">{user.email}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "absolute bottom-4 flex h-5 w-5 items-center justify-center rounded-full border border-border-strong bg-surface text-ink-3 shadow-sm hover:bg-surface-2 hover:text-ink",
          collapsed ? "left-1/2 -translate-x-1/2" : "right-2",
        )}
      >
        {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
      </button>
    </aside>
  );
}
