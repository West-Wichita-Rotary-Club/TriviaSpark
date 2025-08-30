import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Brain, QrCode, Play, Users, Calendar, MapPin, Building2, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import QRCodeComponent from "qrcode";

type User = {
  id: string;
  username: string;
  email: string;
  fullName: string;
};

type Event = {
  id: string;
  title: string;
  description: string;
  eventType: string;
  status: string;
  qrCode: string;
  maxParticipants: number;
  difficulty: string;
  eventDate: string | null;
  eventTime: string | null;
  location: string | null;
  sponsoringOrganization: string | null;
  createdAt: string;
};

export default function EventManagement() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  // Check authentication
  const { data: user, isLoading: userLoading, error: userError } = useQuery<{ user: User }>({
    queryKey: ["/api/auth/me"],
    retry: false
  });

  // Get events
  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    enabled: !!user,
    retry: false
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

  // Start event mutation
  const startEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch(`/api/events/${eventId}/start`, {
        method: "POST",
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start event");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event Started!",
        description: `${data.title} is now live and accepting participants.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to start event",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  });

  // Generate QR Code when event is selected
  useEffect(() => {
    if (selectedEvent) {
      const joinUrl = `${window.location.origin}/join/${selectedEvent.qrCode}`;
      QRCodeComponent.toDataURL(joinUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#7C2D12', // wine-800
          light: '#FFFFFF'
        }
      }).then(setQrCodeDataUrl);
    }
  }, [selectedEvent]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (userError || (!userLoading && !user)) {
      setLocation("/login");
    }
  }, [userError, userLoading, user, setLocation]);

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
    <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50">
      {/* Header */}
      <div className="wine-gradient shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30 mr-4">
                <Brain className="text-champagne-400 h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white" data-testid="text-page-title">
                  Event Management
                </h1>
                <p className="text-champagne-200" data-testid="text-welcome">
                  Welcome back, {user?.user.fullName}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => logoutMutation.mutate()}
              className="text-white hover:bg-white/10"
              data-testid="button-logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Events List */}
          <div className="lg:col-span-2">
            <Card className="trivia-card" data-testid="card-events-list">
              <CardHeader>
                <CardTitle className="flex items-center wine-text">
                  <Calendar className="mr-2 h-5 w-5" />
                  Your Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading events...</p>
                  </div>
                ) : events && events.length > 0 ? (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <Card 
                        key={event.id} 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedEvent?.id === event.id ? 'ring-2 ring-wine-500 bg-wine-50' : ''
                        }`}
                        onClick={() => setSelectedEvent(event)}
                        data-testid={`event-card-${event.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-wine-800 text-lg" data-testid={`text-event-title-${event.id}`}>
                                {event.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={event.status === 'active' ? 'default' : 'secondary'}
                                className={event.status === 'active' ? 'bg-emerald-100 text-emerald-800' : ''}
                                data-testid={`badge-status-${event.id}`}
                              >
                                {event.status}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLocation(`/events/${event.id}/manage`);
                                }}
                                className="text-xs"
                                data-testid={`button-manage-${event.id}`}
                              >
                                Manage
                              </Button>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-3" data-testid={`text-event-description-${event.id}`}>
                            {event.description}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-500">
                            {event.eventTime && (
                              <div className="flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                {event.eventTime}
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center">
                                <MapPin className="mr-1 h-3 w-3" />
                                {event.location}
                              </div>
                            )}
                            {event.sponsoringOrganization && (
                              <div className="flex items-center">
                                <Building2 className="mr-1 h-3 w-3" />
                                {event.sponsoringOrganization}
                              </div>
                            )}
                            <div className="flex items-center">
                              <Users className="mr-1 h-3 w-3" />
                              Max {event.maxParticipants} participants
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">No events found</p>
                    <Button onClick={() => setLocation("/dashboard")} data-testid="button-create-event">
                      Create Your First Event
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Event Details & QR Code */}
          <div>
            {selectedEvent ? (
              <div className="space-y-6">
                <Card className="trivia-card" data-testid="card-event-details">
                  <CardHeader>
                    <CardTitle className="wine-text text-lg">
                      {selectedEvent.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedEvent.status !== 'active' && (
                        <Button
                          onClick={() => startEventMutation.mutate(selectedEvent.id)}
                          disabled={startEventMutation.isPending}
                          className="w-full trivia-button-primary"
                          data-testid="button-start-event"
                        >
                          {startEventMutation.isPending ? (
                            <>
                              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                              Starting...
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Start Event
                            </>
                          )}
                        </Button>
                      )}

                      {selectedEvent.status === 'active' && (
                        <div className="text-center space-y-4">
                          <div className="w-full max-w-sm mx-auto">
                            {qrCodeDataUrl && (
                              <img 
                                src={qrCodeDataUrl} 
                                alt="Join Event QR Code" 
                                className="w-full h-auto rounded-lg shadow-md"
                                data-testid="image-qr-code"
                              />
                            )}
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-1">Join Code:</p>
                            <p className="text-lg font-mono text-wine-800" data-testid="text-join-code">
                              {selectedEvent.qrCode}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600">
                            Participants can scan the QR code or visit:<br/>
                            <span className="font-mono text-wine-800">
                              /join/{selectedEvent.qrCode}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {selectedEvent.status === 'active' && (
                  <Button
                    onClick={() => setLocation(`/event/${selectedEvent.id}`)}
                    className="w-full trivia-button-secondary"
                    data-testid="button-manage-event"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Manage Event
                  </Button>
                )}
              </div>
            ) : (
              <Card className="trivia-card" data-testid="card-select-event">
                <CardContent className="text-center py-12">
                  <QrCode className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-600">Select an event to view QR code and controls</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => setLocation("/dashboard")}
            className="border-wine-200 text-wine-700 hover:bg-wine-50"
            data-testid="button-dashboard"
          >
            <Brain className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}