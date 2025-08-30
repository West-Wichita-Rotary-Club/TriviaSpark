import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { WandSparkles, Sparkles } from "lucide-react";
import { eventGenerationSchema, type EventGenerationRequest } from "@shared/schema";
import { useLocation } from "wouter";
import { formatDateInCST } from "@/lib/utils";

export default function EventGenerator() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [generatedEvent, setGeneratedEvent] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventGenerationRequest>({
    resolver: zodResolver(eventGenerationSchema),
    defaultValues: {
      eventType: "wine_dinner",
      participants: 30,
      difficulty: "mixed",
    },
  });

  const generateEventMutation = useMutation({
    mutationFn: async (data: EventGenerationRequest) => {
      const response = await fetch("/api/events/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate event");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedEvent(data);
      toast({
        title: "Event Generated Successfully!",
        description: `Created "${data.event.title}" with ${data.questions.length} AI-powered questions.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EventGenerationRequest) => {
    generateEventMutation.mutate(data);
  };

  if (generatedEvent) {
    return (
      <Card className="trivia-card overflow-hidden" data-testid="card-generated-event">
        <div className="wine-gradient px-6 py-4">
          <div className="flex items-center">
            <Sparkles className="text-champagne-400 text-xl mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-white" data-testid="text-generated-title">
                Event Generated Successfully!
              </h3>
              <p className="text-champagne-200 text-sm" data-testid="text-generated-subtitle">
                Your AI-powered trivia event is ready
              </p>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2" data-testid="text-event-title">
                {generatedEvent.event.title}
              </h4>
              <p className="text-gray-600 text-sm" data-testid="text-event-description">
                {generatedEvent.event.description}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {generatedEvent.event.eventDate && (
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium" data-testid="text-event-date">
                    {formatDateInCST(generatedEvent.event.eventDate)}
                  </p>
                </div>
              )}
              {generatedEvent.event.eventTime && (
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium" data-testid="text-event-time">
                    {generatedEvent.event.eventTime}
                  </p>
                </div>
              )}
              {generatedEvent.event.location && (
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium" data-testid="text-event-location">
                    {generatedEvent.event.location}
                  </p>
                </div>
              )}
              {generatedEvent.event.sponsoringOrganization && (
                <div>
                  <p className="text-sm text-gray-500">Sponsor</p>
                  <p className="font-medium" data-testid="text-event-sponsor">
                    {generatedEvent.event.sponsoringOrganization}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" data-testid="badge-event-type">
                {generatedEvent.event.eventType.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" data-testid="badge-difficulty">
                {generatedEvent.event.difficulty}
              </Badge>
              <Badge variant="default" data-testid="badge-question-count">
                {generatedEvent.questions.length} Questions
              </Badge>
              <Badge variant="default" className="bg-emerald-100 text-emerald-800" data-testid="badge-status">
                Active
              </Badge>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={() => setLocation(`/event/${generatedEvent.event.id}`)}
                className="flex-1 trivia-button-primary"
                data-testid="button-manage-event"
              >
                Manage Event
              </Button>
              <Button 
                onClick={() => setGeneratedEvent(null)}
                variant="outline"
                data-testid="button-generate-another"
              >
                Generate Another
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="trivia-card overflow-hidden" data-testid="card-event-generator">
      <div className="wine-gradient px-6 py-4">
        <div className="flex items-center">
          <WandSparkles className="text-champagne-400 text-xl mr-3" />
          <div>
            <h3 className="text-xl font-semibold text-white" data-testid="text-generator-title">
              AI Event Generator
            </h3>
            <p className="text-champagne-200 text-sm" data-testid="text-generator-subtitle">
              Describe your event and let AI create the perfect trivia experience
            </p>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="description" data-testid="label-description">Describe Your Event</Label>
            <Textarea
              id="description"
              {...register("description")}
              rows={3}
              placeholder="Create a sophisticated wine dinner trivia for 30 guests featuring French Bordeaux wines with medium difficulty questions about wine regions, tasting notes, and vineyard history..."
              className={`resize-none ${errors.description ? "border-red-500" : "focus:ring-2 focus:ring-wine-500 focus:border-transparent"}`}
              data-testid="textarea-description"
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1" data-testid="error-description">
                {errors.description.message}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="eventType" data-testid="label-event-type">Event Type</Label>
              <Select onValueChange={(value) => setValue("eventType", value as any)} defaultValue="wine_dinner">
                <SelectTrigger data-testid="select-event-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wine_dinner">Wine Dinner</SelectItem>
                  <SelectItem value="corporate">Corporate Event</SelectItem>
                  <SelectItem value="party">Private Party</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="fundraiser">Fundraiser</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="participants" data-testid="label-participants">Participants</Label>
              <Input
                id="participants"
                type="number"
                {...register("participants", { valueAsNumber: true })}
                placeholder="30"
                className={errors.participants ? "border-red-500" : "focus:ring-2 focus:ring-wine-500 focus:border-transparent"}
                data-testid="input-participants"
              />
              {errors.participants && (
                <p className="text-sm text-red-500 mt-1" data-testid="error-participants">
                  {errors.participants.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="difficulty" data-testid="label-difficulty">Difficulty</Label>
              <Select onValueChange={(value) => setValue("difficulty", value as any)} defaultValue="mixed">
                <SelectTrigger data-testid="select-difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixed">Mixed</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={generateEventMutation.isPending}
            className="w-full trivia-button-primary"
            data-testid="button-generate-event"
          >
            {generateEventMutation.isPending ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Generating Event...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Event with AI
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
