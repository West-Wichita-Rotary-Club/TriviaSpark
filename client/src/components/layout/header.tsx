import { Link } from "wouter";
import { Bell, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiHealth } from "@/hooks/useHealth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

type User = {
  id: string;
  username: string;
  email: string;
  fullName: string;
};

export default function Header() {
  const { status } = useApiHealth(30000);
  // Check authentication status (gracefully handle 401 by returning null)
  const { data: user } = useQuery<{ user: User } | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  // Determine home link destination based on authentication
  const homeHref = user?.user ? "/dashboard" : "/";

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={homeHref}>
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
                  <p className="text-xs text-gray-500" data-testid="text-logo-tagline">
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
                status.ok ? "text-green-700 border-green-300 bg-green-50" : "text-red-700 border-red-300 bg-red-50"
              }`}
              title={status.ok ? `API healthy • ${status.time ?? "now"}` : "API unreachable"}
              data-testid="badge-health"
              aria-live="polite"
            >
              <span className={`h-2 w-2 rounded-full ${status.ok ? "bg-green-500" : "bg-red-500"}`} />
              {status.ok ? "Online" : "Offline"}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:text-wine-700 transition-colors"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>
            
            <Link href="/profile">
              <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-wine-300 transition-all" data-testid="avatar-user">
                <AvatarFallback className="wine-gradient text-white text-sm font-medium">
                  MH
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
