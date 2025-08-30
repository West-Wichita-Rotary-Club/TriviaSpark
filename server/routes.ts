import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openAIService } from "./openai";
import {
  eventGenerationSchema,
  questionGenerationSchema,
  insertEventSchema,
  insertParticipantSchema,
  insertTeamSchema,
  insertFunFactSchema,
  updateQuestionSchema,
  bulkQuestionSchema,
  reorderQuestionsSchema,
} from "@shared/schema";
import { z } from "zod";

// Simple session store
const sessions = new Map<string, { userId: string; expiresAt: number }>();

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function cleanupSessions() {
  const now = Date.now();
  Array.from(sessions.entries()).forEach(([sessionId, session]) => {
    if (session.expiresAt < now) {
      sessions.delete(sessionId);
    }
  });
}

// Helper function to validate session
function validateSession(req: any): {
  valid: boolean;
  session?: { userId: string; expiresAt: number };
  error?: string;
} {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) {
    return { valid: false, error: "No session cookie" };
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return { valid: false, error: "Session not found" };
  }

  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionId); // Clean up expired session
    return { valid: false, error: "Session expired" };
  }

  return { valid: true, session };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Clean up expired sessions every hour
  setInterval(cleanupSessions, 60 * 60 * 1000);

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // Add CORS middleware for API routes
  app.use("/api", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie"
    );

    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Session debugging middleware
  app.use("/api", (req, res, next) => {
    const sessionId = req.cookies.sessionId;
    if (sessionId) {
      console.log(`[${req.method} ${req.path}] Session ID: ${sessionId}`);
      const session = sessions.get(sessionId);
      if (session) {
        console.log(
          `[${req.method} ${req.path}] Session valid, user: ${session.userId}`
        );
      } else {
        console.log(`[${req.method} ${req.path}] Session not found in store`);
      }
    } else {
      console.log(`[${req.method} ${req.path}] No session cookie`);
    }
    console.log(`[${req.method} ${req.path}] All cookies:`, req.cookies);
    next();
  });
  // Get dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const sessionCheck = validateSession(req);

      if (!sessionCheck.valid || !sessionCheck.session) {
        console.log("Session validation failed:", sessionCheck.error);
        return res.status(401).json({ error: "Not authenticated" });
      }

      const stats = await storage.getEventStats(sessionCheck.session.userId);

      // Return just the stats without OpenAI insights
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Get AI insights for dashboard stats (separate endpoint)
  app.get("/api/dashboard/insights", async (req, res) => {
    try {
      const sessionCheck = validateSession(req);

      if (!sessionCheck.valid || !sessionCheck.session) {
        console.log("Session validation failed:", sessionCheck.error);
        return res.status(401).json({ error: "Not authenticated" });
      }

      const stats = await storage.getEventStats(sessionCheck.session.userId);

      // Get AI insights
      const insights = await openAIService.generateInsights(stats);

      res.json({ insights });
    } catch (error) {
      console.error("Error generating insights:", error);
      res.status(500).json({ error: "Failed to generate insights" });
    }
  });

  // Get events for host
  app.get("/api/events", async (req, res) => {
    try {
      const sessionCheck = validateSession(req);

      if (!sessionCheck.valid || !sessionCheck.session) {
        console.log("Session validation failed:", sessionCheck.error);
        return res.status(401).json({ error: "Not authenticated" });
      }

      const events = await storage.getEventsByHost(sessionCheck.session.userId);
      console.log(
        `[DEBUG] Events for user ${sessionCheck.session.userId}:`,
        JSON.stringify(events, null, 2)
      );
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // Get active events
  app.get("/api/events/active", async (req, res) => {
    try {
      const sessionCheck = validateSession(req);

      if (!sessionCheck.valid || !sessionCheck.session) {
        console.log("Session validation failed:", sessionCheck.error);
        return res.status(401).json({ error: "Not authenticated" });
      }

      const events = await storage.getActiveEvents(sessionCheck.session.userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching active events:", error);
      res.status(500).json({ error: "Failed to fetch active events" });
    }
  });

  // Create event manually
  app.post("/api/events", async (req, res) => {
    try {
      // Get authenticated user
      const sessionId = req.cookies.sessionId;
      const session = sessionId ? sessions.get(sessionId) : null;

      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const validatedData = insertEventSchema.parse({
        ...req.body,
        hostId: session.userId,
      });

      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Invalid event data", details: error.issues });
      } else {
        res.status(500).json({ error: "Failed to create event" });
      }
    }
  });

  // Generate event with AI
  app.post("/api/events/generate", async (req, res) => {
    try {
      const validatedRequest = eventGenerationSchema.parse(req.body);

      // Generate event content with OpenAI
      const generatedContent = await openAIService.generateEvent(
        validatedRequest
      );

      // Create the event
      // Get authenticated user
      const sessionId = req.cookies.sessionId;
      const session = sessionId ? sessions.get(sessionId) : null;

      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const eventData = {
        title: generatedContent.title,
        description: generatedContent.description,
        hostId: session.userId,
        eventType: validatedRequest.eventType,
        maxParticipants: validatedRequest.participants,
        difficulty: validatedRequest.difficulty,
        settings: generatedContent.settings,
        status: "active" as const,
        eventDate: generatedContent.eventDate
          ? new Date(generatedContent.eventDate)
          : null,
        eventTime: generatedContent.eventTime || null,
        location: generatedContent.location || null,
        sponsoringOrganization: generatedContent.sponsoringOrganization || null,
      };

      const event = await storage.createEvent(eventData);

      // Create questions for the event
      const questionsWithEventId = generatedContent.questions.map((q) => ({
        ...q,
        eventId: event.id,
      }));

      const questions = await storage.createQuestions(questionsWithEventId);

      res.status(201).json({
        event,
        questions,
      });
    } catch (error) {
      console.error("Error generating event:", error);
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Invalid request data", details: error.issues });
      } else {
        res.status(500).json({ error: "Failed to generate event" });
      }
    }
  });

  // Generate questions with AI for existing events
  app.post("/api/questions/generate", async (req, res) => {
    try {
      const validatedRequest = questionGenerationSchema.parse(req.body);

      // Verify event exists
      const event = await storage.getEvent(validatedRequest.eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Get existing questions to avoid duplicates
      const existingQuestions = await storage.getQuestionsByEvent(
        validatedRequest.eventId
      );

      const questions = await openAIService.generateQuestions(
        validatedRequest,
        existingQuestions
      );

      // Store generated questions in the event
      const questionsWithEventId = questions.map((q, index) => ({
        ...q,
        eventId: validatedRequest.eventId,
        orderIndex: existingQuestions.length + index,
      }));

      const storedQuestions = await storage.createQuestions(
        questionsWithEventId
      );

      res.json({ questions: storedQuestions });
    } catch (error) {
      console.error("Error generating questions:", error);
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Invalid request data", details: error.issues });
      } else {
        res.status(500).json({ error: "Failed to generate questions" });
      }
    }
  });

  // Bulk create questions
  app.post("/api/questions/bulk", async (req, res) => {
    try {
      const sessionId = req.cookies.sessionId;
      const session = sessionId ? sessions.get(sessionId) : null;

      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { eventId, questions } = req.body;

      // Validate request data
      const validatedData = bulkQuestionSchema.parse({ eventId, questions });

      // Verify event exists and user owns it
      const event = await storage.getEvent(validatedData.eventId);
      if (!event || event.hostId !== session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Get existing questions to set proper order indices
      const existingQuestions = await storage.getQuestionsByEvent(
        validatedData.eventId
      );

      // Validate and prepare questions with proper serialization
      const questionsToInsert = validatedData.questions.map((q, index) => ({
        ...q,
        eventId: validatedData.eventId,
        orderIndex: existingQuestions.length + index,
        options: q.options ? JSON.stringify(q.options) : null,
      }));

      const storedQuestions = await storage.createQuestions(questionsToInsert);

      res.status(201).json({
        message: `Successfully created ${storedQuestions.length} questions`,
        questions: storedQuestions,
      });
    } catch (error) {
      console.error("Error bulk creating questions:", error);
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Invalid question data", details: error.issues });
      } else {
        res.status(500).json({ error: "Failed to create questions" });
      }
    }
  });

  // Reorder questions in an event
  app.put("/api/events/:id/questions/reorder", async (req, res) => {
    try {
      const sessionId = req.cookies.sessionId;
      const session = sessionId ? sessions.get(sessionId) : null;

      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const eventId = req.params.id;

      // Validate request data
      const validatedData = reorderQuestionsSchema.parse(req.body);
      const { questionOrder } = validatedData;

      // Verify event exists and user owns it
      const event = await storage.getEvent(eventId);
      if (!event || event.hostId !== session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Update order index for each question
      const updatePromises = questionOrder.map((questionId, index) =>
        storage.updateQuestion(questionId, { orderIndex: index })
      );

      await Promise.all(updatePromises);

      // Return updated questions in new order
      const updatedQuestions = await storage.getQuestionsByEvent(eventId);

      res.json({
        message: "Question order updated successfully",
        questions: updatedQuestions,
      });
    } catch (error) {
      console.error("Error reordering questions:", error);
      res.status(500).json({ error: "Failed to reorder questions" });
    }
  });

  // Start event
  app.post("/api/events/:id/start", async (req, res) => {
    try {
      const event = await storage.updateEvent(req.params.id, {
        status: "active",
        startedAt: new Date(),
      });

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      res.json(event);
    } catch (error) {
      console.error("Error starting event:", error);
      res.status(500).json({ error: "Failed to start event" });
    }
  });

  // Check for returning participant
  app.get("/api/events/join/:qrCode/check", async (req, res) => {
    try {
      const participantToken = req.cookies.participantToken;
      if (!participantToken) {
        return res.status(404).json({ error: "No participant token found" });
      }

      const existingParticipant = await storage.getParticipantByToken(
        participantToken
      );
      if (!existingParticipant) {
        return res.status(404).json({ error: "Participant not found" });
      }

      // Verify the participant belongs to this event
      const event = await storage.getEvent(existingParticipant.eventId);
      if (!event || event.qrCode !== req.params.qrCode) {
        return res
          .status(404)
          .json({ error: "Participant not found for this event" });
      }

      // Get team information if participant has a team
      let team = null;
      if (existingParticipant.teamId) {
        team = await storage.getTeam(existingParticipant.teamId);
      }

      res.json({
        participant: existingParticipant,
        team,
        event: {
          id: event.id,
          title: event.title,
          description: event.description,
          status: event.status,
        },
        returning: true,
      });
    } catch (error) {
      console.error("Error checking participant:", error);
      res.status(404).json({ error: "Participant not found" });
    }
  });

  // Join event via QR code
  app.post("/api/events/join/:qrCode", async (req, res) => {
    try {
      const { name, teamAction, teamIdentifier } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      // Skip returning participant check here - use the GET endpoint instead

      // Find event by QR code
      const events = await storage.getEventsByHost("mark-user-id");
      const event = events.find((e) => e.qrCode === req.params.qrCode);

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      if (event.status === "cancelled") {
        return res.status(400).json({ error: "Event has been cancelled" });
      }

      let teamId = null;

      // Handle team selection
      if (teamAction === "join" && teamIdentifier) {
        const team = await storage.getTeamByNameOrTable(
          event.id,
          teamIdentifier
        );
        if (!team) {
          return res.status(404).json({ error: "Team not found" });
        }

        // Check team capacity
        const teamMembers = await storage.getParticipantsByTeam(team.id);
        if (teamMembers.length >= (team.maxMembers || 6)) {
          return res.status(400).json({ error: "Team is full" });
        }

        teamId = team.id;
      } else if (teamAction === "create" && teamIdentifier) {
        // Create new team
        const existingTeam = await storage.getTeamByNameOrTable(
          event.id,
          teamIdentifier
        );
        if (existingTeam) {
          return res
            .status(400)
            .json({ error: "Team name or table number already exists" });
        }

        const isTableNumber = !isNaN(Number(teamIdentifier));
        const newTeam = await storage.createTeam({
          eventId: event.id,
          name: isTableNumber
            ? `Table ${teamIdentifier}`
            : String(teamIdentifier),
          tableNumber: isTableNumber ? Number(teamIdentifier) : null,
        });

        teamId = newTeam.id;
      }

      const participant = await storage.createParticipant({
        eventId: event.id,
        name,
        teamId,
        isActive: true,
        canSwitchTeam: event.status !== "active",
      });

      // Set participant cookie
      res.cookie("participantToken", participant.participantToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: "strict",
      });

      // Get team information if participant joined a team
      let team = null;
      if (participant.teamId) {
        team = await storage.getTeam(participant.teamId);
      }

      res.status(201).json({
        participant,
        team,
        event: {
          id: event.id,
          title: event.title,
          description: event.description,
          status: event.status,
        },
        returning: false,
      });
    } catch (error) {
      console.error("Error joining event:", error);
      res.status(500).json({ error: "Failed to join event" });
    }
  });

  // Submit answer
  app.post("/api/responses", async (req, res) => {
    try {
      const { participantId, questionId, answer, responseTime, timeRemaining } =
        req.body;

      if (!participantId || !questionId || !answer) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Get question to check answer using proper database lookup
      const question = await storage.getQuestion(questionId);

      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }

      const isCorrect =
        answer.toLowerCase().trim() ===
        (question.correctAnswer || "").toLowerCase().trim();

      // Tiered scoring system based on time remaining
      let points = 0;
      if (isCorrect && timeRemaining > 0) {
        if (timeRemaining >= 20) {
          points = 20;
        } else if (timeRemaining >= 15) {
          points = 15;
        } else if (timeRemaining >= 10) {
          points = 10;
        } else if (timeRemaining >= 5) {
          points = 5;
        } else {
          points = 1; // 1-4 seconds remaining
        }
      }

      const response = await storage.createResponse({
        participantId,
        questionId,
        answer,
        isCorrect,
        points,
        responseTime: responseTime || null,
        timeRemaining: timeRemaining || null,
      });

      res.status(201).json(response);
    } catch (error) {
      console.error("Error submitting response:", error);
      res.status(500).json({ error: "Failed to submit response" });
    }
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log("Login request received:", req.body);
      const { username, password } = req.body;

      if (!username || !password) {
        console.log("Missing username or password");
        return res
          .status(400)
          .json({ error: "Username and password are required" });
      }

      console.log("Looking up user:", username);
      const user = await storage.getUserByUsername(username);
      console.log("User found:", user ? "yes" : "no");

      if (!user || user.password !== password) {
        console.log("Invalid credentials");
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Create session
      const sessionId = generateSessionId();
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      sessions.set(sessionId, { userId: user.id, expiresAt });

      console.log("Created session:", sessionId, "for user:", user.id);

      res.cookie("sessionId", sessionId, {
        httpOnly: false, // Allow JavaScript access for development
        secure: false, // Set to false for development
        sameSite: "lax", // Compatible with secure: false
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: "/",
      });

      const responseData = {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
        },
      };

      console.log("Login successful, sending response:", responseData);
      res.json(responseData);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    const sessionId = req.cookies.sessionId;
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.clearCookie("sessionId");
    res.json({ success: true });
  });

  // Debug endpoint to test cookies
  app.get("/api/debug/cookies", (req, res) => {
    console.log("Debug cookies - Raw headers:", req.headers.cookie);
    console.log("Debug cookies - Parsed cookies:", req.cookies);
    console.log(
      "Debug cookies - Available sessions:",
      Array.from(sessions.keys())
    );
    res.json({
      rawCookies: req.headers.cookie,
      parsedCookies: req.cookies,
      sessionCount: sessions.size,
      availableSessions: Array.from(sessions.keys()),
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const sessionCheck = validateSession(req);

      if (!sessionCheck.valid || !sessionCheck.session) {
        console.log("Auth check failed:", sessionCheck.error);
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(sessionCheck.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error("Auth me error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/auth/profile", async (req, res) => {
    const sessionId = req.cookies.sessionId;
    const session = sessionId ? sessions.get(sessionId) : null;

    if (!session || session.expiresAt < Date.now()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { fullName, email, username } = req.body;

    if (!fullName || !email || !username) {
      return res
        .status(400)
        .json({ error: "Full name, email, and username are required" });
    }

    try {
      // Update user in database
      const updatedUser = await storage.updateUser(session.userId, {
        fullName,
        email,
        username,
      });

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          createdAt: updatedUser.createdAt,
        },
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Get teams for an event
  app.get("/api/events/:id/teams", async (req, res) => {
    try {
      const sessionId = req.cookies.sessionId;
      const session = sessionId ? sessions.get(sessionId) : null;

      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const eventId = req.params.id;
      const event = await storage.getEvent(eventId);

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Check if user owns this event
      if (event.hostId !== session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const teams = await storage.getTeamsByEvent(eventId);

      // Include participant count for each team
      const teamsWithCounts = await Promise.all(
        teams.map(async (team) => {
          const participants = await storage.getParticipantsByTeam(team.id);
          return {
            ...team,
            participantCount: participants.length,
            participants: participants,
          };
        })
      );

      res.json(teamsWithCounts);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  // Create team
  app.post("/api/events/:id/teams", async (req, res) => {
    try {
      const sessionId = req.cookies.sessionId;
      const session = sessionId ? sessions.get(sessionId) : null;

      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const eventId = req.params.id;
      const { name, tableNumber } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Team name is required" });
      }

      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      if (event.hostId !== session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Check for duplicate name or table number
      const existingTeam = await storage.getTeamByNameOrTable(
        eventId,
        tableNumber || name
      );
      if (existingTeam) {
        return res
          .status(400)
          .json({ error: "Team name or table number already exists" });
      }

      const team = await storage.createTeam({
        eventId,
        name,
        tableNumber: tableNumber || null,
      });

      res.status(201).json(team);
    } catch (error) {
      console.error("Error creating team:", error);
      res.status(500).json({ error: "Failed to create team" });
    }
  });

  // Switch participant team
  app.put("/api/participants/:id/team", async (req, res) => {
    try {
      const participantId = req.params.id;
      const { teamId } = req.body;

      // Check participant token
      const participantToken = req.cookies.participantToken;
      if (!participantToken) {
        return res
          .status(401)
          .json({ error: "Not authenticated as participant" });
      }

      const participant = await storage.getParticipantByToken(participantToken);
      if (!participant || participant.id !== participantId) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (!participant.canSwitchTeam) {
        return res.status(400).json({ error: "Team switching is locked" });
      }

      const updatedParticipant = await storage.switchParticipantTeam(
        participantId,
        teamId
      );
      if (!updatedParticipant) {
        return res.status(400).json({ error: "Unable to switch teams" });
      }

      res.json(updatedParticipant);
    } catch (error) {
      console.error("Error switching team:", error);
      res.status(500).json({ error: "Failed to switch team" });
    }
  });

  // Remove inactive participants from an event
  app.delete("/api/events/:id/participants/inactive", async (req, res) => {
    try {
      const sessionId = req.cookies.sessionId;
      const session = sessionId ? sessions.get(sessionId) : null;

      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const eventId = req.params.id;
      const event = await storage.getEvent(eventId);

      if (!event || event.hostId !== session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const { inactiveThresholdMinutes = 30 } = req.query;
      const thresholdTime = new Date(
        Date.now() - Number(inactiveThresholdMinutes) * 60 * 1000
      );

      // Get all participants for the event
      const participants = await storage.getParticipantsByEvent(eventId);

      // Find inactive participants (no recent activity)
      const inactiveParticipants = participants.filter(
        (participant) =>
          !participant.isActive ||
          (participant.lastActiveAt && participant.lastActiveAt < thresholdTime)
      );

      // Remove inactive participants and their responses
      let removedCount = 0;
      for (const participant of inactiveParticipants) {
        // Note: In a full implementation, you might want to soft-delete or archive responses
        // For now, we'll just remove the participant record
        const success = await storage.deleteParticipant(participant.id);
        if (success) {
          removedCount++;
        }
      }

      res.json({
        message: `Removed ${removedCount} inactive participants`,
        removedCount,
        thresholdMinutes: Number(inactiveThresholdMinutes),
        remainingParticipants: participants.length - removedCount,
      });
    } catch (error) {
      console.error("Error removing inactive participants:", error);
      res.status(500).json({ error: "Failed to remove inactive participants" });
    }
  });

  // Start event
  app.post("/api/events/:id/start", async (req, res) => {
    try {
      const sessionId = req.cookies.sessionId;
      const session = sessionId ? sessions.get(sessionId) : null;

      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const eventId = req.params.id;
      const event = await storage.getEvent(eventId);

      if (!event || event.hostId !== session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updatedEvent = await storage.updateEventStatus(eventId, "active");

      // Lock team switching once event starts
      await storage.lockTeamSwitching(eventId);

      res.json(updatedEvent);
    } catch (error) {
      console.error("Error starting event:", error);
      res.status(500).json({ error: "Failed to start event" });
    }
  });

  // Demo endpoints (no authentication required for specific demo events)
  app.get("/api/events/:id", async (req, res) => {
    try {
      const eventId = req.params.id;

      // Allow demo access for specific demo events
      if (eventId.startsWith("seed-event-")) {
        const event = await storage.getEvent(eventId);
        if (!event) {
          return res.status(404).json({ error: "Event not found" });
        }
        return res.json(event);
      }

      // Regular authentication for non-demo events
      const sessionId = req.cookies.sessionId;
      const session = sessionId ? sessions.get(sessionId) : null;

      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const event = await storage.getEvent(eventId);

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Check if user owns this event
      if (event.hostId !== session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  // Get questions for an event (demo-enabled)
  app.get("/api/events/:id/questions", async (req, res) => {
    try {
      const eventId = req.params.id;

      // Allow demo access for specific demo events
      if (eventId.startsWith("seed-event-")) {
        const event = await storage.getEvent(eventId);
        if (!event) {
          return res.status(404).json({ error: "Event not found" });
        }
        const questions = await storage.getQuestionsByEvent(eventId);
        return res.json(questions);
      }

      // Regular authentication for non-demo events
      const sessionId = req.cookies.sessionId;
      const session = sessionId ? sessions.get(sessionId) : null;

      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const event = await storage.getEvent(eventId);

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Check if user owns this event
      if (event.hostId !== session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const questions = await storage.getQuestionsByEvent(eventId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  // Get fun facts for an event (demo-enabled)
  app.get("/api/events/:id/fun-facts", async (req, res) => {
    try {
      const eventId = req.params.id;

      // Allow demo access for specific demo events
      if (eventId.startsWith("seed-event-")) {
        const event = await storage.getEvent(eventId);
        if (!event) {
          return res.status(404).json({ error: "Event not found" });
        }
        const funFacts = await storage.getFunFactsByEvent(eventId);
        return res.json(funFacts);
      }

      // Regular authentication for non-demo events
      const sessionId = req.cookies.sessionId;
      const session = sessionId ? sessions.get(sessionId) : null;

      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const event = await storage.getEvent(eventId);

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Check if user owns this event
      if (event.hostId !== session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const funFacts = await storage.getFunFactsByEvent(eventId);
      res.json(funFacts);
    } catch (error) {
      console.error("Error fetching fun facts:", error);
      res.status(500).json({ error: "Failed to fetch fun facts" });
    }
  });

  // Create fun fact for an event
  app.post("/api/events/:id/fun-facts", async (req, res) => {
    try {
      const sessionId = req.cookies.sessionId;
      const session = sessionId ? sessions.get(sessionId) : null;

      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const eventId = req.params.id;
      const event = await storage.getEvent(eventId);

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Check if user owns this event
      if (event.hostId !== session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const validatedData = insertFunFactSchema.parse({
        ...req.body,
        eventId,
      });

      const funFact = await storage.createFunFact(validatedData);
      res.status(201).json(funFact);
    } catch (error) {
      console.error("Error creating fun fact:", error);
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Invalid fun fact data", details: error.issues });
      } else {
        res.status(500).json({ error: "Failed to create fun fact" });
      }
    }
  });

  // Update fun fact
  app.put("/api/fun-facts/:id", async (req, res) => {
    try {
      const sessionId = req.cookies.sessionId;
      const session = sessionId ? sessions.get(sessionId) : null;

      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const funFactId = req.params.id;

      // Get fun fact to verify ownership through event
      const funFact = await storage.getFunFact(funFactId);
      if (!funFact) {
        return res.status(404).json({ error: "Fun fact not found" });
      }

      // Verify user owns the event this fun fact belongs to
      const event = await storage.getEvent(funFact.eventId);
      if (!event || event.hostId !== session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updatedFunFact = await storage.updateFunFact(funFactId, req.body);
      res.json(updatedFunFact);
    } catch (error) {
      console.error("Error updating fun fact:", error);
      res.status(500).json({ error: "Failed to update fun fact" });
    }
  });

  // Delete fun fact
  app.delete("/api/fun-facts/:id", async (req, res) => {
    try {
      const sessionId = req.cookies.sessionId;
      const session = sessionId ? sessions.get(sessionId) : null;

      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const funFactId = req.params.id;

      // Get fun fact to verify ownership through event
      const funFact = await storage.getFunFact(funFactId);
      if (!funFact) {
        return res.status(404).json({ error: "Fun fact not found" });
      }

      // Verify user owns the event this fun fact belongs to
      const event = await storage.getEvent(funFact.eventId);
      if (!event || event.hostId !== session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      await storage.deleteFunFact(funFactId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting fun fact:", error);
      res.status(500).json({ error: "Failed to delete fun fact" });
    }
  });

  // Update event
  app.put("/api/events/:id", async (req, res) => {
    try {
      const sessionId = req.cookies.sessionId;
      const session = sessionId ? sessions.get(sessionId) : null;

      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const eventId = req.params.id;
      const event = await storage.getEvent(eventId);

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Check if user owns this event
      if (event.hostId !== session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updatedEvent = await storage.updateEvent(eventId, req.body);
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  // Get participants for an event
  app.get("/api/events/:id/participants", async (req, res) => {
    try {
      const sessionId = req.cookies.sessionId;
      const session = sessionId ? sessions.get(sessionId) : null;

      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const eventId = req.params.id;
      const event = await storage.getEvent(eventId);

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Check if user owns this event
      if (event.hostId !== session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const participants = await storage.getParticipantsByEvent(eventId);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({ error: "Failed to fetch participants" });
    }
  });

  // Update event status
  app.patch("/api/events/:id/status", async (req, res) => {
    try {
      const sessionId = req.cookies.sessionId;
      const session = sessionId ? sessions.get(sessionId) : null;

      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const eventId = req.params.id;
      const { status } = req.body;

      if (!eventId || !status) {
        return res
          .status(400)
          .json({ error: "Event ID and status are required" });
      }

      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Check if user owns this event
      if (event.hostId !== session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updatedEvent = await storage.updateEventStatus(eventId, status);
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating event status:", error);
      res.status(500).json({ error: "Failed to update event status" });
    }
  });

  // Get questions for an event
  // Update a question
  app.put("/api/questions/:id", async (req, res) => {
    try {
      const sessionId = req.cookies.sessionId;
      const session = sessionId ? sessions.get(sessionId) : null;

      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const questionId = req.params.id;
      const question = await storage.getQuestion(questionId);

      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }

      // Verify user owns the event this question belongs to
      const event = await storage.getEvent(question.eventId);
      if (!event || event.hostId !== session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Validate update data
      const validatedData = updateQuestionSchema.parse(req.body);

      // Handle options serialization if provided
      const updateData = {
        ...validatedData,
        options: validatedData.options
          ? JSON.stringify(validatedData.options)
          : undefined,
      };

      const updatedQuestion = await storage.updateQuestion(
        questionId,
        updateData
      );
      res.json(updatedQuestion);
    } catch (error) {
      console.error("Error updating question:", error);
      res.status(500).json({ error: "Failed to update question" });
    }
  });

  // Get teams publicly (for participant joining)
  app.get("/api/events/:qrCode/teams-public", async (req, res) => {
    try {
      const qrCode = req.params.qrCode;

      // Find event by QR code
      const events = await storage.getEventsByHost("mark-user-id");
      const event = events.find((e) => e.qrCode === qrCode);

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      const teams = await storage.getTeamsByEvent(event.id);

      // Include participant count for each team
      const teamsWithCounts = await Promise.all(
        teams.map(async (team) => {
          const participants = await storage.getParticipantsByTeam(team.id);
          return {
            ...team,
            participantCount: participants.length,
          };
        })
      );

      res.json(teamsWithCounts);
    } catch (error) {
      console.error("Error fetching public teams:", error);
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  // Delete a question
  app.delete("/api/questions/:id", async (req, res) => {
    try {
      const sessionId = req.cookies.sessionId;
      const session = sessionId ? sessions.get(sessionId) : null;

      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const questionId = req.params.id;
      const question = await storage.getQuestion(questionId);

      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }

      // Verify user owns the event this question belongs to
      const event = await storage.getEvent(question.eventId);
      if (!event || event.hostId !== session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      await storage.deleteQuestion(questionId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ error: "Failed to delete question" });
    }
  });

  // Get event analytics
  app.get("/api/events/:id/analytics", async (req, res) => {
    try {
      const sessionId = req.cookies.sessionId;
      const session = sessionId ? sessions.get(sessionId) : null;

      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const eventId = req.params.id;
      const event = await storage.getEvent(eventId);

      if (!event || event.hostId !== session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Get comprehensive analytics
      const participants = await storage.getParticipantsByEvent(eventId);
      const teams = await storage.getTeamsByEvent(eventId);
      const questions = await storage.getQuestionsByEvent(eventId);

      // Calculate response rates and scores
      let totalResponses = 0;
      let correctResponses = 0;
      let totalPoints = 0;
      const questionPerformance = [];

      for (const question of questions) {
        const responses = await storage.getResponsesByQuestion(question.id);
        const correctCount = responses.filter((r) => r.isCorrect).length;
        const avgPoints =
          responses.length > 0
            ? responses.reduce((sum, r) => sum + (r.points || 0), 0) /
              responses.length
            : 0;

        questionPerformance.push({
          id: question.id,
          question: question.question,
          totalResponses: responses.length,
          correctResponses: correctCount,
          accuracy:
            responses.length > 0 ? (correctCount / responses.length) * 100 : 0,
          averagePoints: avgPoints,
          difficulty: question.difficulty,
        });

        totalResponses += responses.length;
        correctResponses += correctCount;
        totalPoints += responses.reduce((sum, r) => sum + (r.points || 0), 0);
      }

      // Calculate team performance
      const teamPerformance = [];
      for (const team of teams) {
        const teamParticipants = await storage.getParticipantsByTeam(team.id);
        let teamPoints = 0;
        let teamResponses = 0;

        for (const participant of teamParticipants) {
          const responses = await storage.getResponsesByParticipant(
            participant.id
          );
          teamPoints += responses.reduce((sum, r) => sum + (r.points || 0), 0);
          teamResponses += responses.length;
        }

        teamPerformance.push({
          id: team.id,
          name: team.name,
          participantCount: teamParticipants.length,
          totalPoints: teamPoints,
          totalResponses: teamResponses,
          averagePointsPerParticipant:
            teamParticipants.length > 0
              ? teamPoints / teamParticipants.length
              : 0,
        });
      }

      // Sort teams by performance
      teamPerformance.sort((a, b) => b.totalPoints - a.totalPoints);

      const analytics = {
        event: {
          id: event.id,
          title: event.title,
          status: event.status,
          participantCount: participants.length,
          teamCount: teams.length,
          questionCount: questions.length,
        },
        performance: {
          totalResponses,
          correctResponses,
          overallAccuracy:
            totalResponses > 0 ? (correctResponses / totalResponses) * 100 : 0,
          totalPoints,
          averagePointsPerResponse:
            totalResponses > 0 ? totalPoints / totalResponses : 0,
        },
        questionPerformance,
        teamPerformance,
      };

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching event analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Get event leaderboard
  app.get("/api/events/:id/leaderboard", async (req, res) => {
    try {
      const sessionId = req.cookies.sessionId;
      const session = sessionId ? sessions.get(sessionId) : null;

      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const eventId = req.params.id;
      const event = await storage.getEvent(eventId);

      if (!event || event.hostId !== session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const { type = "teams" } = req.query;

      if (type === "teams") {
        // Team leaderboard
        const teams = await storage.getTeamsByEvent(eventId);
        const teamScores = [];

        for (const team of teams) {
          const teamParticipants = await storage.getParticipantsByTeam(team.id);
          let totalPoints = 0;
          let totalResponses = 0;
          let correctResponses = 0;

          for (const participant of teamParticipants) {
            const responses = await storage.getResponsesByParticipant(
              participant.id
            );
            totalPoints += responses.reduce(
              (sum, r) => sum + (r.points || 0),
              0
            );
            totalResponses += responses.length;
            correctResponses += responses.filter((r) => r.isCorrect).length;
          }

          teamScores.push({
            rank: 0, // Will be set after sorting
            team: {
              id: team.id,
              name: team.name,
              tableNumber: team.tableNumber,
            },
            participantCount: teamParticipants.length,
            totalPoints,
            totalResponses,
            correctResponses,
            accuracy:
              totalResponses > 0
                ? (correctResponses / totalResponses) * 100
                : 0,
            averagePointsPerParticipant:
              teamParticipants.length > 0
                ? totalPoints / teamParticipants.length
                : 0,
          });
        }

        // Sort by total points descending
        teamScores.sort((a, b) => b.totalPoints - a.totalPoints);

        // Assign ranks
        teamScores.forEach((team, index) => {
          team.rank = index + 1;
        });

        res.json({ type: "teams", leaderboard: teamScores });
      } else {
        // Individual participant leaderboard
        const participants = await storage.getParticipantsByEvent(eventId);
        const participantScores = [];

        for (const participant of participants) {
          const responses = await storage.getResponsesByParticipant(
            participant.id
          );
          const totalPoints = responses.reduce(
            (sum, r) => sum + (r.points || 0),
            0
          );
          const correctResponses = responses.filter((r) => r.isCorrect).length;

          // Get team info if participant has one
          let team = null;
          if (participant.teamId) {
            team = await storage.getTeam(participant.teamId);
          }

          participantScores.push({
            rank: 0, // Will be set after sorting
            participant: {
              id: participant.id,
              name: participant.name,
            },
            team: team ? { id: team.id, name: team.name } : null,
            totalPoints,
            totalResponses: responses.length,
            correctResponses,
            accuracy:
              responses.length > 0
                ? (correctResponses / responses.length) * 100
                : 0,
          });
        }

        // Sort by total points descending
        participantScores.sort((a, b) => b.totalPoints - a.totalPoints);

        // Assign ranks
        participantScores.forEach((participant, index) => {
          participant.rank = index + 1;
        });

        res.json({ type: "participants", leaderboard: participantScores });
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Get question response summary
  app.get("/api/events/:id/responses/summary", async (req, res) => {
    try {
      const sessionId = req.cookies.sessionId;
      const session = sessionId ? sessions.get(sessionId) : null;

      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const eventId = req.params.id;
      const event = await storage.getEvent(eventId);

      if (!event || event.hostId !== session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const questions = await storage.getQuestionsByEvent(eventId);
      const summary = [];

      for (const question of questions) {
        const responses = await storage.getResponsesByQuestion(question.id);

        // Count responses by answer
        const answerDistribution: Record<string, number> = {};
        let totalPoints = 0;
        let fastestResponseTime: number | null = null;
        let slowestResponseTime: number | null = null;

        responses.forEach((response) => {
          const answer = response.answer || "No Answer";
          answerDistribution[answer] = (answerDistribution[answer] || 0) + 1;
          totalPoints += response.points || 0;

          if (response.responseTime) {
            if (
              fastestResponseTime === null ||
              response.responseTime < fastestResponseTime
            ) {
              fastestResponseTime = response.responseTime;
            }
            if (
              slowestResponseTime === null ||
              response.responseTime > slowestResponseTime
            ) {
              slowestResponseTime = response.responseTime;
            }
          }
        });

        const correctCount = responses.filter((r) => r.isCorrect).length;

        summary.push({
          question: {
            id: question.id,
            text: question.question,
            correctAnswer: question.correctAnswer,
            type: question.type,
            difficulty: question.difficulty,
            orderIndex: question.orderIndex,
          },
          responses: {
            total: responses.length,
            correct: correctCount,
            incorrect: responses.length - correctCount,
            accuracy:
              responses.length > 0
                ? (correctCount / responses.length) * 100
                : 0,
          },
          scoring: {
            totalPoints,
            averagePoints:
              responses.length > 0 ? totalPoints / responses.length : 0,
            maxPossiblePoints: responses.length * 20, // Assuming max 20 points per question
          },
          timing: {
            fastestResponseTime,
            slowestResponseTime,
            averageResponseTime:
              responses.length > 0 && responses.some((r) => r.responseTime)
                ? responses
                    .filter((r) => r.responseTime)
                    .reduce((sum, r) => sum + r.responseTime!, 0) /
                  responses.filter((r) => r.responseTime).length
                : null,
          },
          answerDistribution,
        });
      }

      res.json({ eventId, summary });
    } catch (error) {
      console.error("Error fetching response summary:", error);
      res.status(500).json({ error: "Failed to fetch response summary" });
    }
  });

  // Generate AI event copy
  app.post("/api/events/:id/generate-copy", async (req, res) => {
    try {
      const { type } = req.body;
      const eventId = req.params.id;

      if (!eventId) {
        return res.status(400).json({ error: "Event ID is required" });
      }

      // Get event details from storage
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      let prompt = "";

      switch (type) {
        case "promotional":
          prompt = `Generate exciting promotional copy for a trivia event:
          Title: ${event.title}
          Type: ${event.eventType}
          Description: ${event.description || "Fun trivia event"}
          Location: ${event.location || "TBD"}
          Max Participants: ${event.maxParticipants}
          
          Create engaging promotional copy to attract participants. Include excitement about the event, what to expect, and why people should join. Make it sound fun and irresistible.`;
          break;

        case "welcome":
          prompt = `Generate a warm welcome message for trivia event participants:
          Title: ${event.title}
          Type: ${event.eventType}
          
          Create a friendly welcome message that participants will see when they join the event. Make them feel excited and welcome.`;
          break;

        case "thankyou":
          prompt = `Generate a thank you message for trivia event completion:
          Title: ${event.title}
          Type: ${event.eventType}
          
          Create a gracious thank you message that participants will see after completing the trivia event. Express appreciation for their participation.`;
          break;

        case "rules":
          prompt = `Generate clear, friendly event rules for a trivia event:
          Title: ${event.title}
          Type: ${event.eventType}
          Max Participants: ${event.maxParticipants}
          
          Create simple, easy-to-understand rules that explain how the trivia works, scoring, and any important guidelines.`;
          break;

        default:
          prompt = `Generate a detailed event description for:
          Title: ${event.title}
          Type: ${event.eventType}
          Description: ${event.description || "Fun trivia event"}
          
          Create a detailed event description that explains what participants can expect, the format, and any special features.`;
      }

      const generatedCopy = await openAIService.generateCopy(prompt);

      res.json({
        type,
        copy: generatedCopy,
        eventId,
      });
    } catch (error) {
      console.error("Error generating AI copy:", error);
      res.status(500).json({ error: "Failed to generate copy" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
