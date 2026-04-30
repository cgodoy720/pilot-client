import { NavLink, Outlet } from "react-router-dom";
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

export function AppShell() {
  return (
    <div className="grid h-screen grid-cols-[232px_1fr] overflow-hidden">
      <Sidebar />
      <main className="flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function Sidebar() {
  const { data: user } = useCurrentUser();
  const sf = useSalesforceStatus();

  return (
    <aside className="flex flex-col gap-1 overflow-y-auto border-r border-border bg-surface-2 p-3">
      <div className="flex items-center gap-2 px-2 py-3">
        <div className="grid h-6 w-6 place-items-center rounded-md bg-ink text-[13px] font-bold tracking-tight text-surface">
          B
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[15px] font-semibold tracking-tight">Bedrock</span>
          <span className="text-[11px] text-ink-3">Pursuit · Workspace</span>
        </div>
      </div>

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

      <div className="px-2 pb-1 pt-3 text-[10.5px] font-semibold uppercase tracking-wider text-ink-3">
        Workspace
      </div>
      <nav className="flex flex-col gap-px">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex select-none items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-ink-2 hover:bg-black/[0.04] hover:text-ink",
                isActive &&
                  "border border-border-strong bg-surface text-ink shadow-sm",
              )
            }
          >
            <item.icon size={16} className="opacity-70" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-px pt-4">
        {/* SF connection indicator — clickable to /settings */}
        {!sf.isLoading ? (
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] hover:bg-black/[0.04]",
                isActive && "bg-surface",
              )
            }
            title={
              sf.data?.connected
                ? `Salesforce: ${sf.data.user_name ?? "connected"}`
                : "Salesforce not connected — click to connect"
            }
          >
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full",
                sf.data?.connected ? "bg-green" : "bg-amber",
              )}
            />
            <span className="text-ink-3">
              {sf.data?.connected ? "Salesforce connected" : "Salesforce not connected"}
            </span>
          </NavLink>
        ) : null}

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex select-none items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-ink-2 hover:bg-black/[0.04] hover:text-ink",
              isActive &&
                "border border-border-strong bg-surface text-ink shadow-sm",
            )
          }
        >
          <SettingsIcon size={16} className="opacity-70" />
          <span>Settings</span>
        </NavLink>

        {user ? (
          <div className="mt-2 flex items-center gap-2 rounded-md px-2.5 py-2">
            {user.picture ? (
              <img
                src={user.picture}
                alt=""
                className="h-6 w-6 rounded-full border border-border-strong"
              />
            ) : (
              <div className="grid h-6 w-6 place-items-center rounded-full bg-surface text-[11px] font-semibold text-ink-2">
                {user.name?.[0] ?? "?"}
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate text-[12px] font-medium">
                {user.name}
              </span>
              <span className="truncate text-[11px] text-ink-4">
                {user.email}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="flex h-12 flex-shrink-0 items-center gap-4 border-b border-border-strong bg-surface px-5">
      <div className="flex items-center gap-1.5 text-[13px] text-ink-3">
        <span className="font-semibold text-ink">Bedrock</span>
      </div>
      <div className="ml-auto" />
    </header>
  );
}
