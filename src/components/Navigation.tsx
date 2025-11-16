import { cn } from "@/lib/utils";
import { NavLink } from "./NavLink";
import { Settings, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import heraLogo from "@/assets/hera-logo.png";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
type TabType = "offen" | "mein-bereich" | "team-bereich";
interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}
const tabs = [{
  id: "offen" as TabType,
  label: "Offen"
}, {
  id: "mein-bereich" as TabType,
  label: "Mein Bereich"
}, {
  id: "team-bereich" as TabType,
  label: "Team Bereich"
}];
export const Navigation = ({
  activeTab,
  onTabChange
}: NavigationProps) => {
  return (
    <nav className="border-b border-nav-border bg-nav">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground hover:bg-tab-hover">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-2">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={cn(
                        "px-4 py-3 text-left text-sm font-medium transition-colors rounded-lg",
                        "hover:bg-tab-hover",
                        activeTab === tab.id
                          ? "bg-tab-hover text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            
            <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-foreground hover:text-primary transition-colors">
              <img src={heraLogo} alt="HERA Logo" className="h-8 w-8" />
              <span className="text-base">HERA</span>
            </Link>
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