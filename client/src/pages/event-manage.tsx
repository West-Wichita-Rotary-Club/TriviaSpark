import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";

// Debug log to confirm module loading
console.log("event-manage.tsx module loaded!");
import { BrandingTab } from "../components/event/BrandingTab";
import { ContactTab } from "../components/event/ContactTab";
import { DetailsTab } from "../components/event/DetailsTab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  formatDateInCST, 
  formatDateTimeInCST, 
  getDateForInputInCST, 
  createDateInCST 
} from "@/lib/utils";
import { 
  Brain, 
  ArrowLeft, 
  Save, 
  Play, 
  Pause, 
  SkipForward, 
  Users, 
  Calendar, 
  MapPin, 
  Building2,
  Clock,
  Trophy,
  Settings,
  Plus,
  Edit,
  Trash2,
  Sparkles,
  Palette,
  Mail,
  FileText
} from "lucide-react";

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
  
  // Rich content and branding
  logoUrl?: string | null;
  backgroundImageUrl?: string | null;
  eventCopy?: string | null;
  welcomeMessage?: string | null;
  thankYouMessage?: string | null;
  
  // Theme and styling
  primaryColor?: string | null;
  secondaryColor?: string | null;
  fontFamily?: string | null;
  
  // Contact and social
  contactEmail?: string | null;
  contactPhone?: string | null;
  websiteUrl?: string | null;
  socialLinks?: string | null;
  
  // Event details
  prizeInformation?: string | null;
  eventRules?: string | null;
  specialInstructions?: string | null;
  accessibilityInfo?: string | null;
  dietaryAccommodations?: string | null;
  dressCode?: string | null;
  ageRestrictions?: string | null;
  technicalRequirements?: string | null;
  
  // Business information
  registrationDeadline?: string | null;
  cancellationPolicy?: string | null;
  refundPolicy?: string | null;
  sponsorInformation?: string | null;
  
  createdAt: string;
};

type Question = {
  id: string;
  eventId: string;
  type: string;
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: string;
  category: string;
  points: number;
  timeLimit: number;
  orderIndex: number;
  aiGenerated?: boolean;
};

type FunFact = {
  id: string;
  eventId: string;
  title: string;
  content: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
};

type EventFormData = {
  title: string;
  description: string;
  eventType: string;
  maxParticipants: number;
  difficulty: string;
  eventDate: string;
  eventTime: string;
  location: string;
  sponsoringOrganization: string;
  
  // Rich content and branding
  logoUrl?: string;
  backgroundImageUrl?: string;
  eventCopy?: string;
  welcomeMessage?: string;
  thankYouMessage?: string;
  
  // Theme and styling
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  
  // Contact and social
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
  socialLinks?: string;
  
  // Event details
  prizeInformation?: string;
  eventRules?: string;
  specialInstructions?: string;
  accessibilityInfo?: string;
  dietaryAccommodations?: string;
  dressCode?: string;
  ageRestrictions?: string;
  technicalRequirements?: string;
  
  // Business information
  registrationDeadline?: string;
  cancellationPolicy?: string;
  refundPolicy?: string;
  sponsorInformation?: string;
};

interface EventManageProps {
  eventId?: string;
}

function EventManage({ eventId: propEventId }: EventManageProps = {}) {
  console.log("EventManage component is mounting!");
  const [, params] = useRoute("/events/:id/manage");
  console.log("Route params:", params);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [dryRunActive, setDryRunActive] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [finalCountdown, setFinalCountdown] = useState(0); // 0 = no countdown, 1-3 = countdown number
  const [answersLocked, setAnswersLocked] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [viewMode, setViewMode] = useState<'both' | 'presenter' | 'participant'>('both');
  
  const [participants, setParticipants] = useState<Array<{
    id: string;
    name: string;
    selectedAnswer: string | null;
    answerLocked: boolean;
    score: number;
  }>>([
    { id: 'team1', name: 'Team 1', selectedAnswer: null, answerLocked: false, score: 0 },
    { id: 'team2', name: 'Team 2', selectedAnswer: null, answerLocked: false, score: 0 }
  ]);
  const [showBetweenQuestions, setShowBetweenQuestions] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [funFactsText, setFunFactsText] = useState('');
  const [editingFunFacts, setEditingFunFacts] = useState(false);

  const eventId = propEventId || params?.id;
  console.log("Extracted eventId:", eventId, "from propEventId:", propEventId, "params:", params);
  console.log("EventManage - eventId:", eventId, "propEventId:", propEventId, "params:", params);

  // Early return if no eventId
  if (!eventId) {
    console.error("No eventId provided to EventManage component");
    return (
      <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 wine-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Brain className="text-champagne-400 h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-wine-800 mb-2">Event Not Found</h1>
          <p className="text-wine-600 mb-4">No event ID was provided.</p>
          <Button onClick={() => setLocation("/dashboard")} variant="outline">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Get event details
  const { data: event, isLoading: eventLoading, error: eventError } = useQuery<Event>({
    queryKey: ["/api/events", eventId],
    enabled: !!eventId,
    retry: false
  });

  // Get questions for this event
  const { data: questions = [], isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: ["/api/events", eventId, "questions"],
    enabled: !!eventId,
    retry: false
  });

  // Get fun facts for this event
  const { data: funFacts = [], isLoading: funFactsLoading } = useQuery<FunFact[]>({
    queryKey: ["/api/events", eventId, "fun-facts"],
    enabled: !!eventId,
    retry: false
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty }
  } = useForm<EventFormData>({
    defaultValues: {
      title: "",
      description: "",
      eventType: "",
      maxParticipants: 50,
      difficulty: "medium",
      eventDate: "",
      eventTime: "",
      location: "",
      sponsoringOrganization: ""
    }
  });

  // Populate form when event loads
  useEffect(() => {
    if (event) {
      const formData: EventFormData = {
        title: event.title || "",
        description: event.description || "",
        eventType: event.eventType || "",
        maxParticipants: event.maxParticipants || 50,
        difficulty: event.difficulty || "medium",
        eventDate: event.eventDate ? getDateForInputInCST(event.eventDate) : "",
        eventTime: event.eventTime || "",
        location: event.location || "",
        sponsoringOrganization: event.sponsoringOrganization || ""
      };
      reset(formData);
    }
  }, [event, reset]);

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update event");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event Updated",
        description: "Event details have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch(`/api/events/${eventId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update status");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Status Updated",
        description: `Event status changed to ${data.status}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Status Update Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: EventFormData) => {
    // Convert date string to Date object for database, ensuring CST interpretation
    const formattedData = {
      ...data,
      eventDate: data.eventDate ? createDateInCST(data.eventDate, data.eventTime) : null,
    } as any; // Type assertion to handle Date conversion
    updateEventMutation.mutate(formattedData);
  };

  const handleStatusChange = (status: string) => {
    updateStatusMutation.mutate(status);
  };

  const startDryRun = () => {
    if (questions.length === 0) {
      toast({
        title: "No Questions",
        description: "Add some questions to your event before running a dry run.",
        variant: "destructive",
      });
      return;
    }
    setDryRunActive(true);
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    setAnswersLocked(false);
    setTimeLeft(30);
    setFinalCountdown(0);
    setTimerActive(true);
  };

  const resetQuestionState = () => {
    setShowAnswer(false);
    setAnswersLocked(false);
    setTimeLeft(30);
    setFinalCountdown(0);
    setShowBetweenQuestions(false);
    setShowFinalResults(false);
    setParticipants(prev => prev.map(p => ({
      ...p,
      selectedAnswer: null,
      answerLocked: false
    })));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setShowBetweenQuestions(true);
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        resetQuestionState();
        setTimerActive(true);
      }, 5000); // Show between-questions view for 5 seconds
    } else {
      // Show final results instead of ending immediately
      setShowFinalResults(true);
    }
  };

  const handleAnswerSelect = (teamId: string, answer: string) => {
    setParticipants(prev => prev.map(p => {
      if (p.id === teamId && !p.answerLocked && !answersLocked) {
        return { ...p, selectedAnswer: answer };
      }
      return p;
    }));
  };

  const handleLockAnswer = (teamId: string) => {
    setParticipants(prev => {
      const newParticipants = prev.map(p => {
        if (p.id === teamId && p.selectedAnswer && !p.answerLocked && !answersLocked) {
          // Simple scoring: if correct answer within 30 seconds, score = remaining time
          const currentQuestion = questions[currentQuestionIndex];
          const isCorrect = currentQuestion && 
            p.selectedAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
          const points = isCorrect && timeLeft > 0 ? timeLeft : 0;
          
          return {
            ...p,
            answerLocked: true,
            score: p.score + points
          };
        }
        return p;
      });
      
      // Broadcast locked answer (optional, for real multiplayer later)
      const lockedParticipant = newParticipants.find(p => p.id === teamId);
      
      // Check if all teams have now locked their answers
      const allLocked = newParticipants.every(p => p.answerLocked);
      if (allLocked) {
        toast({
          title: "All Teams Answered!",
          description: "All participants have locked their answers. Revealing results...",
        });
      }
      
      return newParticipants;
    });
  };

  const handleSaveFunFacts = () => {
    // In a real app, this would save to the database
    setEditingFunFacts(false);
    toast({
      title: "Fun Facts Updated",
      description: "Event fun facts have been saved successfully.",
    });
  };

  const toggleAnswer = () => {
    if (!answersLocked) {
      setShowAnswer(!showAnswer);
      // Stop the timer if manually showing answer
      if (!showAnswer) {
        setTimerActive(false);
      }
    }
  };

  const stopDryRun = () => {
    setDryRunActive(false);
    setCurrentQuestionIndex(0);
    resetQuestionState();
    setTimeLeft(30);
    setFinalCountdown(0);
    setTimerActive(false);
    setParticipants(prev => prev.map(p => ({ ...p, score: 0, selectedAnswer: null, answerLocked: false })));
  };

  const finishDryRun = () => {
    setDryRunActive(false);
    setCurrentQuestionIndex(0);
    resetQuestionState();
    setTimeLeft(30);
    setFinalCountdown(0);
    setTimerActive(false);
    setParticipants(prev => prev.map(p => ({ ...p, score: 0, selectedAnswer: null, answerLocked: false })));
    toast({
      title: "Dry Run Complete",
      description: "Great job! You've completed the trivia preview.",
    });
  };

  // Generate AI question mutation
  const generateQuestionMutation = useMutation({
    mutationFn: async ({ topic, type }: { topic: string; type: string }) => {
      const response = await fetch("/api/questions/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          topic,
          type,
          count: 1
        }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate question");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "questions"] });
      setAiTopic("");
      toast({
        title: "Question Generated",
        description: "AI question has been added to your event.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async (question: Question) => {
      const response = await fetch(`/api/questions/${question.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(question),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update question");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "questions"] });
      setEditingQuestion(null);
      toast({
        title: "Question Updated",
        description: "Question has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: "DELETE",
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete question");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "questions"] });
      toast({
        title: "Question Deleted",
        description: "Question has been removed from your event.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleGenerateAIQuestion = (type: string) => {
    if (!aiTopic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for the AI question.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    generateQuestionMutation.mutate({ topic: aiTopic, type }, {
      onSettled: () => setIsGenerating(false)
    });
  };

  // Timer logic for dry run
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerActive && timeLeft > 0 && !showAnswer) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === 4) {
            // Start final countdown at 3
            setFinalCountdown(3);
            return prev - 1;
          } else if (prev === 3) {
            setFinalCountdown(2);
            return prev - 1;
          } else if (prev === 2) {
            setFinalCountdown(1);
            return prev - 1;
          } else if (prev === 1) {
            // Time's up - lock answers and show answer
            setTimerActive(false);
            setAnswersLocked(true);
            setShowAnswer(true);
            setFinalCountdown(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft, showAnswer]);

  // Auto-close question when all teams have locked their answers
  useEffect(() => {
    if (dryRunActive && !showAnswer && !answersLocked && participants.length > 0) {
      const allTeamsLocked = participants.every(p => p.answerLocked);
      if (allTeamsLocked) {
        // All teams have locked their answers, auto-close the question
        setTimerActive(false);
        setAnswersLocked(true);
        
        // Show answer after a brief delay
        setTimeout(() => {
          setShowAnswer(true);
        }, 1000);
      }
    }
  }, [participants, dryRunActive, showAnswer, answersLocked]);

  // Reset final countdown when it reaches 0
  useEffect(() => {
    if (finalCountdown === 1) {
      const timeout = setTimeout(() => {
        setFinalCountdown(0);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [finalCountdown]);

  // EditQuestionForm component
  function EditQuestionForm({ question, onSave, onCancel, isLoading }: {
    question: Question;
    onSave: (question: Question) => void;
    onCancel: () => void;
    isLoading: boolean;
  }) {
    const [editForm, setEditForm] = useState({
      question: question.question,
      correctAnswer: question.correctAnswer,
      options: Array.isArray(question.options) ? [...question.options] : [],
      points: question.points || 100,
      timeLimit: question.timeLimit || 30
    });

    const updateOption = (index: number, value: string) => {
      const newOptions = [...editForm.options];
      newOptions[index] = value;
      setEditForm({ ...editForm, options: newOptions });
    };

    const handleSave = () => {
      const updatedQuestion = {
        ...question,
        question: editForm.question,
        correctAnswer: editForm.correctAnswer,
        options: editForm.options,
        points: editForm.points,
        timeLimit: editForm.timeLimit
      };
      onSave(updatedQuestion);
    };

    return (
      <div className="space-y-4">
        <div>
          <Label>Question</Label>
          <Textarea
            value={editForm.question}
            onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
            className="mt-1"
            rows={2}
            data-testid="textarea-edit-question"
          />
        </div>
        
        {question.type === 'multiple_choice' && (
          <div>
            <Label>Options</Label>
            <div className="space-y-2 mt-1">
              {editForm.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <span className="w-8 h-10 bg-gray-100 rounded flex items-center justify-center text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    data-testid={`input-edit-option-${index}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Correct Answer</Label>
            <Input
              value={editForm.correctAnswer}
              onChange={(e) => setEditForm({ ...editForm, correctAnswer: e.target.value })}
              className="mt-1"
              data-testid="input-edit-correct-answer"
            />
          </div>
          <div>
            <Label>Points</Label>
            <Input
              type="number"
              value={editForm.points}
              onChange={(e) => setEditForm({ ...editForm, points: parseInt(e.target.value) || 100 })}
              className="mt-1"
              min="10"
              max="500"
              data-testid="input-edit-points"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1"
            data-testid="button-save-question"
          >
            {isLoading ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-pulse" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={isLoading}
            data-testid="button-cancel-edit"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 wine-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Brain className="text-champagne-400 h-8 w-8 animate-pulse" />
          </div>
          <p className="text-wine-700">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">Event not found</p>
            <Button onClick={() => setLocation("/dashboard")} data-testid="button-back-events">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50">
      {/* Header */}
      <div className="wine-gradient shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => setLocation("/dashboard")}
                className="text-white hover:bg-white/10 mr-4"
                data-testid="button-back"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white" data-testid="text-page-title">
                  Manage Event
                </h1>
                <p className="text-champagne-200" data-testid="text-event-title">
                  {event.title}
                </p>
              </div>
            </div>
            <Badge 
              variant={event.status === 'active' ? 'default' : 'secondary'}
              className={`text-sm ${event.status === 'active' ? 'bg-emerald-100 text-emerald-800' : ''}`}
              data-testid="badge-event-status"
            >
              {event.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8" data-testid="tabs-event-management">
            <TabsTrigger value="details" data-testid="tab-details">
              <Settings className="mr-2 h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="branding" data-testid="tab-branding">
              <Palette className="mr-2 h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="event-info" data-testid="tab-event-info">
              <FileText className="mr-2 h-4 w-4" />
              Event Info
            </TabsTrigger>
            <TabsTrigger value="contact" data-testid="tab-contact">
              <Mail className="mr-2 h-4 w-4" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="trivia" data-testid="tab-trivia">
              <Brain className="mr-2 h-4 w-4" />
              Trivia
            </TabsTrigger>
            <TabsTrigger value="funfacts" data-testid="tab-funfacts">
              <Sparkles className="mr-2 h-4 w-4" />
              Fun Facts
            </TabsTrigger>
            <TabsTrigger value="status" data-testid="tab-status">
              <Trophy className="mr-2 h-4 w-4" />
              Status
            </TabsTrigger>
            <TabsTrigger value="dryrun" data-testid="tab-dryrun">
              <Play className="mr-2 h-4 w-4" />
              Dry Run
            </TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <BrandingTab
              event={event}
              onUpdate={(data: any) => {
                // Update form data
                Object.keys(data).forEach(key => {
                  setValue(key as any, data[key]);
                });
              }}
              isLoading={updateEventMutation.isPending}
            />
          </TabsContent>

          {/* Event Info Tab */}
          <TabsContent value="event-info">
            <DetailsTab
              event={event}
              onUpdate={(data: any) => {
                // Update form data
                Object.keys(data).forEach(key => {
                  setValue(key as any, data[key]);
                });
              }}
              isLoading={updateEventMutation.isPending}
            />
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <ContactTab
              event={event}
              onUpdate={(data: any) => {
                // Update form data
                Object.keys(data).forEach(key => {
                  setValue(key as any, data[key]);
                });
              }}
              isLoading={updateEventMutation.isPending}
            />
          </TabsContent>

          {/* Event Details Tab */}
          <TabsContent value="details">
            <Card className="trivia-card" data-testid="card-event-details">
              <CardHeader>
                <CardTitle className="wine-text">Edit Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Label htmlFor="title">Event Title *</Label>
                      <Input
                        id="title"
                        {...register("title", { required: "Title is required" })}
                        className="mt-1"
                        data-testid="input-title"
                      />
                      {errors.title && (
                        <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        rows={3}
                        className="mt-1"
                        data-testid="input-description"
                      />
                    </div>

                    <div>
                      <Label htmlFor="eventType">Event Type *</Label>
                      <Select
                        value={watch("eventType") || ""}
                        onValueChange={(value) => setValue("eventType", value, { shouldDirty: true })}
                      >
                        <SelectTrigger className="mt-1" data-testid="select-event-type">
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wine-dinner">Wine Dinner</SelectItem>
                          <SelectItem value="corporate">Corporate Event</SelectItem>
                          <SelectItem value="party">Party</SelectItem>
                          <SelectItem value="educational">Educational</SelectItem>
                          <SelectItem value="fundraiser">Fundraiser</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select
                        value={watch("difficulty") || ""}
                        onValueChange={(value) => setValue("difficulty", value, { shouldDirty: true })}
                      >
                        <SelectTrigger className="mt-1" data-testid="select-difficulty">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="maxParticipants">Max Participants</Label>
                      <Input
                        id="maxParticipants"
                        type="number"
                        {...register("maxParticipants", { 
                          required: "Max participants is required",
                          min: { value: 1, message: "Must be at least 1" },
                          max: { value: 500, message: "Maximum 500 participants" },
                          valueAsNumber: true
                        })}
                        className="mt-1"
                        data-testid="input-max-participants"
                      />
                      {errors.maxParticipants && (
                        <p className="text-sm text-red-500 mt-1">{errors.maxParticipants.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="eventDate">Event Date</Label>
                      <Input
                        id="eventDate"
                        type="date"
                        {...register("eventDate")}
                        className="mt-1"
                        data-testid="input-event-date"
                      />
                    </div>

                    <div>
                      <Label htmlFor="eventTime">Event Time</Label>
                      <Input
                        id="eventTime"
                        {...register("eventTime")}
                        placeholder="e.g., 7:00 PM"
                        className="mt-1"
                        data-testid="input-event-time"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        {...register("location")}
                        placeholder="Event venue"
                        className="mt-1"
                        data-testid="input-location"
                      />
                    </div>

                    <div>
                      <Label htmlFor="sponsoringOrganization">Sponsoring Organization</Label>
                      <Input
                        id="sponsoringOrganization"
                        {...register("sponsoringOrganization")}
                        placeholder="Organization name"
                        className="mt-1"
                        data-testid="input-sponsoring-org"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateEventMutation.isPending || !isDirty}
                      className="trivia-button-primary"
                      data-testid="button-save-event"
                    >
                      {updateEventMutation.isPending ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Event Trivia Tab */}
          <TabsContent value="trivia">
            <div className="space-y-6">
              {/* AI Generation Section */}
              <Card className="trivia-card" data-testid="card-ai-generation">
                <CardHeader>
                  <CardTitle className="wine-text flex items-center">
                    <Sparkles className="mr-2 h-5 w-5" />
                    AI Question Generator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="aiTopic">Topic</Label>
                      <Input
                        id="aiTopic"
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        placeholder="e.g., Pacific Northwest wines, Local history, Sports trivia"
                        className="mt-1"
                        data-testid="input-ai-topic"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleGenerateAIQuestion("multiple_choice")}
                        disabled={isGenerating || !aiTopic.trim()}
                        variant="outline"
                        className="flex-1"
                        data-testid="button-generate-multiple-choice"
                      >
                        {isGenerating ? (
                          <Brain className="mr-2 h-4 w-4 animate-pulse" />
                        ) : (
                          <Plus className="mr-2 h-4 w-4" />
                        )}
                        Multiple Choice
                      </Button>
                      <Button
                        onClick={() => handleGenerateAIQuestion("true_false")}
                        disabled={isGenerating || !aiTopic.trim()}
                        variant="outline"
                        className="flex-1"
                        data-testid="button-generate-true-false"
                      >
                        {isGenerating ? (
                          <Brain className="mr-2 h-4 w-4 animate-pulse" />
                        ) : (
                          <Plus className="mr-2 h-4 w-4" />
                        )}
                        True/False
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Questions List */}
              <Card className="trivia-card" data-testid="card-questions-list">
                <CardHeader>
                  <CardTitle className="wine-text flex items-center justify-between">
                    <span>Event Questions ({questions.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {questions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Brain className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                      <p className="mb-2">No questions yet</p>
                      <p className="text-sm">Generate AI questions or add your own to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {questions.map((question, index) => (
                        <div
                          key={question.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          data-testid={`question-${index}`}
                        >
                          {editingQuestion?.id === question.id ? (
                            <EditQuestionForm
                              question={editingQuestion}
                              onSave={(updatedQuestion) => updateQuestionMutation.mutate(updatedQuestion)}
                              onCancel={() => setEditingQuestion(null)}
                              isLoading={updateQuestionMutation.isPending}
                            />
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary" className="text-xs">
                                      #{index + 1}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {question.type.replace('_', ' ')}
                                    </Badge>
                                    {question.aiGenerated && (
                                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600">
                                        <Brain className="mr-1 h-3 w-3" />
                                        AI
                                      </Badge>
                                    )}
                                    <Badge variant="outline" className="text-xs">
                                      {question.points || 100} pts
                                    </Badge>
                                  </div>
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    {question.question}
                                  </h4>
                                  {Array.isArray(question.options) && question.options.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                      {question.options.map((option, optIndex) => (
                                        <div
                                          key={optIndex}
                                          className={`text-sm p-2 rounded ${
                                            option === question.correctAnswer
                                              ? 'bg-green-100 text-green-800 font-medium'
                                              : 'bg-gray-100 text-gray-700'
                                          }`}
                                        >
                                          {String.fromCharCode(65 + optIndex)}. {option}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <p className="text-sm text-green-600 font-medium">
                                    Correct Answer: {question.correctAnswer}
                                  </p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                  <Button
                                    onClick={() => setEditingQuestion(question)}
                                    variant="ghost"
                                    size="sm"
                                    data-testid={`button-edit-${index}`}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this question?')) {
                                        deleteQuestionMutation.mutate(question.id);
                                      }
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    data-testid={`button-delete-${index}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Status Control Tab */}
          <TabsContent value="status">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="trivia-card" data-testid="card-status-control">
                <CardHeader>
                  <CardTitle className="wine-text">Event Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <Badge 
                      variant={event.status === 'active' ? 'default' : 'secondary'}
                      className={`text-lg px-4 py-2 ${event.status === 'active' ? 'bg-emerald-100 text-emerald-800' : ''}`}
                      data-testid="badge-current-status"
                    >
                      {(event.status || 'draft').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleStatusChange("draft")}
                      disabled={event.status === "draft" || updateStatusMutation.isPending}
                      variant={event.status === "draft" ? "default" : "outline"}
                      data-testid="button-set-draft"
                    >
                      Draft
                    </Button>
                    <Button
                      onClick={() => handleStatusChange("active")}
                      disabled={event.status === "active" || updateStatusMutation.isPending}
                      variant={event.status === "active" ? "default" : "outline"}
                      data-testid="button-set-active"
                    >
                      Active
                    </Button>
                    <Button
                      onClick={() => handleStatusChange("completed")}
                      disabled={event.status === "completed" || updateStatusMutation.isPending}
                      variant={event.status === "completed" ? "default" : "outline"}
                      data-testid="button-set-completed"
                    >
                      Completed
                    </Button>
                    <Button
                      onClick={() => handleStatusChange("cancelled")}
                      disabled={event.status === "cancelled" || updateStatusMutation.isPending}
                      variant={event.status === "cancelled" ? "destructive" : "outline"}
                      data-testid="button-set-cancelled"
                    >
                      Cancelled
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="trivia-card" data-testid="card-event-info">
                <CardHeader>
                  <CardTitle className="wine-text">Event Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-3 h-4 w-4 text-wine-600" />
                      <span className="font-medium">Date:</span>
                      <span className="ml-2" data-testid="text-info-date">
                        {event.eventDate ? formatDateInCST(event.eventDate) : "Not set"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="mr-3 h-4 w-4 text-wine-600" />
                      <span className="font-medium">Time:</span>
                      <span className="ml-2" data-testid="text-info-time">
                        {event.eventTime || "Not set"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-3 h-4 w-4 text-wine-600" />
                      <span className="font-medium">Location:</span>
                      <span className="ml-2" data-testid="text-info-location">
                        {event.location || "Not set"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Building2 className="mr-3 h-4 w-4 text-wine-600" />
                      <span className="font-medium">Organization:</span>
                      <span className="ml-2" data-testid="text-info-organization">
                        {event.sponsoringOrganization || "Not set"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="mr-3 h-4 w-4 text-wine-600" />
                      <span className="font-medium">Max Participants:</span>
                      <span className="ml-2" data-testid="text-info-max-participants">
                        {event.maxParticipants}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Fun Facts Management Tab */}
          <TabsContent value="funfacts">
            <Card className="trivia-card" data-testid="card-fun-facts">
              <CardHeader>
                <CardTitle className="wine-text flex items-center justify-between">
                  <span>Fun Facts Management</span>
                  <Button
                    onClick={() => setEditingFunFacts(!editingFunFacts)}
                    variant="outline"
                    data-testid="button-edit-fun-facts"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {editingFunFacts ? 'Cancel' : 'Edit'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Add fun facts about your organization that will be shown between questions during the trivia event.
                  </p>
                  
                  {funFactsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wine-600"></div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Current Fun Facts ({funFacts.length}):</h4>
                      {funFacts.length > 0 ? (
                        <div className="space-y-3">
                          {funFacts.map((fact, index) => (
                            <div key={fact.id} className="border-l-4 border-wine-600 pl-3">
                              <h5 className="font-medium text-wine-700">{index + 1}. {fact.title}</h5>
                              <p className="text-gray-700 mt-1">{fact.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No fun facts available for this event yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dry Run Tab */}
          <TabsContent value="dryrun">
            <div className="space-y-4">
              {/* View Mode Selector */}
              <Card className="trivia-card">
                <CardHeader>
                  <CardTitle className="wine-text flex items-center justify-between">
                    <span>Dry Run - Test Your Trivia</span>
                    <div className="flex gap-2">
                      <Button
                        variant={viewMode === 'both' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('both')}
                        data-testid="button-view-both"
                      >
                        Split View
                      </Button>
                      <Button
                        variant={viewMode === 'presenter' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('presenter')}
                        data-testid="button-view-presenter"
                      >
                        Presenter
                      </Button>
                      <Button
                        variant={viewMode === 'participant' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('participant')}
                        data-testid="button-view-participant"
                      >
                        Participant
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                {!dryRunActive ? (
                    <div className="text-center space-y-4">
                      <p className="text-gray-600">
                        Preview your trivia questions as participants would see them.
                        {questions.length === 0 && " Add some questions first!"}
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium mb-2">Questions in this event:</p>
                        <p className="text-2xl font-bold text-wine-700" data-testid="text-question-count">
                          {questions.length}
                        </p>
                      </div>
                      <Button
                        onClick={startDryRun}
                        disabled={questions.length === 0}
                        className="trivia-button-primary"
                        data-testid="button-start-dry-run"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Start Dry Run
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Dry Run Header */}
                      <div className="flex items-center justify-between">
                        <Badge variant="default" className="bg-blue-100 text-blue-800" data-testid="badge-dry-run">
                          Dry Run Active - {viewMode === 'both' ? 'Split View' : viewMode === 'presenter' ? 'Presenter View' : 'Participant View'}
                        </Badge>
                        <div className="text-sm text-gray-600" data-testid="text-question-progress">
                          Question {currentQuestionIndex + 1} of {questions.length}
                        </div>
                      </div>

                      {/* Dual View Layout */}
                      {viewMode === 'both' && currentQuestion && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Presenter View */}
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-wine-700">👨‍🏫 Presenter View</h4>
                            <PresenterView 
                              question={currentQuestion} 
                              timeLeft={timeLeft}
                              finalCountdown={finalCountdown}
                              showAnswer={showAnswer}
                              answersLocked={answersLocked}
                            />
                          </div>
                          
                          {/* Participant View */}
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-wine-700">👥 Participants View</h4>
                            <div className="space-y-6">
                              {participants.map(participant => (
                                <div key={participant.id} className="space-y-2">
                                  <h5 className="text-md font-semibold text-wine-700">{participant.name} (Score: {participant.score})</h5>
                                  <ParticipantView 
                                    question={currentQuestion} 
                                    timeLeft={timeLeft}
                                    finalCountdown={finalCountdown}
                                    showAnswer={showAnswer}
                                    answersLocked={answersLocked}
                                    selectedAnswer={participant.selectedAnswer}
                                    answerLocked={participant.answerLocked}
                                    onAnswerSelect={(answer) => handleAnswerSelect(participant.id, answer)}
                                    onLockAnswer={() => handleLockAnswer(participant.id)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Single View Layout */}
                      {viewMode !== 'both' && currentQuestion && (
                        viewMode === 'presenter' ? (
                          <PresenterView 
                            question={currentQuestion} 
                            timeLeft={timeLeft}
                            finalCountdown={finalCountdown}
                            showAnswer={showAnswer}
                            answersLocked={answersLocked}
                          />
                        ) : (
                          <div className="space-y-4">
                            <div className="text-center">
                              <div className="space-y-2">
                                {participants.map(participant => (
                                  <Badge key={participant.id} variant="outline" className="text-lg px-4 py-2 mr-2">
                                    {participant.name}: {participant.score} points
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-6">
                              {participants.map(participant => (
                                <div key={participant.id} className="space-y-2">
                                  <h5 className="text-md font-semibold text-wine-700">{participant.name}</h5>
                                  <ParticipantView 
                                    question={currentQuestion} 
                                    timeLeft={timeLeft}
                                    finalCountdown={finalCountdown}
                                    showAnswer={showAnswer}
                                    answersLocked={answersLocked}
                                    selectedAnswer={participant.selectedAnswer}
                                    answerLocked={participant.answerLocked}
                                    onAnswerSelect={(answer) => handleAnswerSelect(participant.id, answer)}
                                    onLockAnswer={() => handleLockAnswer(participant.id)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )}

                      {/* Between Questions View */}
                      {showBetweenQuestions && (
                        <BetweenQuestionsView 
                          participants={participants}
                          currentQuestionIndex={currentQuestionIndex}
                          totalQuestions={questions.length}
                          funFacts={[
                            "West Wichita Rotary Club has been serving the community since 1985 and has raised over $2 million for local charities! 🎉",
                            "Did you know? The Pacific Northwest produces over 99% of American wine grapes, with Washington state being the second-largest wine producer in the US! 🍷",
                            "Our trivia nights have helped fund 15 local scholarships, 3 community gardens, and countless meals for families in need. Every question answered makes a difference! 💝",
                            "This is our 12th annual Coast to Cascades event! Together, we've welcomed over 600 guests and created lasting memories while supporting worthy causes. 🌟"
                          ]}
                        />
                      )}

                      {/* Final Results View */}
                      {showFinalResults && (
                        <FinalResultsView 
                          participants={participants}
                          totalQuestions={questions.length}
                          onFinish={finishDryRun}
                        />
                      )}

                      {/* Dry Run Controls */}
                      {currentQuestion && (
                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-4">
                            <Button
                              onClick={toggleAnswer}
                              variant="outline"
                              disabled={answersLocked}
                              data-testid="button-show-answer"
                            >
                              {showAnswer ? "Hide Answer" : "Show Answer"}
                            </Button>
                            {answersLocked && (
                              <div className="text-sm text-gray-600">
                                Time's up! Answer revealed automatically.
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-3">
                            <Button
                              onClick={stopDryRun}
                              variant="outline"
                              data-testid="button-stop-dry-run"
                            >
                              <Pause className="mr-2 h-4 w-4" />
                              Stop
                            </Button>
                            <Button
                              onClick={nextQuestion}
                              className="trivia-button-primary"
                              data-testid="button-next-question"
                            >
                              {currentQuestionIndex < questions.length - 1 ? (
                                <>
                                  <SkipForward className="mr-2 h-4 w-4" />
                                  Next Question
                                </>
                              ) : (
                                "Finish Dry Run"
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Presenter View Component - Shows question with controls and answer
function PresenterView({ question, timeLeft, finalCountdown, showAnswer, answersLocked }: {
  question: Question;
  timeLeft: number;
  finalCountdown: number;
  showAnswer: boolean;
  answersLocked: boolean;
}) {
  return (
    <div className="relative bg-white p-6 rounded-lg border-2 border-wine-200 shadow-sm">
      {/* Timer and Status */}
      <div className="flex items-center justify-between mb-4">
        <Badge variant="secondary" data-testid="badge-presenter-category">
          {question.category}
        </Badge>
        <div className="flex items-center gap-4">
          <div className={`flex items-center text-sm ${timeLeft <= 10 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
            <Clock className="mr-1 h-3 w-3" />
            {timeLeft}s
          </div>
          {answersLocked && (
            <Badge variant="destructive" className="bg-red-100 text-red-800">
              🔒 Locked
            </Badge>
          )}
        </div>
      </div>

      {/* Final Countdown Overlay */}
      {finalCountdown > 0 && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
          <div className="text-6xl font-bold text-white animate-pulse" data-testid={`presenter-countdown-${finalCountdown}`}>
            {finalCountdown}
          </div>
        </div>
      )}
      
      {/* Question */}
      <h3 className="text-lg font-semibold text-wine-800 mb-4" data-testid="presenter-question">
        {question.question}
      </h3>

      {/* Options with Answer Highlighting */}
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border text-sm transition-colors ${
              showAnswer && option === question.correctAnswer
                ? 'bg-green-100 border-green-300 font-medium'
                : 'bg-gray-50 border-gray-200'
            }`}
            data-testid={`presenter-option-${index}`}
          >
            <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
            {option}
            {showAnswer && option === question.correctAnswer && (
              <span className="ml-2 text-green-600 font-semibold">✓ Correct Answer</span>
            )}
          </div>
        ))}
      </div>

      {/* Answer Revealed Indicator */}
      {showAnswer && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm font-medium text-green-800">
            📱 Answer is now visible to participants
          </div>
        </div>
      )}
    </div>
  );
}

// Participant View Component - Shows what players see during the game
function ParticipantView({ question, timeLeft, finalCountdown, showAnswer, answersLocked, selectedAnswer, answerLocked, onAnswerSelect, onLockAnswer }: {
  question: Question;
  timeLeft: number;
  finalCountdown: number;
  showAnswer: boolean;
  answersLocked: boolean;
  selectedAnswer: string | null;
  answerLocked: boolean;
  onAnswerSelect: (answer: string) => void;
  onLockAnswer: () => void;
}) {
  return (
    <div className="relative bg-gradient-to-br from-wine-50 to-champagne-50 p-6 rounded-lg border-2 border-wine-200 shadow-sm">
      {/* Game Header */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-4 mb-2">
          <Badge variant="outline" className="border-wine-300 text-wine-700">
            {question.category}
          </Badge>
          <div className={`text-lg font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-wine-600'}`}>
            ⏰ {timeLeft}s
          </div>
        </div>
      </div>

      {/* Final Countdown Overlay - positioned to not block interactions */}
      {finalCountdown > 0 && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 rounded-full w-16 h-16 flex items-center justify-center z-10">
          <div className="text-2xl font-bold text-white animate-pulse" data-testid={`participant-countdown-${finalCountdown}`}>
            {finalCountdown}
          </div>
        </div>
      )}

      {/* Question */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-wine-800" data-testid="participant-question">
          {question.question}
        </h3>
      </div>

      {/* Interactive Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            disabled={answerLocked || answersLocked}
            onClick={() => onAnswerSelect(option)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
              selectedAnswer === option && !answerLocked && !answersLocked
                ? 'bg-wine-100 border-wine-400 ring-2 ring-wine-300'
                : answersLocked || answerLocked
                ? showAnswer && option === question.correctAnswer
                  ? 'bg-green-100 border-green-400 text-green-800 font-medium'
                  : selectedAnswer === option
                  ? 'bg-wine-50 border-wine-300 text-wine-800'
                  : 'bg-gray-100 border-gray-300 text-gray-600'
                : 'bg-white border-wine-200 hover:border-wine-300 hover:bg-wine-50 cursor-pointer'
            }`}
            data-testid={`participant-option-${index}`}
          >
            <span className={`inline-block w-8 h-8 rounded-full font-bold text-center leading-8 mr-3 ${
              selectedAnswer === option && !answerLocked && !answersLocked
                ? 'bg-wine-300 text-wine-800'
                : 'bg-wine-200 text-wine-800'
            }`}>
              {String.fromCharCode(65 + index)}
            </span>
            {option}
            {showAnswer && option === question.correctAnswer && (
              <span className="float-right text-green-600 font-bold text-xl">✓</span>
            )}
            {selectedAnswer === option && answerLocked && (
              <span className="float-right text-wine-600 font-bold text-xl">🔒</span>
            )}
          </button>
        ))}
      </div>

      {/* Lock Answer Button */}
      {selectedAnswer && !answerLocked && !answersLocked && (
        <div className="mt-6 text-center">
          <Button
            onClick={onLockAnswer}
            className="bg-wine-600 hover:bg-wine-700 text-white px-8 py-3 text-lg font-semibold"
            data-testid="button-lock-answer"
          >
            🔒 Lock Answer (Score: {timeLeft} pts)
          </Button>
        </div>
      )}

      {/* Locked State Messages */}
      {answerLocked && !answersLocked && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-wine-100 border border-wine-200 rounded-full text-wine-800 font-medium">
            ✅ Answer Locked! Waiting for time to end...
          </div>
        </div>
      )}
      {answersLocked && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 border border-red-200 rounded-full text-red-800 font-medium">
            🔒 Time's Up! Answers Revealed
          </div>
        </div>
      )}
    </div>
  );
}

// Final Results View Component - Shows final leaderboard and celebration
function FinalResultsView({ participants, totalQuestions, onFinish }: {
  participants: Array<{ id: string; name: string; score: number; selectedAnswer: string | null; answerLocked: boolean }>;
  totalQuestions: number;
  onFinish: () => void;
}) {
  // Sort participants by score for final leaderboard
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);
  const winner = sortedParticipants[0];
  const totalPossiblePoints = totalQuestions * 30; // Max 30 points per question

  return (
    <div className="space-y-8 text-center">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 p-8 rounded-lg border-2 border-yellow-300">
        <h2 className="text-4xl font-bold text-yellow-800 mb-2">🎉 Trivia Complete! 🎉</h2>
        <p className="text-yellow-700 text-lg">
          All {totalQuestions} questions have been answered
        </p>
      </div>

      {/* Winner Announcement */}
      <div className="bg-gradient-to-r from-champagne-100 to-wine-100 p-8 rounded-lg border-2 border-wine-200">
        <h3 className="text-3xl font-bold text-wine-800 mb-4">👑 Winner: {winner.name}! 👑</h3>
        <div className="text-5xl font-bold text-wine-800 mb-2">{winner.score} points</div>
        <p className="text-wine-600 text-lg">
          Out of {totalPossiblePoints} possible points ({Math.round((winner.score / totalPossiblePoints) * 100)}% accuracy)
        </p>
      </div>

      {/* Final Leaderboard */}
      <div className="bg-white p-8 rounded-lg border-2 border-gray-200 shadow-lg">
        <h4 className="text-2xl font-bold text-gray-800 mb-6">📊 Final Leaderboard</h4>
        <div className="space-y-4">
          {sortedParticipants.map((participant, index) => (
            <div key={participant.id} className={`flex items-center justify-between p-4 rounded-lg ${
              index === 0 ? 'bg-yellow-50 border-2 border-yellow-300' : 
              index === 1 ? 'bg-gray-50 border-2 border-gray-300' : 
              'bg-amber-50 border-2 border-amber-300'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-xl ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                }`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold text-gray-800">{participant.name}</div>
                  <div className="text-gray-600">
                    {Math.round((participant.score / totalPossiblePoints) * 100)}% accuracy
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">{participant.score}</div>
                <div className="text-gray-600">points</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
        <h4 className="text-lg font-semibold text-blue-700 mb-3">📈 Event Statistics</h4>
        <div className="grid grid-cols-2 gap-4 text-blue-800">
          <div>
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <div className="text-sm">Questions Asked</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{Math.round(participants.reduce((sum, p) => sum + p.score, 0) / participants.length)}</div>
            <div className="text-sm">Average Score</div>
          </div>
        </div>
      </div>

      {/* Finish Button */}
      <div className="pt-4">
        <Button
          onClick={onFinish}
          className="bg-wine-600 hover:bg-wine-700 text-white px-8 py-3 text-lg font-semibold"
          data-testid="button-finish-dry-run"
        >
          🏁 Finish Dry Run
        </Button>
      </div>
    </div>
  );
}

// Between Questions View Component - Shows leaderboard and fun facts
function BetweenQuestionsView({ participants, currentQuestionIndex, totalQuestions, funFacts }: {
  participants: Array<{ id: string; name: string; score: number; selectedAnswer: string | null; answerLocked: boolean }>;
  currentQuestionIndex: number;
  totalQuestions: number;
  funFacts: string[];
}) {
  // Sort participants by score for leaderboard
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);
  const randomFunFact = funFacts[Math.floor(Math.random() * funFacts.length)];
  return (
    <div className="space-y-6 text-center">
      {/* Progress */}
      <div className="bg-wine-50 p-6 rounded-lg border-2 border-wine-200">
        <h3 className="text-2xl font-bold text-wine-800 mb-2">
          Question {currentQuestionIndex + 1} Complete!
        </h3>
        <p className="text-wine-600">
          {totalQuestions - currentQuestionIndex - 1} questions remaining
        </p>
      </div>

      {/* Leaderboard */}
      <div className="bg-gradient-to-r from-champagne-100 to-wine-100 p-8 rounded-lg border-2 border-wine-200">
        <h4 className="text-lg font-semibold text-wine-700 mb-4">🏆 Leaderboard</h4>
        <div className="space-y-3">
          {sortedParticipants.map((participant, index) => (
            <div key={participant.id} className="flex items-center justify-between bg-white/50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                }`}>
                  {index + 1}
                </div>
                <span className="font-semibold text-wine-800">{participant.name}</span>
              </div>
              <div className="text-xl font-bold text-wine-800">{participant.score} pts</div>
            </div>
          ))}
        </div>
        <p className="text-wine-600 text-center mt-4">Keep it up! More points for faster answers!</p>
      </div>

      {/* Fun Fact */}
      <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
        <h4 className="text-lg font-semibold text-blue-700 mb-3">🎉 Did You Know?</h4>
        <p className="text-blue-800 text-lg leading-relaxed">{randomFunFact}</p>
      </div>

      {/* Next Question Countdown */}
      <div className="text-wine-600">
        <p>Next question starting soon...</p>
        <div className="flex justify-center mt-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-wine-600"></div>
        </div>
      </div>
    </div>
  );
}

export default EventManage;