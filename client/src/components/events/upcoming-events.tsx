import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WineIcon as Wine, Building, Cake, ChevronRight, Calendar, Settings, Tv, Presentation, Monitor } from "lucide-react";
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
  const diffTime = eventDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays <= 30) return `In ${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''}`;
  return formatDateInCST(eventDate);
};

export default function UpcomingEvents() {
  const { data: events, isLoading } = useQuery<any[]>({
    queryKey: ["/api/events"],
  });

  // Filter events that are in the future (upcoming events)
  const now = new Date();
  
  // Debug logging
  if (events) {
    console.log("=== UPCOMING EVENTS DEBUG ===");
    console.log("Current time:", now.toISOString());
    console.log("Raw events data:", events);
    console.log("Events count:", events.length);
    
    events.forEach((event, index) => {
      console.log(`Event ${index}:`, {
        title: event.title,
        eventDate: event.eventDate,
        eventDateType: typeof event.eventDate,
        parsedDate: event.eventDate ? new Date(event.eventDate) : null,
        isFuture: event.eventDate ? new Date(event.eventDate) >= now : false
      });
    });
  }
  
  const upcomingEvents = events?.filter(event => {
    if (!event.eventDate) return false;
    const eventDate = new Date(event.eventDate);
    return eventDate >= now;
  }).sort((a, b) => {
    const dateA = new Date(a.eventDate);
    const dateB = new Date(b.eventDate);
    return dateA.getTime() - dateB.getTime(); // Soonest first
  }).slice(0, 3) || [];
  
  console.log("Filtered upcoming events:", upcomingEvents);

  if (isLoading) {
    return (
      <Card className="trivia-card" data-testid="card-upcoming-events-loading">
        <CardHeader>
          <CardTitle data-testid="text-upcoming-events-title">Upcoming Events</CardTitle>
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
    <Card className="trivia-card" data-testid="card-upcoming-events">
      <CardHeader>
        <CardTitle className="flex items-center" data-testid="text-upcoming-events-title">
          <Calendar className="text-blue-500 mr-2 h-5 w-5" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event: any, index: number) => {
              const IconComponent = getEventIcon(event.eventType);
              const iconColorClass = getEventColor(event.eventType);
              
              return (
                <div key={event.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors" data-testid={`upcoming-event-${index}`}>
                  <div className="flex items-center space-x-4 mb-3">
                    <div className={`w-10 h-10 ${iconColorClass} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900" data-testid={`text-upcoming-event-title-${index}`}>
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-600" data-testid={`text-upcoming-event-info-${index}`}>
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
                    <Link href={`/presenter-demo/${event.id}`}>
                      <Button size="sm" variant="outline" className="text-xs bg-champagne-50 border-champagne-300 text-champagne-700 hover:bg-champagne-100">
                        <Monitor className="mr-1 h-3 w-3" />
                        Demo
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6" data-testid="text-no-upcoming-events">
              <p className="text-gray-500 text-sm">No upcoming events</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}