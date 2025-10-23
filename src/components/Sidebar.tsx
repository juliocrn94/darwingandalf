import { Brain, Search, Copy, Mic, CheckCircle, Settings, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentStep: number;
}

const navItems = [
  { icon: Home, label: "Dashboard", step: 0 },
  { icon: Search, label: "Find Handoffs", step: 1 },
  { icon: Copy, label: "Clone Agent", step: 2 },
  { icon: Mic, label: "Voice Prompt", step: 3 },
  { icon: CheckCircle, label: "Final Agent", step: 4 },
];

export const Sidebar = ({ currentStep }: SidebarProps) => {
  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">Darwin AI</h1>
            <p className="text-xs text-muted-foreground">Agent Cloner</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentStep === item.step;
          const isPast = currentStep > item.step;
          
          return (
            <button
              key={item.label}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-glow"
                  : isPast
                  ? "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  : "text-muted-foreground hover:bg-sidebar-accent/30"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
              {isPast && <CheckCircle className="w-4 h-4 ml-auto text-success" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-sidebar-accent/30 transition-smooth">
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
};
