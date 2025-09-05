import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WineIcon as Wine, Building, Cake, ChevronRight, Settings, Tv, Presentation, Monitor } from "lucide-react";
import { Link } from "wouter";
import { formatDateInCST } from "@/lib/utils";

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case "wine_dinner":
      return Wine;
    case "corporate":
      return Building;
    case "party":
      return Cake;
    default:
      return Wine;
  }
};

const getEventColor = (eventType: string) => {
  switch (eventType) {
    case "wine_dinner":
      return "bg-wine-100 text-wine-600";
    case "corporate":
      return "bg-champagne-100 text-champagne-600";
    case "party":
      return "bg-coral-100 text-coral-500";
    default:
      return "bg-wine-100 text-wine-600";
  }
};

const formatDate = (date: string | null) => {
  if (!date) return "No date set";
  const eventDate = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - eventDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return `${diffDays} days ago`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''} ago`;
  return formatDateInCST(eventDate);
};

export default function RecentEvents() {
  const { data: events, isLoading } = useQuery<any[]>({
    queryKey: ["/api/events"],
  });

  // Filter events that have passed (recent events)
  const now = new Date();
  const recentEvents = events?.filter(event => {
    if (!event.eventDate) return false;
    const eventDate = new Date(event.eventDate);
    return eventDate < now;
  }).sort((a, b) => {
    const dateA = new Date(a.eventDate);
    const dateB = new Date(b.eventDate);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  }).slice(0, 3) || [];

  if (isLoading) {
    return (
      <Card className="trivia-card" data-testid="card-recent-events-loading">
        <CardHeader>
          <CardTitle data-testid="text-recent-events-title">Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="trivia-card" data-testid="card-recent-events">
      <CardHeader>
        <CardTitle data-testid="text-recent-events-title">Recent Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentEvents.length > 0 ? (
            recentEvents.map((event: any, index: number) => {
              const IconComponent = getEventIcon(event.eventType);
              const iconColorClass = getEventColor(event.eventType);
              
              return (
                <div key={event.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors" data-testid={`recent-event-${index}`}>
                  <div className="flex items-center space-x-4 mb-3">
                    <div className={`w-10 h-10 ${iconColorClass} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900" data-testid={`text-recent-event-title-${index}`}>
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-600" data-testid={`text-recent-event-info-${index}`}>
                        {event.maxParticipants} max participants • {formatDate(event.eventDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Link href={`/events/${event.id}/manage`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Settings className="mr-1 h-3 w-3" />
                        Manage
                      </Button>
                    </Link>
                    <Link href={`/event/${event.id}`}>
                      <Button size="sm" className="text-xs">
                        <Tv className="mr-1 h-3 w-3" />
                        Event
                      </Button>
                    </Link>
                    <Link href={`/presenter/${event.id}`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Presentation className="mr-1 h-3 w-3" />
                        Present
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6" data-testid="text-no-recent-events">
              <p className="text-gray-500 text-sm">No recent events</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
