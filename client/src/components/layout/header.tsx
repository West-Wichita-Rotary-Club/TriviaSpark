import { Link, useLocation } from "wouter";
import { Bell, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiHealth } from "@/hooks/useHealth";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

export default function Header() {
  const { status } = useApiHealth(30000);

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard">
            <div className="flex items-center space-x-4 cursor-pointer" data-testid="link-home">
              <div className="flex items-center">
                {/* TriviaSpark Logo */}
                <div className="w-10 h-10 wine-gradient rounded-lg flex items-center justify-center mr-3">
                  <Brain className="text-champagne-400 h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold wine-text" data-testid="text-logo-title">
                    TriviaSpark
                  </h1>
                  <p className="text-xs text-muted-foreground" data-testid="text-logo-tagline">
                    A WebSpark Solution
                  </p>
                </div>
              </div>
            </div>
          </Link>
          
          <div className="flex items-center space-x-4">
            {/* Health badge */}
            <span
              className={`text-xs px-2 py-1 rounded-full border inline-flex items-center gap-1 ${
                status.ok ? "text-green-700 border-green-300 bg-green-50" : 
                (status.time === 'Static Build' ? "text-blue-700 border-blue-300 bg-blue-50" : "text-red-700 border-red-300 bg-red-50")
              }`}
              title={status.ok ? `API healthy • ${status.time ?? "now"}` : 
                status.time === 'Static Build' ? "Static preview version" : "API unreachable"
              }
              data-testid="badge-health"
              aria-live="polite"
            >
              <span className={`h-2 w-2 rounded-full ${
                status.ok ? "bg-green-500" : 
                (status.time === 'Static Build' ? "bg-blue-500" : "bg-red-500")
              }`} />
              {status.ok ? "Online" : (status.time === 'Static Build' ? "Preview" : "Offline")}
            </span>
            
            {/* Theme Switcher */}
            <ThemeSwitcher />
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
