import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { HelpCircle, Plus, Upload } from "lucide-react";
import { questionGenerationSchema, type QuestionGenerationRequest } from "@shared/schema";
import { z } from "zod";

// Create a form schema that matches React Hook Form expectations
const formSchema = questionGenerationSchema.extend({
  count: z.number().min(1).max(20), // Remove default for form validation
  // Ensure questionType remains optional in form; provide fallback at submit time
  questionType: z.enum(["game", "training", "tie-breaker"]).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function QuestionGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);

  // Fetch events for selection
  const { data: events } = useQuery<any[]>({
    queryKey: ["/api/events"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventId: "",
      topic: "",
      type: "multiple_choice",
      difficulty: "medium",
      count: 1,
      questionType: "game",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  const generateQuestionsMutation = useMutation({
    mutationFn: async (data: QuestionGenerationRequest) => {
      const response = await fetch("/api/questions/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate questions");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedQuestions(data.questions);
      // Invalidate event queries to refresh question lists
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Questions Generated!",
        description: `Added ${data.questions.length} question(s) to the event.`,
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

  const onSubmit = (data: FormData) => {
    generateQuestionsMutation.mutate({
      ...data,
      questionType: data.questionType || "game",
    });
  };

  return (
    <Card className="trivia-card overflow-hidden" data-testid="card-question-generator">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <HelpCircle className="text-champagne-600 text-xl mr-3" />
            <CardTitle className="text-lg" data-testid="text-question-generator-title">
              AI Question Generator
            </CardTitle>
          </div>
          <Badge variant="secondary" data-testid="badge-beta">Beta</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="eventId" data-testid="label-event">Select Event</Label>
              <Select onValueChange={(value) => setValue("eventId", value)} data-testid="select-event">
                <SelectTrigger className={errors.eventId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Choose an event to add questions to" />
                </SelectTrigger>
                <SelectContent>
                  {events?.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title} ({event.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.eventId && (
                <p className="text-sm text-red-500 mt-1" data-testid="error-event">
                  {errors.eventId.message}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="topic" data-testid="label-topic">Topic</Label>
              <Input
                id="topic"
                {...register("topic")}
                placeholder="French Wine Regions"
                className={errors.topic ? "border-red-500" : "focus:ring-2 focus:ring-wine-500 focus:border-transparent"}
                data-testid="input-topic"
              />
              {errors.topic && (
                <p className="text-sm text-red-500 mt-1" data-testid="error-topic">
                  {errors.topic.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="type" data-testid="label-question-type">Question Type</Label>
              <Select onValueChange={(value) => setValue("type", value as any)} defaultValue="multiple_choice">
                <SelectTrigger data-testid="select-question-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="questionType">Classification</Label>
              <Select onValueChange={(value) => setValue("questionType", value as any)} defaultValue="game">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="game">Game</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="tie-breaker">Tie-Breaker</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={generateQuestionsMutation.isPending}
              className="flex-1 trivia-button-secondary"
              data-testid="button-generate-question"
            >
              {generateQuestionsMutation.isPending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Question
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="px-6"
              data-testid="button-upload"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </form>
        
        {/* Generated Questions Display */}
        {generatedQuestions.length > 0 && (
          <div className="mt-6 space-y-4">
            <h4 className="font-medium text-gray-900" data-testid="text-generated-questions-title">
              Generated Questions
            </h4>
            {generatedQuestions.map((question, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50" data-testid={`generated-question-${index}`}>
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-gray-900" data-testid={`text-question-${index}`}>
                    {question.question}
                  </h5>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" data-testid={`badge-type-${index}`}>
                      {question.type.replace('_', ' ')}
                    </Badge>
                    <Badge variant="secondary" data-testid={`badge-difficulty-${index}`}>
                      {question.difficulty}
                    </Badge>
                  </div>
                </div>
                
                {question.options && question.options.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {question.options.map((option: string, optionIndex: number) => (
                      <div 
                        key={optionIndex} 
                        className={`p-2 text-sm rounded border ${
                          option === question.correctAnswer 
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800' 
                            : 'border-gray-200 bg-white'
                        }`}
                        data-testid={`option-${index}-${optionIndex}`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                  <span data-testid={`text-correct-answer-${index}`}>
                    Correct: <span className="font-medium text-emerald-600">{question.correctAnswer}</span>
                  </span>
                  <span data-testid={`text-points-${index}`}>
                    {question.points} points • {question.timeLimit}s
                  </span>
                </div>
              </div>
            ))}
            
            <Button 
              onClick={() => setGeneratedQuestions([])} 
              variant="outline" 
              className="w-full"
              data-testid="button-clear-questions"
            >
              Clear Generated Questions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
