import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Tv, Settings, CalendarPlus, Presentation } from 'lucide-react';
import { Link } from 'wouter';

export default function ActiveEvents() {
  const { data: activeEvents, isLoading } = useQuery<any[]>({
    queryKey: ['/api/events/active'],
  });

  if (isLoading) {
    return (
      <Card data-testid="card-active-events-loading">
        <CardHeader>
          <CardTitle className="flex items-center" data-testid="text-active-events-title">
            <PlayCircle className="text-green-500 dark:text-green-400 mr-2 h-5 w-5" />
            Active Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded" />
            <div className="h-16 bg-muted/50 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-active-events">
      <CardHeader>
        <CardTitle className="flex items-center" data-testid="text-active-events-title">
          <PlayCircle className="text-green-500 dark:text-green-400 mr-2 h-5 w-5" />
          Active Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeEvents && activeEvents.length > 0 ? (
            activeEvents.map((event: any, index: number) => (
              <div
                key={event.id}
                className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-950/20"
                data-testid={`active-event-${index}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4
                    className="font-medium text-foreground"
                    data-testid={`text-active-event-title-${index}`}
                  >
                    {event.title}
                  </h4>
                  <Badge
                    className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800"
                    data-testid={`badge-active-event-status-${index}`}
                  >
                    Live
                  </Badge>
                </div>
                <p
                  className="text-sm text-muted-foreground mb-3"
                  data-testid={`text-active-event-info-${index}`}
                >
                  {event.maxParticipants} max participants • {event.difficulty} difficulty
                </p>
                <div className="flex space-x-1">
                  <Link href={`/events/${event.id}/manage`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      data-testid={`button-manage-active-event-${index}`}
                    >
                      <Settings className="mr-1 h-3 w-3" />
                      Manage
                    </Button>
                  </Link>
                  <Link href={`/event/${event.id}`}>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white text-xs"
                      data-testid={`button-view-active-event-${index}`}
                    >
                      <Tv className="mr-1 h-3 w-3" />
                      Event
                    </Button>
                  </Link>
                  <Link href={`/presenter/${event.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 text-xs"
                      data-testid={`button-presenter-active-event-${index}`}
                    >
                      <Presentation className="mr-1 h-3 w-3" />
                      Present
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6" data-testid="text-no-active-events">
              <CalendarPlus className="h-8 w-8 text-muted-foreground mb-2 mx-auto" />
              <p className="text-muted-foreground text-sm">No active events</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
