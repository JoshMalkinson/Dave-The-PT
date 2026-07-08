import { Activity, CalendarDays, Home, Settings, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

export type Screen = "home" | "plan" | "progress" | "setup";

interface AppShellProps {
  activeScreen: Screen;
  children: ReactNode;
  onScreenChange: (screen: Screen) => void;
}

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "plan", label: "Plan", icon: CalendarDays },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "setup", label: "Setup", icon: Settings },
] satisfies Array<{ id: Screen; label: string; icon: typeof Home }>;

export function AppShell({ activeScreen, children, onScreenChange }: AppShellProps) {
  return (
    <div className="app-frame">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            <Activity size={22} strokeWidth={2.4} />
          </span>
          <div>
            <p className="eyebrow">Adaptive Coach</p>
            <p className="brand-subtitle">Weather-aware running decisions</p>
          </div>
        </div>
        <p className="sync-pill">Demo Garmin sync</p>
      </header>

      <main className="screen-area">{children}</main>

      <nav className="bottom-nav" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={isActive ? "nav-button active" : "nav-button"}
              aria-pressed={isActive}
              onClick={() => onScreenChange(item.id)}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
