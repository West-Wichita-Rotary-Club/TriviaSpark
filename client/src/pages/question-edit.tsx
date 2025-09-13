import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Search, Eye, X, Download } from 'lucide-react';

// Types
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
  questionType?: string;
}

interface UnsplashImage {
  id: string;
  description?: string;
  alt_description?: string;
  urls: { thumb: string; small: string; regular: string; full: string };
  links: { html: string; download_location?: string };
  user: { name: string; links: { html: string } };
}

interface QuestionEditProps {
  eventId: string;
  questionId: string;
}

interface QuestionFormData {
  question: string;
  correctAnswer: string;
  options: string[];
  points: number;
  timeLimit: number;
  difficulty: string;
  category: string;
  explanation: string;
  orderIndex: number;
  backgroundImageUrl: string;
  questionType: string;
}

const QuestionEdit: React.FC<QuestionEditProps> = ({ eventId, questionId }) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state management
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<QuestionFormData>({
    defaultValues: {
      questionType: 'game'
    }
  });

  // Local state
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [unsplashQuery, setUnsplashQuery] = useState('');
  const [unsplashResults, setUnsplashResults] = useState<UnsplashImage[]>([]);
  const [unsplashLoading, setUnsplashLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Event image form state
  const [eventImageForm, setEventImageForm] = useState({
    unsplashImageId: '',
    sizeVariant: 'regular' as string,
    usageContext: 'question_background' as string,
    searchContext: ''
  });

  // Fetch all questions for the event and find the specific question
  const { data: questions, isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: ['/api/events', eventId, 'questions'],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/questions`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch questions');
      return res.json();
    },
    enabled: !!eventId
  });

  // Find the specific question from the list
  const question = questions?.find(q => q.id === questionId);

  // Fetch event image data
  const { data: eventImageData, refetch: refetchEventImage } = useQuery({
    queryKey: ['/api/questions', questionId, 'eventimage'],
    queryFn: async () => {
      const res = await fetch(`/api/questions/${questionId}/eventimage`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch event image');
      return res.json();
    },
    enabled: !!questionId
  });

  // Update form when question data loads
  useEffect(() => {
    if (question) {
      setValue('question', question.question);
      setValue('correctAnswer', question.correctAnswer);
      setValue('points', question.points);
      setValue('timeLimit', question.timeLimit);
      setValue('difficulty', question.difficulty);
      setValue('category', question.category);
      setValue('explanation', question.explanation || '');
      setValue('orderIndex', question.orderIndex);
      setValue('backgroundImageUrl', question.backgroundImageUrl || '');
      setValue('questionType', question.questionType || 'game');
      setOptions(question.options || ['', '', '', '']);
    }
  }, [question, setValue]);

  // Update event image form when data loads
  useEffect(() => {
    if (eventImageData?.eventImage) {
      const img = eventImageData.eventImage;
      setEventImageForm({
        unsplashImageId: img.unsplashImageId || '',
        sizeVariant: img.sizeVariant || 'regular',
        usageContext: img.usageContext || 'question_background',
        searchContext: img.searchContext || ''
      });
    }
  }, [eventImageData]);

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async (formData: QuestionFormData) => {
      const updateData = {
        Question: formData.question,
        Type: question?.type || 'multiple_choice',
        Options: options.filter(o => o.trim() !== ''),
        CorrectAnswer: formData.correctAnswer,
        Difficulty: formData.difficulty,
        Category: formData.category,
        Explanation: formData.explanation,
        TimeLimit: formData.timeLimit,
        OrderIndex: formData.orderIndex,
        AiGenerated: question?.aiGenerated,
        BackgroundImageUrl: formData.backgroundImageUrl || null,
        SelectedImage: selectedImage ? {
          Id: selectedImage.id,
          Author: selectedImage.user.name,
          AuthorUrl: selectedImage.user.links.html,
          PhotoUrl: selectedImage.urls.regular,
          DownloadUrl: selectedImage.links.download_location || ''
        } : null,
        QuestionType: formData.questionType || 'game'
      };

      const res = await fetch(`/api/questions/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to update question');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'questions'] });
      toast({ title: 'Success', description: 'Question updated successfully' });
      setLocation(`/events/${eventId}/manage/trivia`);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update question',
        variant: 'destructive'
      });
    }
  });

  // Save event image mutation
  const saveEventImageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedImage) return;

      const payload = {
        NewUnsplashImageId: selectedImage.id,
        SizeVariant: eventImageForm.sizeVariant,
        SelectedByUserId: null // Optional field
      };

      const res = await fetch(`/api/EventImages/question/${questionId}/replace`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to save event image');
      return res.json();
    },
    onSuccess: () => {
      refetchEventImage();
      toast({ title: 'Success', description: 'Event image saved successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to save event image',
        variant: 'destructive' 
      });
    }
  });

  // Unsplash search
  const handleUnsplashSearch = async () => {
    if (!unsplashQuery.trim()) return;
    
    setUnsplashLoading(true);
    try {
      const res = await fetch(`/api/unsplash/search?query=${encodeURIComponent(unsplashQuery)}&perPage=12`);
      if (!res.ok) throw new Error('Search failed');
      
      const data = await res.json();
      setUnsplashResults(data.results || []);
    } catch (error: any) {
      toast({ 
        title: 'Search Error', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setUnsplashLoading(false);
    }
  };

  // Track download for attribution
  const trackDownload = async (image: UnsplashImage) => {
    if (!image.links.download_location) return;
    
    try {
      await fetch('/api/unsplash/track-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ downloadUrl: image.links.download_location }),
        credentials: 'include'
      });
    } catch (error) {
      // Silent fail for tracking
      console.warn('Failed to track download:', error);
    }
  };

  // Handle image selection
  const handleImageSelect = async (image: UnsplashImage) => {
    setSelectedImage(image);
    setValue('backgroundImageUrl', image.urls.regular);
    await trackDownload(image);
  };

  // Handle option updates
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Form submit handler
  const onSubmit = handleSubmit(async (formData) => {
    // Save event image if one is selected
    if (selectedImage) {
      await saveEventImageMutation.mutateAsync();
    }
    
    // Update question
    updateQuestionMutation.mutate(formData);
  });

  if (questionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-wine-600 rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading question...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Question not found</p>
          <Button onClick={() => setLocation(`/events/${eventId}/manage/trivia`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Trivia Management
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation(`/events/${eventId}/manage/trivia`)}
              className="text-wine-600 hover:text-wine-700 hover:bg-wine-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Trivia Management
            </Button>
            <h1 className="text-3xl font-bold text-wine-900">Edit Question</h1>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation(`/events/${eventId}/manage/trivia`)}
              disabled={updateQuestionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={updateQuestionMutation.isPending || !isDirty}
              className="bg-wine-600 hover:bg-wine-700"
            >
              <Save className="mr-2 h-4 w-4" />
              {updateQuestionMutation.isPending ? 'Saving...' : 'Save Question'}
            </Button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Question Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Question Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question Text */}
                <div>
                  <Label htmlFor="question" className="text-sm font-medium">
                    Question Text *
                  </Label>
                  <Textarea
                    id="question"
                    rows={4}
                    {...register('question', { required: 'Question text is required' })}
                    className="mt-1"
                    placeholder="Enter your trivia question here..."
                  />
                  {errors.question && (
                    <p className="text-red-500 text-sm mt-1">{errors.question.message}</p>
                  )}
                </div>

                {/* Multiple Choice Options */}
                {question.type === 'multiple_choice' && (
                  <div>
                    <Label className="text-sm font-medium">Answer Options</Label>
                    <div className="mt-2 space-y-3">
                      {options.map((option, index) => (
                        <div key={index} className="flex gap-3 items-center">
                          <span className="w-8 h-8 rounded bg-wine-100 flex items-center justify-center text-sm font-semibold text-wine-700">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Correct Answer */}
                <div>
                  <Label htmlFor="correctAnswer" className="text-sm font-medium">
                    Correct Answer *
                  </Label>
                  <Input
                    id="correctAnswer"
                    {...register('correctAnswer', { required: 'Correct answer is required' })}
                    className="mt-1"
                    placeholder="Enter the correct answer"
                  />
                  {errors.correctAnswer && (
                    <p className="text-red-500 text-sm mt-1">{errors.correctAnswer.message}</p>
                  )}
                </div>

                {/* Question Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="points" className="text-sm font-medium">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      min={1}
                      max={500}
                      {...register('points', { 
                        required: 'Points are required',
                        min: { value: 1, message: 'Points must be at least 1' },
                        max: { value: 500, message: 'Points cannot exceed 500' }
                      })}
                      className="mt-1"
                    />
                    {errors.points && (
                      <p className="text-red-500 text-sm mt-1">{errors.points.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="timeLimit" className="text-sm font-medium">Time Limit (seconds)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      min={5}
                      max={300}
                      {...register('timeLimit', { 
                        required: 'Time limit is required',
                        min: { value: 5, message: 'Time limit must be at least 5 seconds' },
                        max: { value: 300, message: 'Time limit cannot exceed 300 seconds' }
                      })}
                      className="mt-1"
                    />
                    {errors.timeLimit && (
                      <p className="text-red-500 text-sm mt-1">{errors.timeLimit.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="orderIndex" className="text-sm font-medium">Order #</Label>
                    <Input
                      id="orderIndex"
                      type="number"
                      min={1}
                      {...register('orderIndex', { 
                        required: 'Order index is required',
                        min: { value: 1, message: 'Order must be at least 1' }
                      })}
                      className="mt-1"
                    />
                    {errors.orderIndex && (
                      <p className="text-red-500 text-sm mt-1">{errors.orderIndex.message}</p>
                    )}
                  </div>
                </div>

                {/* Additional Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="difficulty" className="text-sm font-medium">Difficulty</Label>
                    <Select
                      value={watch('difficulty')}
                      onValueChange={(value) => setValue('difficulty', value, { shouldDirty: true })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="questionType" className="text-sm font-medium">Question Type</Label>
                    <Select
                      value={watch('questionType') || 'game'}
                      onValueChange={(value) => setValue('questionType', value, { shouldDirty: true })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="game">Game</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="tie-breaker">Tie-breaker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                    <Input
                      id="category"
                      {...register('category')}
                      className="mt-1"
                      placeholder="e.g., History, Science, Sports"
                    />
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <Label htmlFor="explanation" className="text-sm font-medium">
                    Explanation (optional)
                  </Label>
                  <Textarea
                    id="explanation"
                    rows={3}
                    {...register('explanation')}
                    className="mt-1"
                    placeholder="Provide additional context or explanation for the answer..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Image Management Sidebar */}
          <div className="space-y-6">
            {/* Current Question Image */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Question Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {question.backgroundImageUrl ? (
                  <div className="relative">
                    <img
                      src={question.backgroundImageUrl}
                      alt="Question background"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setShowImagePreview(true)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                    No image selected
                  </div>
                )}

                {/* Unsplash Search */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Search Unsplash</Label>
                  <div className="flex gap-2">
                    <Input
                      value={unsplashQuery}
                      onChange={(e) => setUnsplashQuery(e.target.value)}
                      placeholder="Search for images..."
                      onKeyDown={(e) => e.key === 'Enter' && handleUnsplashSearch()}
                    />
                    <Button
                      type="button"
                      onClick={handleUnsplashSearch}
                      disabled={unsplashLoading}
                      size="sm"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Unsplash Results */}
                {unsplashResults.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Search Results</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                      {unsplashResults.map((image) => (
                        <div
                          key={image.id}
                          className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                            selectedImage?.id === image.id
                              ? 'border-wine-500 ring-2 ring-wine-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleImageSelect(image)}
                        >
                          <img
                            src={image.urls.thumb}
                            alt={image.alt_description || image.description || 'Unsplash image'}
                            className="w-full h-24 object-cover"
                          />
                          {selectedImage?.id === image.id && (
                            <div className="absolute inset-0 bg-wine-500 bg-opacity-20 flex items-center justify-center">
                              <div className="bg-white rounded-full p-1">
                                <Download className="h-4 w-4 text-wine-600" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Image Attribution */}
                {selectedImage && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                      Photo by{' '}
                      <a
                        href={`${selectedImage.user.links.html}?utm_source=TriviaSpark&utm_medium=referral`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-wine-600 hover:text-wine-700"
                      >
                        {selectedImage.user.name}
                      </a>{' '}
                      on{' '}
                      <a
                        href={`${selectedImage.links.html}?utm_source=TriviaSpark&utm_medium=referral`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-wine-600 hover:text-wine-700"
                      >
                        Unsplash
                      </a>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Event Image Management */}
            {eventImageData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Event Image Record</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-xs space-y-2">
                    <div>
                      <Label className="text-xs font-medium">Image ID:</Label>
                      <p className="text-gray-600">{eventImageData.eventImage?.unsplashImageId || 'None'}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Size Variant:</Label>
                      <p className="text-gray-600">{eventImageData.eventImage?.sizeVariant || 'regular'}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Usage Context:</Label>
                      <p className="text-gray-600">{eventImageData.eventImage?.usageContext || 'question_background'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </form>

        {/* Image Preview Modal */}
        {showImagePreview && question.backgroundImageUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-full">
              <img
                src={question.backgroundImageUrl}
                alt="Question background preview"
                className="max-w-full max-h-full object-contain"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-4 right-4"
                onClick={() => setShowImagePreview(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionEdit;