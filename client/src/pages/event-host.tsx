import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Play, Pause, Users, Clock, Trophy, ArrowLeft, Calendar, MapPin, Building, Mail, Phone, Globe, Settings, Info } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import QRCodeDisplay from "@/components/ui/qr-code";
import { formatDateTimeInCST } from "@/lib/utils";

export default function EventHost() {
  const [, params] = useRoute("/event/:id");
  const eventId = params?.id;
  const { toast } = useToast();

  console.log("EventHost: Component mounted with eventId:", eventId);

  const { data: event, isLoading } = useQuery<any>({
    queryKey: ["/api/events", eventId],
    enabled: !!eventId,
  });

  const { data: questions } = useQuery<any[]>({
    queryKey: ["/api/events", eventId, "questions"],
    enabled: !!eventId,
  });

  const { data: participants } = useQuery<any[]>({
    queryKey: ["/api/events", eventId, "participants"],
    enabled: !!eventId,
  });

  const { data: teams } = useQuery<any[]>({
    queryKey: ["/api/events", eventId, "teams"],
    enabled: !!eventId,
  });

  console.log("EventHost: Query states:", {
    eventId,
    isLoading,
    hasEvent: !!event,
    hasQuestions: !!questions,
    hasParticipants: !!participants,
    hasTeams: !!teams
  });

  const startEventMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/events/${eventId}/start`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to start event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId] });
      toast({
        title: "Event Started",
        description: "Your trivia event is now live!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start event. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center p-8" data-testid="card-event-not-found">
          <CardContent>
            <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid="text-event-not-found">
              Event Not Found
            </h2>
            <p className="text-gray-600 mb-4" data-testid="text-event-not-found-desc">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/dashboard">
              <Button data-testid="button-back-to-dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatEventDate = (date: string | null, time: string | null) => {
    if (!date) return "No date set";
    return formatDateTimeInCST(date);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900" data-testid="text-event-title">
              {event.title}
            </h1>
            <p className="text-gray-600" data-testid="text-event-description">
              {event.description}
            </p>
          </div>
        </div>
        <Badge variant={event.status === "active" ? "default" : "secondary"} data-testid="badge-event-status">
          {event.status === "active" ? "Live" : event.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Control Panel */}
          <Card className="trivia-card" data-testid="card-control-panel">
            <CardHeader>
              <CardTitle data-testid="text-control-panel-title">Event Control Panel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {event.status === "draft" ? (
                    <Button 
                      onClick={() => startEventMutation.mutate()} 
                      disabled={startEventMutation.isPending}
                      className="trivia-button-primary"
                      data-testid="button-start-event"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {startEventMutation.isPending ? "Starting..." : "Start Event"}
                    </Button>
                  ) : (
                    <Button className="trivia-button-secondary" disabled data-testid="button-pause-event">
                      <Pause className="mr-2 h-4 w-4" />
                      Pause Event
                    </Button>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="mr-1 h-4 w-4" />
                    <span data-testid="text-participant-count">{participants?.length || 0} participants</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="mr-1 h-4 w-4" />
                    <span data-testid="text-question-count">{questions?.length || 0} questions</span>
                  </div>
                </div>
                
                <Link href={`/presenter/${eventId}`}>
                  <Button variant="outline" className="trivia-button-outline" data-testid="button-presenter-view">
                    <Trophy className="mr-2 h-4 w-4" />
                    Presenter View
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Teams & Participants */}
          {event.status === "draft" && (
            <Card className="trivia-card" data-testid="card-teams-participants">
              <CardHeader>
                <CardTitle className="flex items-center" data-testid="text-teams-participants-title">
                  <Users className="mr-2 h-5 w-5" />
                  Teams & Participants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Teams Section */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Teams ({teams?.length || 0})</h4>
                    {teams && teams.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teams.map((team: any) => (
                          <div key={team.id} className="p-4 bg-champagne-50 rounded-lg border border-champagne-200" data-testid={`team-card-${team.id}`}>
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-champagne-800">{team.name}</h5>
                              {team.tableNumber && (
                                <Badge variant="outline" className="text-xs">Table {team.tableNumber}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {team.participantCount || 0}/{team.maxMembers || 6} members
                            </p>
                            {team.participants && team.participants.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-xs text-gray-500 font-medium">Members:</p>
                                {team.participants.slice(0, 3).map((participant: any, idx: number) => (
                                  <div key={participant.id} className="text-xs text-gray-600">
                                    • {participant.name}
                                  </div>
                                ))}
                                {team.participants.length > 3 && (
                                  <div className="text-xs text-gray-500">... and {team.participants.length - 3} more</div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg text-center">
                        No teams created yet. Participants can create teams when joining.
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Individual Participants Section */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Individual Participants ({participants?.filter(p => !p.teamId).length || 0})
                    </h4>
                    {participants && participants.filter(p => !p.teamId).length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {participants
                          .filter((participant: any) => !participant.teamId)
                          .map((participant: any) => (
                            <div key={participant.id} className="p-3 bg-wine-50 rounded-lg border border-wine-200" data-testid={`participant-card-${participant.id}`}>
                              <div className="text-sm font-medium text-wine-800 truncate">
                                {participant.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(participant.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg text-center">
                        No individual participants yet.
                      </div>
                    )}
                  </div>

                  {/* Summary Stats */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-800">{teams?.length || 0}</div>
                        <div className="text-sm text-blue-600">Teams</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-800">{participants?.length || 0}</div>
                        <div className="text-sm text-blue-600">Total Participants</div>
                      </div>
                    </div>
                    {(participants?.length || 0) > 0 && (
                      <div className="mt-3 text-center">
                        <div className="text-sm text-blue-700">
                          Team Members: {participants?.filter(p => p.teamId).length || 0} • 
                          Individual: {participants?.filter(p => !p.teamId).length || 0}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Questions List */}
          <Card className="trivia-card" data-testid="card-questions-list">
            <CardHeader>
              <CardTitle data-testid="text-questions-title">Event Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {questions && questions.length > 0 ? (
                <div className="space-y-4">
                  {questions.map((question: any, index: number) => (
                    <div key={question.id} className="p-4 border border-gray-200 rounded-lg" data-testid={`question-${index}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900" data-testid={`text-question-${index}`}>
                          {index + 1}. {question.question}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" data-testid={`badge-question-type-${index}`}>
                            {question.type.replace('_', ' ')}
                          </Badge>
                          <Badge variant="secondary" data-testid={`badge-question-difficulty-${index}`}>
                            {question.difficulty}
                          </Badge>
                        </div>
                      </div>
                      {(() => {
                        // Safely parse options - handle both string and array formats
                        let parsedOptions: string[] = [];
                        try {
                          if (typeof question.options === 'string') {
                            parsedOptions = JSON.parse(question.options);
                          } else if (Array.isArray(question.options)) {
                            parsedOptions = question.options;
                          }
                        } catch (error) {
                          console.warn('Failed to parse question options:', error);
                          parsedOptions = [];
                        }
                        
                        return parsedOptions && parsedOptions.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            {parsedOptions.map((option: string, optionIndex: number) => (
                              <div 
                                key={optionIndex} 
                                className={`p-2 text-sm rounded border ${
                                  option === question.correctAnswer 
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800' 
                                    : 'border-gray-200 bg-gray-50'
                                }`}
                                data-testid={`option-${index}-${optionIndex}`}
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8" data-testid="text-no-questions">
                  No questions have been added to this event yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Event Info */}
        <div className="space-y-6">
          {/* QR Code */}
          <Card className="trivia-card" data-testid="card-qr-code">
            <CardHeader>
              <CardTitle data-testid="text-qr-title">Event QR Code</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {event.qrCode ? (
                <>
                  <QRCodeDisplay value={`${window.location.origin}/join/${event.qrCode}`} />
                  <p className="text-sm text-gray-600 mt-4" data-testid="text-qr-code">
                    Code: <span className="font-mono font-bold">{event.qrCode}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-2" data-testid="text-qr-instruction">
                    Participants can scan this QR code to join your event
                  </p>
                </>
              ) : (
                <div className="text-gray-500 py-8" data-testid="text-no-qr-code">
                  No QR code available for this event
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card className="trivia-card" data-testid="card-event-details">
            <CardHeader>
              <CardTitle className="flex items-center" data-testid="text-details-title">
                <Info className="mr-2 h-5 w-5" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {event.eventDate && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-600">Date & Time</span>
                      <p className="font-medium" data-testid="text-event-datetime">
                        {formatEventDate(event.eventDate, event.eventTime)}
                      </p>
                    </div>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-600">Location</span>
                      <p className="font-medium" data-testid="text-event-location">{event.location}</p>
                    </div>
                  </div>
                )}
                {event.sponsoringOrganization && (
                  <div className="flex items-center space-x-3">
                    <Building className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-600">Organization</span>
                      <p className="font-medium" data-testid="text-event-organization">{event.sponsoringOrganization}</p>
                    </div>
                  </div>
                )}
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600 text-sm">Max Participants</span>
                    <p className="font-semibold" data-testid="text-max-participants">{event.maxParticipants}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Difficulty</span>
                    <Badge variant="outline" data-testid="badge-difficulty">{event.difficulty}</Badge>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Event Type</span>
                  <Badge variant="secondary" data-testid="badge-event-type">
                    {event.eventType.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          {(event.contactEmail || event.contactPhone || event.websiteUrl) && (
            <Card className="trivia-card" data-testid="card-contact-info">
              <CardHeader>
                <CardTitle data-testid="text-contact-title">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {event.contactEmail && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm" data-testid="text-contact-email">{event.contactEmail}</span>
                    </div>
                  )}
                  {event.contactPhone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm" data-testid="text-contact-phone">{event.contactPhone}</span>
                    </div>
                  )}
                  {event.websiteUrl && (
                    <div className="flex items-center space-x-3">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <a href={event.websiteUrl} target="_blank" rel="noopener noreferrer" 
                         className="text-sm text-blue-600 hover:underline" data-testid="link-website">
                        {event.websiteUrl}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Event Information */}
          {(event.eventRules || event.prizeInformation || event.specialInstructions) && (
            <Card className="trivia-card" data-testid="card-event-info">
              <CardHeader>
                <CardTitle data-testid="text-event-info-title">Event Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {event.eventRules && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Rules</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-line" data-testid="text-event-rules">
                        {event.eventRules}
                      </p>
                    </div>
                  )}
                  {event.prizeInformation && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Prizes</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-line" data-testid="text-prize-info">
                        {event.prizeInformation}
                      </p>
                    </div>
                  )}
                  {event.specialInstructions && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Special Instructions</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-line" data-testid="text-special-instructions">
                        {event.specialInstructions}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Participants */}
          <Card className="trivia-card" data-testid="card-participants">
            <CardHeader>
              <CardTitle className="flex items-center" data-testid="text-participants-title">
                <Users className="mr-2 h-5 w-5" />
                Participants ({participants?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {participants && participants.length > 0 ? (
                <div className="space-y-2">
                  {participants.map((participant: any, index: number) => (
                    <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded" data-testid={`participant-${index}`}>
                      <div>
                        <span className="font-medium" data-testid={`text-participant-name-${index}`}>
                          {participant.name}
                        </span>
                        {participant.teamName && (
                          <span className="text-sm text-gray-600 ml-2" data-testid={`text-participant-team-${index}`}>
                            ({participant.teamName})
                          </span>
                        )}
                      </div>
                      <Badge variant={participant.isActive ? "default" : "secondary"} data-testid={`badge-participant-status-${index}`}>
                        {participant.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4" data-testid="text-no-participants">
                  No participants yet. Share the QR code to get started!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
