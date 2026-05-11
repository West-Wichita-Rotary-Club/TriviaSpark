import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  WineIcon as Wine,
  Building,
  Cake,
  Calendar,
  CalendarPlus,
  Copy,
  Settings,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  Lightbulb,
} from 'lucide-react';
import { Link } from 'wouter';
import { formatDateInCST } from '@/lib/utils';

interface PastEvent {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  status: string;
  eventDate: string | null;
  eventTime: string | null;
  location: string | null;
  sponsoringOrganization: string | null;
  maxParticipants: number;
  difficulty: string;
  qrCode: string | null;
  createdAt: string;
  questionCount: number;
  funFactCount: number;
}

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'wine_dinner': return Wine;
    case 'corporate': return Building;
    case 'party': return Cake;
    default: return Wine;
  }
};

const getEventColor = (eventType: string) => {
  switch (eventType) {
    case 'wine_dinner': return 'bg-primary/10 text-primary';
    case 'corporate': return 'bg-secondary text-secondary-foreground';
    case 'party': return 'bg-accent text-accent-foreground';
    default: return 'bg-primary/10 text-primary';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed': return <Badge variant="secondary">Completed</Badge>;
    case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

export default function PastEvents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [cloneId, setCloneId] = useState<string | null>(null);
  const [cloneDate, setCloneDate] = useState('');
  const [cloneTitle, setCloneTitle] = useState('');

  const { data: events, isLoading } = useQuery<PastEvent[]>({
    queryKey: ['/api/events/past'],
  });

  const rescheduleMutation = useMutation({
    mutationFn: async ({ id, eventDate }: { id: string; eventDate: string }) => {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventDate, status: 'draft' }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to reschedule event');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/past'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({ title: 'Event Rescheduled', description: `${data.title} has been moved to a new date.` });
      setRescheduleId(null);
      setRescheduleDate('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to reschedule event.', variant: 'destructive' });
    },
  });

  const cloneMutation = useMutation({
    mutationFn: async ({ id, title, eventDate }: { id: string; title?: string; eventDate?: string }) => {
      const res = await fetch(`/api/events/${id}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title || null, eventDate: eventDate || null }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to clone event');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/past'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: 'Event Cloned',
        description: `"${data.title}" created with ${data.questionsCloned} questions and ${data.funFactsCloned} fun facts.`,
      });
      setCloneId(null);
      setCloneDate('');
      setCloneTitle('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to clone event.', variant: 'destructive' });
    },
  });

  const pastEvents = events || [];
  const displayEvents = expanded ? pastEvents : pastEvents.slice(0, 3);

  if (isLoading) {
    return (
      <Card data-testid="card-past-events-loading">
        <CardHeader>
          <CardTitle>Past Events</CardTitle>
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
    <Card data-testid="card-past-events">
      <CardHeader>
        <CardTitle className="flex items-center" data-testid="text-past-events-title">
          <Calendar className="text-muted-foreground mr-2 h-5 w-5" />
          Past Events
          {pastEvents.length > 0 && (
            <Badge variant="secondary" className="ml-2">{pastEvents.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayEvents.length > 0 ? (
            <>
              {displayEvents.map((event) => {
                const IconComponent = getEventIcon(event.eventType);
                const iconColorClass = getEventColor(event.eventType);
                const isRescheduling = rescheduleId === event.id;
                const isCloning = cloneId === event.id;

                return (
                  <div
                    key={event.id}
                    className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                    data-testid={`past-event-${event.id}`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-9 h-9 ${iconColorClass} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm truncate">{event.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{event.eventDate ? formatDateInCST(event.eventDate) : 'No date'}</span>
                          {getStatusBadge(event.status)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <FileQuestion className="h-3 w-3" /> {event.questionCount} Q
                      </span>
                      <span className="flex items-center gap-1">
                        <Lightbulb className="h-3 w-3" /> {event.funFactCount} facts
                      </span>
                      {event.location && <span className="truncate">{event.location}</span>}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-1">
                      <Link href={`/events/${event.id}/manage`}>
                        <Button size="sm" variant="outline" className="text-xs h-7">
                          <Settings className="mr-1 h-3 w-3" /> Manage
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => {
                          setCloneId(null);
                          setRescheduleId(isRescheduling ? null : event.id);
                          setRescheduleDate('');
                        }}
                      >
                        <CalendarPlus className="mr-1 h-3 w-3" /> Reschedule
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => {
                          setRescheduleId(null);
                          setCloneId(isCloning ? null : event.id);
                          setCloneDate('');
                          setCloneTitle('');
                        }}
                      >
                        <Copy className="mr-1 h-3 w-3" /> Clone
                      </Button>
                    </div>

                    {/* Reschedule inline form */}
                    {isRescheduling && (
                      <div className="mt-2 p-2 bg-muted rounded-md space-y-2">
                        <p className="text-xs font-medium">Pick a new date (resets status to draft):</p>
                        <Input
                          type="date"
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="h-8 text-sm"
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            className="text-xs h-7"
                            disabled={!rescheduleDate || rescheduleMutation.isPending}
                            onClick={() => rescheduleMutation.mutate({ id: event.id, eventDate: rescheduleDate })}
                          >
                            {rescheduleMutation.isPending ? 'Saving...' : 'Confirm'}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setRescheduleId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Clone inline form */}
                    {isCloning && (
                      <div className="mt-2 p-2 bg-muted rounded-md space-y-2">
                        <p className="text-xs font-medium">Clone event (copies questions & fun facts):</p>
                        <Input
                          type="text"
                          placeholder="New title (optional)"
                          value={cloneTitle}
                          onChange={(e) => setCloneTitle(e.target.value)}
                          className="h-8 text-sm"
                        />
                        <Input
                          type="date"
                          value={cloneDate}
                          onChange={(e) => setCloneDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="h-8 text-sm"
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            className="text-xs h-7"
                            disabled={cloneMutation.isPending}
                            onClick={() => cloneMutation.mutate({
                              id: event.id,
                              title: cloneTitle || undefined,
                              eventDate: cloneDate || undefined,
                            })}
                          >
                            {cloneMutation.isPending ? 'Cloning...' : 'Clone Event'}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setCloneId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {pastEvents.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? (
                    <><ChevronUp className="mr-1 h-3 w-3" /> Show less</>
                  ) : (
                    <><ChevronDown className="mr-1 h-3 w-3" /> Show all {pastEvents.length} past events</>
                  )}
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-6" data-testid="text-no-past-events">
              <p className="text-muted-foreground text-sm">No past events</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
