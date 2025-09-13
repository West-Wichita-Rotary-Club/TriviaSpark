import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Save, Search } from "lucide-react";

// Types
type UnsplashImage = {
  id: string;
  description?: string;
  alt_description?: string;
  urls: { thumb: string; small: string; regular: string; full: string };
  links: { html: string; download_location?: string };
  user: { name: string; links: { html: string } };
};

interface Question {
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
}

interface EditQuestionFormProps {
  question: Question;
  onSave: (q: Question, selectedImage?: UnsplashImage) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function EditQuestionForm({ question, onSave, onCancel, isLoading }: EditQuestionFormProps) {
  const { toast } = useToast();
  const [trackingDownload, setTrackingDownload] = useState(false);
  
  // Form state
  const [editForm, setEditForm] = useState({
    question: question.question,
    correctAnswer: question.correctAnswer,
    options: question.options || [],
    points: question.points,
    timeLimit: question.timeLimit,
    difficulty: question.difficulty,
    category: question.category,
    explanation: question.explanation || "",
    orderIndex: question.orderIndex,
    backgroundImageUrl: question.backgroundImageUrl || ""
  });

  // Unsplash search state
  const [unsplashQuery, setUnsplashQuery] = useState("");
  const [unsplashResults, setUnsplashResults] = useState<UnsplashImage[]>([]);
  const [unsplashLoading, setUnsplashLoading] = useState(false);
  const [unsplashError, setUnsplashError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);

  // Query to fetch event image for this question
  const { data: eventImageData, refetch: refetchEventImage } = useQuery({
    queryKey: ["/api/eventimages/question", question.id],
    queryFn: async () => {
      const response = await fetch(`/api/eventimages/question/${question.id}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        // Return null for 404 (no image found) instead of throwing error
        if (response.status === 404) {
          return null;
        }
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

  const handleUnsplashSearch = async () => {
    if (!unsplashQuery.trim()) return;
    setUnsplashLoading(true);
    setUnsplashError(null);
    try {
      const res = await fetch(`/api/unsplash/search?query=${encodeURIComponent(unsplashQuery)}&perPage=12`);
      if (!res.ok) {
        throw new Error(`Search failed: ${res.statusText}`);
      }
      const data = await res.json();
      setUnsplashResults(data.results || []);
    } catch (e: any) {
      setUnsplashError(e.message || "Failed to search images");
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
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {editForm.options.map((option, i) => (
          <div key={i}>
            <Label className="text-foreground font-medium">Option {String.fromCharCode(65 + i)}</Label>
            <Input
              value={option}
              onChange={(e) => {
                const newOptions = [...editForm.options];
                newOptions[i] = e.target.value;
                setEditForm({ ...editForm, options: newOptions });
              }}
              className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-foreground font-medium">Correct Answer</Label>
          <Select value={editForm.correctAnswer} onValueChange={(value) => setEditForm({ ...editForm, correctAnswer: value })}>
            <SelectTrigger className="mt-1 bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {editForm.options.map((option, i) => (
                <SelectItem key={i} value={option} className="text-popover-foreground hover:bg-accent hover:text-accent-foreground">{String.fromCharCode(65 + i)}: {option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-foreground font-medium">Points</Label>
          <Input
            type="number"
            min={10}
            max={1000}
            value={editForm.points}
            onChange={(e) => setEditForm({ ...editForm, points: parseInt(e.target.value) || 100 })}
            className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <Label className="text-foreground font-medium">Time Limit (seconds)</Label>
          <Input
            type="number"
            min={10}
            max={180}
            value={editForm.timeLimit}
            onChange={(e) => setEditForm({ ...editForm, timeLimit: parseInt(e.target.value) || 30 })}
            className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-foreground font-medium">Difficulty</Label>
          <Select value={editForm.difficulty} onValueChange={(value) => setEditForm({ ...editForm, difficulty: value })}>
            <SelectTrigger className="mt-1 bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary">
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
          />
        </div>
        <div>
          <Label className="text-foreground font-medium">Order</Label>
          <Input
            type="number"
            min={1}
            value={editForm.orderIndex}
            onChange={(e) => setEditForm({ ...editForm, orderIndex: parseInt(e.target.value) || 1 })}
            className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <Label className="text-foreground font-medium">Explanation (Optional)</Label>
        <Textarea
          value={editForm.explanation}
          onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
          className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="Explain why this is the correct answer..."
        />
      </div>

      {/* Unsplash Image Search */}
      <div className="border-t pt-4">
        <Label className="text-sm font-medium text-foreground">Background Image</Label>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Search for background image..."
            value={unsplashQuery}
            onChange={(e) => setUnsplashQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleUnsplashSearch()}
            data-testid="input-unsplash-search"
            className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <Button
            type="button"
            onClick={handleUnsplashSearch}
            disabled={unsplashLoading}
            data-testid="button-unsplash-search"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Search className="h-4 w-4" />
            {unsplashLoading ? "Searching..." : "Search"}
          </Button>
        </div>
        {unsplashError && <p className="text-sm text-destructive mt-2">{unsplashError}</p>}
        {unsplashResults.length > 0 && (
          <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto mt-3" data-testid="grid-unsplash-results">
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
          <p className="text-[11px] text-muted-foreground mt-2" data-testid="text-unsplash-attribution">
            Photo by <a className="underline text-primary hover:text-primary/80" target="_blank" rel="noreferrer" href={`${selectedImage.user.links.html}?utm_source=TriviaSpark&utm_medium=referral`}>{selectedImage.user.name}</a> on <a className="underline text-primary hover:text-primary/80" target="_blank" rel="noreferrer" href={`${selectedImage.links.html}?utm_source=TriviaSpark&utm_medium=referral`}>Unsplash</a>
          </p>
        )}
      </div>

      {/* Event Image Management Form */}
      <Card className="mt-4 border-2 border-wine-300 bg-card dark:bg-card">
        <CardHeader className="pb-3 bg-wine-50/50 dark:bg-wine-900/20 border-b border-wine-200 dark:border-wine-700">
          <CardTitle className="text-sm font-medium text-wine-800 dark:text-wine-200">🖼️ Event Image Management</CardTitle>
          <p className="text-xs text-wine-600 dark:text-wine-300">Configure and manage image metadata for this question</p>
        </CardHeader>
        <CardContent className="space-y-4 bg-card/50 dark:bg-card/80">
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
