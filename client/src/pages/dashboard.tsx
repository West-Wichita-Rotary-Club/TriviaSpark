import { useQuery } from "@tanstack/react-query";
import DashboardStats from "@/components/stats/dashboard-stats";
import EventGenerator from "@/components/ai/event-generator";
import QuestionGenerator from "@/components/ai/question-generator";
import ActiveEvents from "@/components/events/active-events";
import RecentEvents from "@/components/events/recent-events";
import UpcomingEvents from "@/components/events/upcoming-events";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, QrCode, Copy, Calendar, Database } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  
  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalEvents: number;
    totalParticipants: number;
    totalQuestions: number;
    averageRating: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="welcome-heading">
              Welcome to TriviaSpark!
            </h2>
            <p className="text-muted-foreground" data-testid="welcome-description">
              Create unforgettable trivia experiences with AI-powered content generation
            </p>
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="trivia-card hover:shadow-md transition-shadow cursor-pointer" data-testid="card-qr-event">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                    <QrCode className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground" data-testid="text-qr-title">
                      Quick QR Event
                    </h4>
                    <p className="text-muted-foreground text-sm" data-testid="text-qr-description">
                      Start instant trivia
                    </p>
                  </div>
                </div>
                <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20" data-testid="button-create-qr">
                  Create QR Code
                </Button>
              </CardContent>
            </Card>

            <Card className="trivia-card hover:shadow-md transition-shadow cursor-pointer" data-testid="card-clone-event">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center mr-4">
                    <Copy className="text-secondary-foreground h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground" data-testid="text-clone-title">
                      Clone Event
                    </h4>
                    <p className="text-muted-foreground text-sm" data-testid="text-clone-description">
                      Reuse successful events
                    </p>
                  </div>
                </div>
                <Button className="w-full bg-secondary/50 text-secondary-foreground hover:bg-secondary/70" data-testid="button-browse-templates">
                  Browse Templates
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="trivia-card hover:shadow-md transition-shadow cursor-pointer" 
              data-testid="card-database-analyzer"
              onClick={() => setLocation("/database-analyzer")}
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mr-4">
                    <Database className="text-accent-foreground h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground" data-testid="text-db-analyzer-title">
                      Database Analyzer
                    </h4>
                    <p className="text-muted-foreground text-sm" data-testid="text-db-analyzer-description">
                      Explore database tables
                    </p>
                  </div>
                </div>
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/80" data-testid="button-analyze-db">
                  Analyze Database
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
    </div>
  );
}
