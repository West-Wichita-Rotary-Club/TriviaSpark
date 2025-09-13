import { Link, useLocation } from "wouter";
import { Bell, Brain, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiHealth } from "@/hooks/useHealth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string;
  username: string;
  email: string;
  fullName: string;
};

export default function Header() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { status } = useApiHealth(30000);
  
  // Check authentication status (gracefully handle 401 by returning null)
  const { data: user } = useQuery<{ user: User } | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to logout');
      }
      return response.json();
    },
    onSuccess: () => {
      // Clear all React Query cache
      queryClient.clear();
      
      // Show success toast
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // Redirect to home page
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

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
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:text-wine-700 transition-colors"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>
            
            {/* Profile Dropdown */}
            {user?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-wine-300 transition-all" data-testid="avatar-user">
                    <AvatarFallback className="wine-gradient text-white text-sm font-medium">
                      {user.user.fullName
                        ? user.user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                        : user.user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">{user.user.fullName || user.user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-wine-700 border-wine-300 hover:bg-wine-50"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
