import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardStats from "@/components/stats/dashboard-stats";
import EventGenerator from "@/components/ai/event-generator";
import QuestionGenerator from "@/components/ai/question-generator";
import ActiveEvents from "@/components/events/active-events";
import RecentEvents from "@/components/events/recent-events";
import UpcomingEvents from "@/components/events/upcoming-events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Brain, QrCode, Copy, Calendar, LogOut } from "lucide-react";
import { useLocation } from "wouter";

type User = {
  id: string;
  username: string;
  email: string;
  fullName: string;
};

export default function Dashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // Check authentication
  const { data: user, isLoading: userLoading, error: userError } = useQuery<{ user: User }>({
    queryKey: ["/api/auth/me"],
    retry: false
  });
  
  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalEvents: number;
    totalParticipants: number;
    totalQuestions: number;
    averageRating: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Logout failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      setLocation("/login");
    }
  });
  
  // Redirect to login if not authenticated
  if (userError || (!userLoading && !user)) {
    setLocation("/login");
    return null;
  }
  
  if (!user) {
    return null;
  }
  
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 wine-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Brain className="text-champagne-400 h-8 w-8 animate-pulse" />
          </div>
          <p className="text-wine-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2" data-testid="welcome-heading">
            Welcome back, {user?.user?.fullName}!
          </h2>
          <p className="text-gray-600" data-testid="welcome-description">
            Create unforgettable trivia experiences with AI-powered content generation
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => logoutMutation.mutate()}
          className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          data-testid="button-logout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Quick Stats */}
      <DashboardStats stats={stats} isLoading={statsLoading} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Event Creation */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Event Generator */}
          <EventGenerator />

          {/* Question Generator */}
          <QuestionGenerator />

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="trivia-card hover:shadow-md transition-shadow cursor-pointer" data-testid="card-qr-event">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-wine-100 rounded-lg flex items-center justify-center mr-4">
                    <QrCode className="text-wine-700 h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900" data-testid="text-qr-title">
                      Quick QR Event
                    </h4>
                    <p className="text-gray-600 text-sm" data-testid="text-qr-description">
                      Start instant trivia
                    </p>
                  </div>
                </div>
                <Button className="w-full bg-wine-100 text-wine-700 hover:bg-wine-200" data-testid="button-create-qr">
                  Create QR Code
                </Button>
              </CardContent>
            </Card>

            <Card className="trivia-card hover:shadow-md transition-shadow cursor-pointer" data-testid="card-clone-event">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-champagne-100 rounded-lg flex items-center justify-center mr-4">
                    <Copy className="text-champagne-600 h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900" data-testid="text-clone-title">
                      Clone Event
                    </h4>
                    <p className="text-gray-600 text-sm" data-testid="text-clone-description">
                      Reuse successful events
                    </p>
                  </div>
                </div>
                <Button className="w-full bg-champagne-100 text-champagne-700 hover:bg-champagne-200" data-testid="button-browse-templates">
                  Browse Templates
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Event Management */}
        <div className="space-y-6">
          {/* Active Events */}
          <ActiveEvents />

          {/* Upcoming Events */}
          <UpcomingEvents />

          {/* Recent Events */}
          <RecentEvents />
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button 
          className="w-14 h-14 rounded-full wine-gradient shadow-lg hover:shadow-xl" 
          data-testid="button-mobile-fab"
        >
          <Calendar className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
