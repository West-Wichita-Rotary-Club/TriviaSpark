import { z } from "zod";

// Event generation request schema
export const eventGenerationSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  eventType: z.enum([
    "wine_dinner",
    "corporate",
    "party",
    "educational",
    "fundraiser",
  ]),
  participants: z.number().min(1).max(500),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]),
});

export type EventGenerationRequest = z.infer<typeof eventGenerationSchema>;

// Question generation request schema
export const questionGenerationSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  topic: z.string().min(1, "Topic is required"),
  type: z.enum(["multiple_choice", "true_false", "fill_blank", "image"]),
  questionType: z
    .enum(["game", "tie-breaker", "training"])
    .optional()
    .default("game"),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  category: z.string().optional(),
  count: z.number().min(1).max(20).default(1),
});

export type QuestionGenerationRequest = z.infer<
  typeof questionGenerationSchema
>;

// Question update validation schema
export const updateQuestionSchema = z.object({
  question: z
    .string()
    .min(1, "Question text is required")
    .max(500, "Question text too long"),
  type: z.enum(["multiple_choice", "true_false", "fill_blank", "image"]),
  questionType: z.enum(["game", "tie-breaker", "training"]).optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  category: z.string().optional(),
  explanation: z.string().optional(),
  timeLimit: z.number().positive().optional(),
  orderIndex: z.number().nonnegative().optional(),
  aiGenerated: z.boolean().optional(),
});

export type UpdateQuestionRequest = z.infer<typeof updateQuestionSchema>;

// Bulk question creation schema
export const bulkQuestionSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  questions: z
    .array(
      z.object({
        question: z
          .string()
          .min(1, "Question text is required")
          .max(500, "Question text too long"),
        type: z.enum(["multiple_choice", "true_false", "fill_blank", "image"]),
        questionType: z.enum(["game", "tie-breaker", "training"]).optional(),
        options: z.array(z.string()).optional(),
        correctAnswer: z.string().min(1, "Correct answer is required"),
        difficulty: z.enum(["easy", "medium", "hard"]),
        category: z.string().optional(),
        explanation: z.string().optional(),
        timeLimit: z.number().positive().optional(),
        aiGenerated: z.boolean().optional(),
      })
    )
    .min(1, "At least one question is required")
    .max(50, "Too many questions"),
});

export type BulkQuestionRequest = z.infer<typeof bulkQuestionSchema>;

// Question reorder schema
export const reorderQuestionsSchema = z.object({
  questionOrder: z
    .array(z.string())
    .min(1, "At least one question ID is required"),
});

export type ReorderQuestionsRequest = z.infer<typeof reorderQuestionsSchema>;
