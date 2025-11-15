import { cn } from "@/lib/utils";
import { NavLink } from "./NavLink";
import { Settings } from "lucide-react";

type TabType = "offen" | "mein-bereich" | "team-bereich";

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: "offen" as TabType, label: "Offen" },
  { id: "mein-bereich" as TabType, label: "Mein Bereich" },
  { id: "team-bereich" as TabType, label: "Team Bereich" },
];

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  return (
    <nav className="border-b border-nav-border bg-nav">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <h2 className="text-xl font-semibold text-foreground">
              Dokumentations-App
            </h2>
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                    "hover:bg-tab-hover",
                    activeTab === tab.id
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tab-active rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <NavLink
            to="/admin"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-tab-hover transition-colors"
            activeClassName="text-primary bg-tab-hover"
          >
            <Settings className="h-4 w-4" />
            Admin
          </NavLink>
        </div>
      </div>
    </nav>
  );
};
