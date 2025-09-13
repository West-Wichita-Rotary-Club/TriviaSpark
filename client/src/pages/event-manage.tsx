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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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
  
  // Event settings
  allowParticipants: boolean;
  
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
  explanation?: string;
  backgroundImageUrl?: string | null;
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
  
  // Event settings
  allowParticipants: boolean;
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
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [funFactsText, setFunFactsText] = useState('');
  const [editingFunFacts, setEditingFunFacts] = useState(false);

  const eventId = propEventId || params?.id;
  console.log("Extracted eventId:", eventId, "from propEventId:", propEventId, "routes:", params);
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
          <h1 className="text-2xl font-bold text-foreground mb-2">Event Not Found</h1>
          <p className="text-muted-foreground mb-4">No event ID was provided.</p>
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

  // ---------------- Event Form & Mutations (restored after refactor) ----------------
  // React Hook Form setup for the event details tabs
  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isDirty } } = useForm<EventFormData>({
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      eventType: event?.eventType || "",
      maxParticipants: event?.maxParticipants || 50,
      difficulty: event?.difficulty || "mixed",
      eventDate: event?.eventDate ? getDateForInputInCST(event.eventDate) : "",
      eventTime: event?.eventTime || "",
      location: event?.location || "",
      sponsoringOrganization: event?.sponsoringOrganization || "",
      // (Optional extended fields can be added here if later exposed in UI)
    }
  });

  // Sync form when event data loads/changes
  useEffect(() => {
    if (event) {
      reset({
        title: event.title || "",
        description: event.description || "",
        eventType: event.eventType || "",
        maxParticipants: event.maxParticipants || 50,
        difficulty: event.difficulty || "mixed",
        eventDate: event.eventDate ? getDateForInputInCST(event.eventDate) : "",
        eventTime: event.eventTime || "",
        location: event.location || "",
        sponsoringOrganization: event.sponsoringOrganization || "",
        logoUrl: event.logoUrl || undefined,
        backgroundImageUrl: event.backgroundImageUrl || undefined,
        eventCopy: event.eventCopy || undefined,
        welcomeMessage: event.welcomeMessage || undefined,
        thankYouMessage: event.thankYouMessage || undefined,
        primaryColor: event.primaryColor || undefined,
        secondaryColor: event.secondaryColor || undefined,
        fontFamily: event.fontFamily || undefined,
        contactEmail: event.contactEmail || undefined,
        contactPhone: event.contactPhone || undefined,
        websiteUrl: event.websiteUrl || undefined,
        socialLinks: event.socialLinks || undefined,
        prizeInformation: event.prizeInformation || undefined,
        eventRules: event.eventRules || undefined,
        specialInstructions: event.specialInstructions || undefined,
        accessibilityInfo: event.accessibilityInfo || undefined,
        dietaryAccommodations: event.dietaryAccommodations || undefined,
        dressCode: event.dressCode || undefined,
        ageRestrictions: event.ageRestrictions || undefined,
        technicalRequirements: event.technicalRequirements || undefined,
        registrationDeadline: event.registrationDeadline || undefined,
        cancellationPolicy: event.cancellationPolicy || undefined,
        refundPolicy: event.refundPolicy || undefined,
        sponsorInformation: event.sponsorInformation || undefined,
        allowParticipants: event.allowParticipants || false,
      });
      
      // Force set eventType immediately if it exists
      if (event.eventType) {
        setValue("eventType", event.eventType, { shouldValidate: true, shouldDirty: false });
      }
      
      // Additional verification and force-set if needed
      setTimeout(() => {
        const currentEventType = watch("eventType");
        if (!currentEventType && event.eventType) {
          setValue("eventType", event.eventType, { shouldValidate: true, shouldDirty: false });
        }
      }, 50);
    }
  }, [event, reset, setValue, watch]);

  // Update Event mutation
  const updateEventMutation = useMutation({
    mutationFn: async (data: Partial<EventFormData>) => {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (!response.ok) {
        try {
          const err = await response.json();
          throw new Error(err.error || 'Failed to update event');
        } catch {
          throw new Error('Failed to update event');
        }
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId] });
      toast({
        title: 'Event Updated',
        description: 'Event details saved successfully.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'An error occurred while saving the event.',
        variant: 'destructive'
      });
    }
  });

  // Status update mutation (used by status tab & quick actions)
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch(`/api/events/${eventId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include'
      });
      if (!response.ok) {
        try {
          const err = await response.json();
          throw new Error(err.error || 'Failed to update status');
        } catch {
          throw new Error('Failed to update status');
        }
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId] });
      toast({ title: 'Status Updated', description: 'Event status changed.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Status Update Failed',
        description: error.message || 'Could not update event status.',
        variant: 'destructive'
      });
    }
  });

  // Form submit handler
  const onSubmit = (data: EventFormData) => {
    // Convert date from YYYY-MM-DD format to ISO format for API
    const processedData = {
      ...data,
      eventDate: data.eventDate ? createDateInCST(data.eventDate, data.eventTime).toISOString() : data.eventDate
    };
    updateEventMutation.mutate(processedData);
  };

  type UnsplashImage = {
    id: string;
    description?: string;
    alt_description?: string;
    urls: { thumb: string; small: string; regular: string; full: string };
    links: { html: string; download_location?: string };
    user: { name: string; links: { html: string } };
  };

  // Modal-based question editor with Unsplash image search
  function EditQuestionForm({ question, onSave, onCancel, isLoading }: {
    question: Question;
    onSave: (q: Question, selectedImage?: UnsplashImage) => void;
    onCancel: () => void;
    isLoading: boolean;
  }) {
      const [editForm, setEditForm] = useState({
        question: question.question || "",
        correctAnswer: question.correctAnswer || "",
        options: Array.isArray(question.options) ? [...question.options] : [],
        points: question.points || 100,
        timeLimit: question.timeLimit || 30,
        difficulty: question.difficulty || "medium",
        category: question.category || "",
        explanation: question.explanation || "",
        orderIndex: question.orderIndex || 1,
        backgroundImageUrl: question.backgroundImageUrl || ""
      });
      const [unsplashQuery, setUnsplashQuery] = useState("");
      const [unsplashResults, setUnsplashResults] = useState<UnsplashImage[]>([]);
      const [unsplashLoading, setUnsplashLoading] = useState(false);
      const [unsplashError, setUnsplashError] = useState<string | null>(null);
      const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);
      const [trackingDownload, setTrackingDownload] = useState(false);

      // Query to fetch event image for this question
      const { data: eventImageData, refetch: refetchEventImage } = useQuery({
        queryKey: ["/api/eventimages/question", question.id],
        queryFn: async () => {
          const response = await fetch(`/api/eventimages/question/${question.id}`, {
            credentials: 'include',
          });
          if (!response.ok) {
            throw new Error("Failed to fetch event image");
          }
          return response.json();
        },
      });

      // Event image form state
      const [eventImageForm, setEventImageForm] = useState({
        unsplashImageId: "",
        sizeVariant: "regular",
        usageContext: "question_background", 
        searchContext: ""
      });

      // Update event image form when data is loaded
      useEffect(() => {
        if (eventImageData?.eventImage) {
          const img = eventImageData.eventImage;
          setEventImageForm({
            unsplashImageId: img.unsplashImageId || "",
            sizeVariant: img.sizeVariant || "regular",
            usageContext: img.usageContext || "question_background",
            searchContext: img.searchContext || ""
          });
        }
      }, [eventImageData]);

      // Mutation for saving event image
      const saveEventImageMutation = useMutation({
        mutationFn: async () => {
          const response = await fetch(`/api/eventimages/question/${question.id}/replace`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(eventImageForm),
            credentials: 'include',
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to save event image");
          }
          
          return response.json();
        },
        onSuccess: () => {
          refetchEventImage();
          toast({
            title: "Event Image Saved",
            description: "Event image record has been saved successfully.",
          });
        },
        onError: (error) => {
          toast({
            title: "Save Failed", 
            description: error.message,
            variant: "destructive",
          });
        },
      });

      const updateOption = (index: number, value: string) => {
        const newOptions = [...editForm.options];
        newOptions[index] = value;
        setEditForm({ ...editForm, options: newOptions });
      };

      const handleUnsplashSearch = async () => {
        if (!unsplashQuery.trim()) return;
        setUnsplashLoading(true);
        setUnsplashError(null);
        try {
          const res = await fetch(`/api/unsplash/search?query=${encodeURIComponent(unsplashQuery)}&perPage=12`);
          if (!res.ok) {
            const d = await res.json();
            throw new Error(d.error || "Search failed");
          }
          const data = await res.json();
          setUnsplashResults(data.results || []);
        } catch (e:any) {
          setUnsplashError(e.message);
        } finally {
          setUnsplashLoading(false);
        }
      };

      const handleSelectImage = (img: UnsplashImage) => {
        setSelectedImage(img);
        setEditForm(f => ({ ...f, backgroundImageUrl: img.urls.regular }));
        
        // Auto-populate EventImage form with selected image data
        setEventImageForm({
          unsplashImageId: img.id,
          sizeVariant: "regular",
          usageContext: "question_background",
          searchContext: unsplashQuery || ""
        });
      };

      const trackDownloadIfNeeded = async () => {
        if (!selectedImage?.links?.download_location) return;
        try {
          setTrackingDownload(true);
          await fetch("/api/unsplash/track-download", {
            method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ downloadUrl: selectedImage.links.download_location })
          });
        } catch { /* ignore */ }
        finally { setTrackingDownload(false); }
      };

      const handleSave = async () => {
        console.log('handleSave called, selectedImage:', selectedImage);
        
        const updatedQuestion: Question = {
          ...question,
          question: editForm.question,
          correctAnswer: editForm.correctAnswer,
          options: editForm.options,
          points: editForm.points,
          timeLimit: editForm.timeLimit,
          difficulty: editForm.difficulty,
          category: editForm.category,
          explanation: editForm.explanation,
          orderIndex: editForm.orderIndex,
          backgroundImageUrl: editForm.backgroundImageUrl || null
        };
        
        console.log('Calling onSave with question and selectedImage:', { question: updatedQuestion, selectedImage });
        onSave(updatedQuestion, selectedImage || undefined);
        
        // Save EventImage record if form has data
        if (eventImageForm.unsplashImageId) {
          console.log('Saving EventImage record with form data:', eventImageForm);
          try {
            await saveEventImageMutation.mutateAsync();
          } catch (error) {
            console.error('Failed to save EventImage record:', error);
            // Don't fail the whole save if EventImage save fails
          }
        }
        
        // fire and forget download tracking
        trackDownloadIfNeeded();
      };

      return (
        <div className="space-y-6">
          <div>
            <Label className="text-foreground font-medium">Question</Label>
            <Textarea
              value={editForm.question}
              onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
              className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              rows={3}
              data-testid="textarea-edit-question"
            />
          </div>
          {question.type === 'multiple_choice' && (
            <div>
              <Label className="text-foreground font-medium">Options</Label>
              <div className="space-y-2 mt-1">
                {editForm.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="w-8 h-10 bg-muted border border-border rounded flex items-center justify-center text-sm font-medium text-foreground">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      data-testid={`input-edit-option-${index}`}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-foreground font-medium">Correct Answer</Label>
              <Input
                value={editForm.correctAnswer}
                onChange={(e) => setEditForm({ ...editForm, correctAnswer: e.target.value })}
                className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                data-testid="input-edit-correct-answer"
              />
            </div>
            <div>
              <Label className="text-foreground font-medium">Points</Label>
              <Input
                type="number"
                value={editForm.points}
                onChange={(e) => setEditForm({ ...editForm, points: parseInt(e.target.value) || 0 })}
                className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                min={10}
                max={500}
                data-testid="input-edit-points"
              />
            </div>
            <div>
              <Label className="text-foreground font-medium">Time Limit (s)</Label>
              <Input
                type="number"
                value={editForm.timeLimit}
                onChange={(e) => setEditForm({ ...editForm, timeLimit: parseInt(e.target.value) || 30 })}
                className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                min={5}
                max={300}
                data-testid="input-edit-timeLimit"
              />
            </div>
            <div>
              <Label className="text-foreground font-medium">Difficulty</Label>
              <Select value={editForm.difficulty} onValueChange={(v) => setEditForm({ ...editForm, difficulty: v })}>
                <SelectTrigger className="mt-1 bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary" data-testid="select-edit-difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="easy" className="text-popover-foreground hover:bg-accent hover:text-accent-foreground">Easy</SelectItem>
                  <SelectItem value="medium" className="text-popover-foreground hover:bg-accent hover:text-accent-foreground">Medium</SelectItem>
                  <SelectItem value="hard" className="text-popover-foreground hover:bg-accent hover:text-accent-foreground">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-foreground font-medium">Category</Label>
              <Input
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="wine, geography, etc"
                data-testid="input-edit-category"
              />
            </div>
            <div>
              <Label className="text-foreground font-medium">Order #</Label>
              <Input
                type="number"
                value={editForm.orderIndex}
                onChange={(e) => setEditForm({ ...editForm, orderIndex: parseInt(e.target.value) || 1 })}
                className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                min={1}
                data-testid="input-edit-orderIndex"
              />
            </div>
          </div>
          <div>
            <Label className="text-foreground font-medium">Explanation (shown after answering)</Label>
              <Textarea
                value={editForm.explanation}
                onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
                rows={3}
                className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                data-testid="textarea-edit-explanation"
              />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-foreground font-medium">Background Image</Label>
              {editForm.backgroundImageUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => { setEditForm({ ...editForm, backgroundImageUrl: "" }); setSelectedImage(null); }}
                  data-testid="button-remove-image"
                  className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                >Remove</Button>
              )}
            </div>
            {editForm.backgroundImageUrl ? (
              <div className="relative">
                <img
                  src={editForm.backgroundImageUrl}
                  alt="Selected background"
                  className="rounded-md w-full h-40 object-cover border border-border"
                  data-testid="image-selected-preview"
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No image selected.</p>
            )}
            <div className="border border-border rounded-md p-3 space-y-3 bg-muted/50">
              <div className="flex gap-2">
                <Input
                  placeholder="Search Unsplash (e.g., Oregon coast)"
                  value={unsplashQuery}
                  onChange={(e) => setUnsplashQuery(e.target.value)}
                  data-testid="input-unsplash-query"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <Button 
                  type="button" 
                  onClick={handleUnsplashSearch} 
                  disabled={unsplashLoading} 
                  data-testid="button-unsplash-search"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {unsplashLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>
              {unsplashError && <p className="text-sm text-destructive" data-testid="error-unsplash">{unsplashError}</p>}
              {unsplashResults.length > 0 && (
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto" data-testid="grid-unsplash-results">
                  {unsplashResults.map((img, i) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => handleSelectImage(img)}
                      className={`group relative border rounded-md overflow-hidden focus:outline-none ${selectedImage?.id === img.id ? 'ring-2 ring-wine-500' : 'hover:ring-2 hover:ring-wine-300'}`}
                      data-testid={`unsplash-result-${i}`}
                    >
                      <img src={img.urls.thumb} alt={img.alt_description || img.description || 'img'} className="w-full h-16 object-cover" />
                      {selectedImage?.id === img.id && (
                        <span className="absolute inset-0 bg-wine-600/40 flex items-center justify-center text-white text-xs font-medium">Selected</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {selectedImage && (
                <p className="text-[11px] text-muted-foreground" data-testid="text-unsplash-attribution">
                  Photo by <a className="underline text-primary hover:text-primary/80" target="_blank" rel="noreferrer" href={`${selectedImage.user.links.html}?utm_source=TriviaSpark&utm_medium=referral`}>{selectedImage.user.name}</a> on <a className="underline text-primary hover:text-primary/80" target="_blank" rel="noreferrer" href={`${selectedImage.links.html}?utm_source=TriviaSpark&utm_medium=referral`}>Unsplash</a>
                </p>
              )}
            </div>
          </div>

          {/* Event Image Management Form */}
          <Card className="mt-4 border-2 border-wine-300 bg-card">
            <CardHeader className="pb-3 bg-wine-50 dark:bg-wine-900/20">
              <CardTitle className="text-sm font-medium text-wine-800 dark:text-wine-200">🖼️ Event Image Management</CardTitle>
              <p className="text-xs text-wine-600 dark:text-wine-300">Configure and manage image metadata for this question</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unsplashImageId" className="text-xs text-foreground font-medium">Unsplash Image ID</Label>
                  <Input
                    id="unsplashImageId"
                    value={eventImageForm.unsplashImageId}
                    onChange={(e) => setEventImageForm(prev => ({ ...prev, unsplashImageId: e.target.value }))}
                    placeholder="Enter Unsplash image ID"
                    className="text-xs bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sizeVariant" className="text-xs text-foreground font-medium">Size Variant</Label>
                  <Select 
                    value={eventImageForm.sizeVariant} 
                    onValueChange={(value) => setEventImageForm(prev => ({ ...prev, sizeVariant: value }))}
                  >
                    <SelectTrigger className="text-xs bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="thumb" className="text-popover-foreground hover:bg-accent hover:text-accent-foreground">Thumb</SelectItem>
                      <SelectItem value="small" className="text-popover-foreground hover:bg-accent hover:text-accent-foreground">Small</SelectItem>
                      <SelectItem value="regular" className="text-popover-foreground hover:bg-accent hover:text-accent-foreground">Regular</SelectItem>
                      <SelectItem value="full" className="text-popover-foreground hover:bg-accent hover:text-accent-foreground">Full</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usageContext" className="text-xs text-foreground font-medium">Usage Context</Label>
                  <Select 
                    value={eventImageForm.usageContext} 
                    onValueChange={(value) => setEventImageForm(prev => ({ ...prev, usageContext: value }))}
                  >
                    <SelectTrigger className="text-xs bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary">
                      <SelectValue placeholder="Select usage" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="question_background" className="text-popover-foreground hover:bg-accent hover:text-accent-foreground">Question Background</SelectItem>
                      <SelectItem value="event_banner" className="text-popover-foreground hover:bg-accent hover:text-accent-foreground">Event Banner</SelectItem>
                      <SelectItem value="category_icon" className="text-popover-foreground hover:bg-accent hover:text-accent-foreground">Category Icon</SelectItem>
                      <SelectItem value="promotional_material" className="text-popover-foreground hover:bg-accent hover:text-accent-foreground">Promotional Material</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="searchContext" className="text-xs text-foreground font-medium">Search Context</Label>
                  <Input
                    id="searchContext"
                    value={eventImageForm.searchContext}
                    onChange={(e) => setEventImageForm(prev => ({ ...prev, searchContext: e.target.value }))}
                    placeholder="Search terms used"
                    className="text-xs bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Display existing image data if available */}
              {eventImageData?.eventImage && (
                <div className="border-t pt-4">
                  <Label className="text-xs font-medium text-muted-foreground">Current Image Info</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>Created: {new Date(eventImageData.eventImage.createdAt).toLocaleString()}</div>
                    <div>Downloaded: {eventImageData.eventImage.downloadTracked ? 'Yes' : 'No'}</div>
                    {eventImageData.eventImage.attributionText && (
                      <div className="col-span-2">
                        Attribution: <a 
                          href={eventImageData.eventImage.attributionUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 hover:underline"
                        >
                          {eventImageData.eventImage.attributionText}
                        </a>
                      </div>
                    )}
                    {eventImageData.eventImage.imageUrl && (
                      <div className="col-span-2">
                        <img 
                          src={eventImageData.eventImage.thumbnailUrl || eventImageData.eventImage.imageUrl} 
                          alt="Current image" 
                          className="w-16 h-16 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedImage) {
                      setEventImageForm({
                        unsplashImageId: selectedImage.id,
                        sizeVariant: "regular",
                        usageContext: "question_background",
                        searchContext: unsplashQuery || ""
                      });
                    }
                  }}
                  disabled={!selectedImage}
                  className="text-xs border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Populate from Selected Image
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => saveEventImageMutation.mutate()}
                  disabled={saveEventImageMutation.isPending || !eventImageForm.unsplashImageId}
                  className="text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {saveEventImageMutation.isPending ? "Saving..." : "Save Image Record"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="pt-2">
            <Button
              onClick={handleSave}
              disabled={isLoading || trackingDownload}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
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
              className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </Button>
          </DialogFooter>
        </div>
      );
    }
  
      // END EditQuestionForm

  const handleStatusChange = (status: string) => {
    updateStatusMutation.mutate(status);
  };

  const handleSaveFunFacts = () => {
    // In a real app, this would save to the database
    setEditingFunFacts(false);
    toast({
      title: "Fun Facts Updated",
      description: "Event fun facts have been saved successfully.",
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
    mutationFn: async ({ question, selectedImage }: { question: Question; selectedImage?: UnsplashImage }) => {
      const requestBody: any = {
        question: question.question,
        type: question.type,
        options: question.options,
        correctAnswer: question.correctAnswer,
        difficulty: question.difficulty,
        category: question.category,
        explanation: question.explanation,
        timeLimit: question.timeLimit,
        orderIndex: question.orderIndex,
        aiGenerated: question.aiGenerated,
        backgroundImageUrl: question.backgroundImageUrl
      };

      // Add selectedImage data if provided
      if (selectedImage) {
        console.log('Adding selectedImage to request:', selectedImage);
        requestBody.selectedImage = {
          id: selectedImage.id,
          author: selectedImage.user.name,
          authorUrl: selectedImage.user.links.html,
          photoUrl: selectedImage.urls.regular,
          downloadUrl: selectedImage.links.download_location || ''
        };
        console.log('Final requestBody.selectedImage:', requestBody.selectedImage);
      } else {
        console.log('No selectedImage provided to mutation');
      }

      console.log('Sending PUT request with body:', requestBody);

      const response = await fetch(`/api/questions/${question.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
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


  if (eventLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 wine-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Brain className="text-champagne-400 h-8 w-8 animate-pulse" />
          </div>
          <p className="text-primary">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">Event not found</p>
            <Button onClick={() => setLocation("/dashboard")} data-testid="button-back-events">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
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
          <TabsList className="grid w-full grid-cols-7" data-testid="tabs-event-management">
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
                        onValueChange={(value) => {
                          setValue("eventType", value, { shouldDirty: true, shouldValidate: true });
                        }}
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
                      {errors.eventType && (
                        <p className="text-sm text-red-500 mt-1">{errors.eventType.message}</p>
                      )}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation(`/events/${eventId}/manage/trivia`)}
                      data-testid="button-full-trivia-manage"
                      className="ml-4"
                    >
                      Open Full Manager
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {questions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
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
                                  <Badge variant="outline" className="text-xs">
                                    {question.timeLimit}s
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
                                {question.explanation && (
                                  <p className="text-xs text-gray-500 line-clamp-2">{question.explanation}</p>
                                )}
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  onClick={() => setLocation(`/events/${event.id}/manage/trivia/${question.id}`)}
                                  variant="outline"
                                  size="sm"
                                  className="text-wine-600 border-wine-300 hover:bg-wine-50"
                                  data-testid={`button-edit-full-${index}`}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit with Image Form
                                </Button>
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
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Question Edit Modal */}
              <Dialog open={!!editingQuestion} onOpenChange={(open) => { if (!open) setEditingQuestion(null); }}>
                <DialogContent className="max-w-3xl bg-white dark:bg-gray-900 border-2 border-border text-foreground shadow-2xl" data-testid="dialog-edit-question">
                  {editingQuestion && (
                    <>
                      <DialogHeader className="space-y-3">
                        <DialogTitle className="text-foreground text-xl font-semibold">Edit Question</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          Modify question content, scoring, ordering, and optional background image.
                        </DialogDescription>
                      </DialogHeader>
                      <EditQuestionForm
                        question={editingQuestion}
                        onSave={(updatedQuestion, selectedImage) => updateQuestionMutation.mutate({ question: updatedQuestion, selectedImage })}
                        onCancel={() => setEditingQuestion(null)}
                        isLoading={updateQuestionMutation.isPending}
                      />
                    </>
                  )}
                </DialogContent>
              </Dialog>
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
        </Tabs>
      </div>
    </div>
  );
}

export default EventManage;