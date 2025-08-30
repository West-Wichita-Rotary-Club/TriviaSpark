import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  blob,
  real,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  hostId: text("host_id")
    .notNull()
    .references(() => users.id),
  eventType: text("event_type").notNull(), // wine_dinner, corporate, party, educational, fundraiser
  maxParticipants: integer("max_participants").default(50),
  difficulty: text("difficulty").default("mixed"), // easy, medium, hard, mixed
  status: text("status").default("draft"), // draft, active, completed, cancelled
  qrCode: text("qr_code"),
  eventDate: integer("event_date", { mode: "timestamp" }),
  eventTime: text("event_time"),
  location: text("location"),
  sponsoringOrganization: text("sponsoring_organization"),

  // Rich content and branding
  logoUrl: text("logo_url"),
  backgroundImageUrl: text("background_image_url"),
  eventCopy: text("event_copy"), // AI-generated promotional description
  welcomeMessage: text("welcome_message"), // Custom welcome message for participants
  thankYouMessage: text("thank_you_message"), // Message shown after event completion

  // Theme and styling
  primaryColor: text("primary_color").default("#7C2D12"), // wine color
  secondaryColor: text("secondary_color").default("#FEF3C7"), // champagne color
  fontFamily: text("font_family").default("Inter"),

  // Contact and social
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  websiteUrl: text("website_url"),
  socialLinks: text("social_links"), // JSON string of social media links

  // Event details
  prizeInformation: text("prize_information"),
  eventRules: text("event_rules"),
  specialInstructions: text("special_instructions"),
  accessibilityInfo: text("accessibility_info"),
  dietaryAccommodations: text("dietary_accommodations"),
  dressCode: text("dress_code"),
  ageRestrictions: text("age_restrictions"),
  technicalRequirements: text("technical_requirements"),

  // Business information
  registrationDeadline: integer("registration_deadline", { mode: "timestamp" }),
  cancellationPolicy: text("cancellation_policy"),
  refundPolicy: text("refund_policy"),
  sponsorInformation: text("sponsor_information"), // JSON string of sponsor details

  settings: text("settings").default("{}"), // JSON string for theme, timing, etc.
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  startedAt: integer("started_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id),
  type: text("type").notNull(), // multiple_choice, true_false, fill_blank, image
  question: text("question").notNull(),
  options: text("options").default("[]"), // JSON string of answer options
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"), // Explanation of the correct answer
  points: integer("points").default(100),
  timeLimit: integer("time_limit").default(30), // seconds
  difficulty: text("difficulty").default("medium"),
  category: text("category"),
  backgroundImageUrl: text("background_image_url"), // Unsplash or other background image
  aiGenerated: integer("ai_generated", { mode: "boolean" }).default(false),
  orderIndex: integer("order_index").default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const teams = sqliteTable("teams", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id),
  name: text("name").notNull(),
  tableNumber: integer("table_number"),
  maxMembers: integer("max_members").default(6),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const participants = sqliteTable("participants", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id),
  teamId: text("team_id").references(() => teams.id),
  name: text("name").notNull(),
  participantToken: text("participant_token").notNull().unique(), // For cookie-based auth
  joinedAt: integer("joined_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  lastActiveAt: integer("last_active_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  canSwitchTeam: integer("can_switch_team", { mode: "boolean" }).default(true),
});

export const responses = sqliteTable("responses", {
  id: text("id").primaryKey(),
  participantId: text("participant_id")
    .notNull()
    .references(() => participants.id),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id),
  answer: text("answer").notNull(),
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
  points: integer("points").default(0),
  responseTime: integer("response_time"), // seconds taken to answer
  timeRemaining: integer("time_remaining"), // seconds remaining when locked
  submittedAt: integer("submitted_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const funFacts = sqliteTable("fun_facts", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  orderIndex: integer("order_index").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  qrCode: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
});

export const insertParticipantSchema = createInsertSchema(participants).omit({
  id: true,
  participantToken: true,
});

export const insertResponseSchema = createInsertSchema(responses).omit({
  id: true,
});

export const insertFunFactSchema = createInsertSchema(funFacts).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Participant = typeof participants.$inferSelect;
export type Response = typeof responses.$inferSelect;
export type FunFact = typeof funFacts.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type InsertFunFact = z.infer<typeof insertFunFactSchema>;

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
