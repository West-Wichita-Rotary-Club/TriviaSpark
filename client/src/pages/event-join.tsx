import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, Trophy, Brain, ArrowRight, UserPlus, UserCheck, Hash, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const joinSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  teamAction: z.enum(["none", "join", "create"]),
  teamIdentifier: z.string().max(50, "Team name/number too long").optional(),
});

type JoinForm = z.infer<typeof joinSchema>;

interface Team {
  id: string;
  name: string;
  tableNumber: number | null;
  participantCount: number;
  maxMembers: number;
}

export default function EventJoin() {
  const [, params] = useRoute("/join/:qrCode");
  const qrCode = params?.qrCode;
  const { toast } = useToast();
  const [joinedEvent, setJoinedEvent] = useState<any>(null);
  const [currentParticipant, setCurrentParticipant] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<JoinForm>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      teamAction: "none",
      name: "",
      teamIdentifier: "",
    },
  });

  const teamAction = watch("teamAction");

  // Check if user is returning participant
  useEffect(() => {
    const checkParticipant = async () => {
      try {
        const response = await fetch(`/api/events/join/${qrCode}/check`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.returning) {
            setCurrentParticipant(data.participant);
            setJoinedEvent(data);
          }
        }
      } catch (error) {
        // Not a returning participant, continue with normal flow
      }
    };
    
    if (qrCode) {
      checkParticipant();
    }
  }, [qrCode]);

  // Fetch available teams
  const { data: teams, isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: [`/api/events/${qrCode}/teams-public`],
    enabled: !!qrCode && teamAction === "join" && !joinedEvent,
  });

  const joinEventMutation = useMutation({
    mutationFn: async (data: JoinForm) => {
      const response = await fetch(`/api/events/join/${qrCode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to join event");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setJoinedEvent(data);
      setCurrentParticipant(data.participant);
      if (data.returning) {
        toast({
          title: "Welcome back!",
          description: `You're already joined as ${data.participant.name}`,
        });
      } else {
        toast({
          title: "Welcome to the event!",
          description: `You've successfully joined ${data.event.title}`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const switchTeamMutation = useMutation({
    mutationFn: async (teamId: string | null) => {
      const response = await fetch(`/api/participants/${currentParticipant.id}/team`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to switch teams");
      }
      
      return response.json();
    },
    onSuccess: (updatedParticipant) => {
      setCurrentParticipant(updatedParticipant);
      toast({
        title: "Team updated!",
        description: "You've successfully switched teams",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JoinForm) => {
    joinEventMutation.mutate(data);
  };

  const handleTeamSwitch = (teamId: string | null) => {
    switchTeamMutation.mutate(teamId);
  };

  // Returning participant view
  if (currentParticipant && joinedEvent) {
    const currentTeam = joinedEvent.team; // Use team from the joined event data
    const canSwitchTeam = currentParticipant.canSwitchTeam;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md trivia-card" data-testid="card-participant-status">
          <CardHeader className="text-center">
            <div className="w-16 h-16 wine-gradient rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl wine-text" data-testid="text-welcome-back-title">
              Welcome back, {currentParticipant.name}!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-wine-50 rounded-lg border border-wine-200">
              <h3 className="font-semibold text-wine-800 mb-2" data-testid="text-event-title">
                {joinedEvent.event.title}
              </h3>
              <p className="text-sm text-gray-600" data-testid="text-event-description">
                {joinedEvent.event.description}
              </p>
            </div>
            
            {/* Team Status */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">Team Status</h4>
              {currentTeam ? (
                <div className="p-3 bg-champagne-50 rounded-lg border border-champagne-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-champagne-800" data-testid="text-current-team">
                        {currentTeam.name}
                      </p>
                      {currentTeam.tableNumber && (
                        <p className="text-sm text-gray-600">
                          Table {currentTeam.tableNumber}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {currentTeam.participantCount}/{currentTeam.maxMembers} members
                      </p>
                    </div>
                    {canSwitchTeam && (
                      <Button
                        onClick={() => handleTeamSwitch(null)}
                        variant="outline"
                        size="sm"
                        data-testid="button-leave-team"
                      >
                        Leave Team
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">You're not on a team</p>
                  {canSwitchTeam && teams && teams.length > 0 && (
                    <Select onValueChange={handleTeamSwitch} data-testid="select-join-team">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Join a team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams
                          .filter(team => team.participantCount < team.maxMembers)
                          .map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name} {team.tableNumber ? `(Table ${team.tableNumber})` : ''} 
                              ({team.participantCount}/{team.maxMembers})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
              
              {!canSwitchTeam && (
                <div className="flex items-center justify-center text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <Clock className="mr-2 h-4 w-4" />
                  Team switching is locked (event has started)
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Users className="mr-2 h-4 w-4" />
                <span data-testid="text-waiting-message">
                  {joinedEvent.event.status === "active" ? "Event in progress..." : "Waiting for the host to start..."}
                </span>
              </div>
              
              <div className="text-xs text-gray-500 text-center" data-testid="text-instructions">
                Keep this page open. The trivia will continue shortly!
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // New participant joining flow
  if (joinedEvent && !currentParticipant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md trivia-card" data-testid="card-joined-success">
          <CardHeader className="text-center">
            <div className="w-16 h-16 wine-gradient rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl wine-text" data-testid="text-welcome-title">
              Welcome, {joinedEvent.participant.name}!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-wine-50 rounded-lg border border-wine-200">
              <h3 className="font-semibold text-wine-800 mb-2" data-testid="text-event-title">
                {joinedEvent.event.title}
              </h3>
              <p className="text-sm text-gray-600" data-testid="text-event-description">
                {joinedEvent.event.description}
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Users className="mr-2 h-4 w-4" />
                <span data-testid="text-waiting-message">
                  {joinedEvent.event.status === "active" ? "Event in progress..." : "Waiting for the host to start..."}
                </span>
              </div>
              
              <div className="text-xs text-gray-500" data-testid="text-instructions">
                Keep this page open. The trivia will begin shortly!
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Initial join form
  return (
    <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* TriviaSpark Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 wine-gradient rounded-lg flex items-center justify-center mr-4">
              <Brain className="text-champagne-400 h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold wine-text" data-testid="text-brand-title">TriviaSpark</h1>
              <p className="text-sm text-gray-500" data-testid="text-brand-tagline">A WebSpark Solution</p>
            </div>
          </div>
          <p className="text-gray-600" data-testid="text-join-subtitle">Join the trivia event</p>
        </div>

        <Card className="trivia-card" data-testid="card-join-form">
          <CardHeader>
            <CardTitle className="text-center" data-testid="text-join-title">
              Event Code: <span className="font-mono champagne-text">{qrCode}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Input */}
              <div>
                <Label htmlFor="name" data-testid="label-name">Your Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter your name"
                  className={errors.name ? "border-red-500" : ""}
                  data-testid="input-name"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1" data-testid="error-name">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Team Selection */}
              <div className="space-y-4">
                <Label data-testid="label-team-options">Team Options</Label>
                <RadioGroup
                  value={teamAction}
                  onValueChange={(value: any) => setValue("teamAction", value)}
                  className="space-y-3"
                  data-testid="radio-team-options"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none" className="font-normal">Play individually (no team)</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="join" id="join" />
                    <Label htmlFor="join" className="font-normal">Join existing team</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="create" id="create" />
                    <Label htmlFor="create" className="font-normal">Create new team</Label>
                  </div>
                </RadioGroup>

                {/* Team Selection Input */}
                {teamAction === "join" && (
                  <div className="mt-3">
                    <Label htmlFor="teamIdentifier" data-testid="label-team-join">
                      Team Name or Table Number
                    </Label>
                    <Input
                      id="teamIdentifier"
                      {...register("teamIdentifier")}
                      placeholder="Enter team name or table number"
                      className={errors.teamIdentifier ? "border-red-500" : ""}
                      data-testid="input-team-join"
                    />
                    {errors.teamIdentifier && (
                      <p className="text-sm text-red-500 mt-1" data-testid="error-team-join">
                        {errors.teamIdentifier.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Example: "Wine Lovers" or "3" for Table 3
                    </p>
                  </div>
                )}

                {teamAction === "create" && (
                  <div className="mt-3">
                    <Label htmlFor="teamIdentifier" data-testid="label-team-create">
                      New Team Name or Table Number
                    </Label>
                    <Input
                      id="teamIdentifier"
                      {...register("teamIdentifier")}
                      placeholder="Enter team name or table number"
                      className={errors.teamIdentifier ? "border-red-500" : ""}
                      data-testid="input-team-create"
                    />
                    {errors.teamIdentifier && (
                      <p className="text-sm text-red-500 mt-1" data-testid="error-team-create">
                        {errors.teamIdentifier.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Example: "Team Awesome" or "5" for Table 5
                    </p>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={joinEventMutation.isPending}
                className="w-full trivia-button-primary"
                data-testid="button-join-event"
              >
                {joinEventMutation.isPending ? (
                  "Joining..."
                ) : (
                  <>
                    Join Event
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Brain className="mr-2 h-4 w-4" />
                <span data-testid="text-ai-powered">AI-Powered Trivia Experience</span>
              </div>
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <Users className="mr-1 h-3 w-3" />
                <span>Teams up to 6 members</span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Hash className="mr-1 h-3 w-3" />
                <span>Switch teams before game starts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-xs text-gray-500" data-testid="text-footer">
          Powered by TriviaSpark • Created by Mark Hazleton
        </div>
      </div>
    </div>
  );
}