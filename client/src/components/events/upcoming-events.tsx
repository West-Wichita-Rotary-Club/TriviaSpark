import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  WineIcon as Wine,
  Building,
  Cake,
  Calendar,
  Settings,
  Tv,
  Presentation,
} from 'lucide-react';
import { Link } from 'wouter';
import { formatDateInCST } from '@/lib/utils';

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'wine_dinner':
      return Wine;
    case 'corporate':
      return Building;
    case 'party':
      return Cake;
    default:
      return Wine;
  }
};

const getEventColor = (eventType: string) => {
  switch (eventType) {
    case 'wine_dinner':
      return 'bg-primary/10 text-primary';
    case 'corporate':
      return 'bg-secondary text-secondary-foreground';
    case 'party':
      return 'bg-accent text-accent-foreground';
    default:
      return 'bg-primary/10 text-primary';
  }
};

const formatDate = (date: string | null) => {
  if (!date) return 'No date set';
  const eventDate = new Date(date);
  const now = new Date();
  const diffTime = eventDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays <= 30)
    return `In ${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''}`;
  return formatDateInCST(eventDate);
};

export default function UpcomingEvents() {
  const { data: events, isLoading } = useQuery<any[]>({
    queryKey: ['/api/events/upcoming'],
  });

  // Filter events that are in the future (upcoming events)
  const now = new Date();

  const upcomingEvents = (events || []).slice(0, 3);

  if (isLoading) {
    return (
      <Card data-testid="card-upcoming-events-loading">
        <CardHeader>
          <CardTitle data-testid="text-upcoming-events-title">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-3 bg-muted/50 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-upcoming-events">
      <CardHeader>
        <CardTitle className="flex items-center" data-testid="text-upcoming-events-title">
          <Calendar className="text-primary mr-2 h-5 w-5" />
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
                <div
                  key={event.id}
                  className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                  data-testid={`upcoming-event-${index}`}
                >
                  <div className="flex items-center space-x-4 mb-3">
                    <div
                      className={`w-10 h-10 ${iconColorClass} rounded-lg flex items-center justify-center`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4
                        className="font-medium text-foreground"
                        data-testid={`text-upcoming-event-title-${index}`}
                      >
                        {event.title}
                      </h4>
                      <p
                        className="text-sm text-muted-foreground"
                        data-testid={`text-upcoming-event-info-${index}`}
                      >
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
            <div className="text-center py-6" data-testid="text-no-upcoming-events">
              <p className="text-muted-foreground text-sm">No upcoming events</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
