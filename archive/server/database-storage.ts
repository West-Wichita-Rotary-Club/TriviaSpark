/**
 * Database Storage Implementation using SQLite
 *
 * This replaces the in-memory storage with persistent SQLite storage.
 * All mock data has been migrated to the database via the seed script.
 */

import {
  type User,
  type InsertUser,
  type Event,
  type InsertEvent,
  type Question,
  type InsertQuestion,
  type Team,
  type InsertTeam,
  type Participant,
  type InsertParticipant,
  type Response,
  type InsertResponse,
  type FunFact,
  type InsertFunFact,
  users,
  events,
  questions,
  teams,
  participants,
  responses,
  funFacts,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { type IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const newUser = { ...insertUser, id };
    await db.insert(users).values(newUser);
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user!;
  }

  async updateUser(
    id: string,
    updates: Partial<User>
  ): Promise<User | undefined> {
    await db.update(users).set(updates).where(eq(users.id, id));
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  // Event methods
  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getEventsByHost(hostId: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.hostId, hostId))
      .orderBy(desc(events.createdAt));
  }

  async getActiveEvents(hostId: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(and(eq(events.hostId, hostId), eq(events.status, "active")));
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const qrCode = `trivia-${id.substring(0, 8)}`;
    const newEvent = {
      ...insertEvent,
      id,
      qrCode,
      settings:
        typeof insertEvent.settings === "string"
          ? insertEvent.settings
          : JSON.stringify(insertEvent.settings || {}),
    };
    await db.insert(events).values(newEvent);
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event!;
  }

  async updateEvent(
    id: string,
    updates: Partial<Event>
  ): Promise<Event | undefined> {
    await db.update(events).set(updates).where(eq(events.id, id));
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async updateEventStatus(
    id: string,
    status: string
  ): Promise<Event | undefined> {
    await db.update(events).set({ status }).where(eq(events.id, id));
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  // Question methods
  async getQuestionsByEvent(eventId: string): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.eventId, eventId))
      .orderBy(asc(questions.orderIndex));
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = randomUUID();
    const newQuestion = {
      ...insertQuestion,
      id,
      options:
        typeof insertQuestion.options === "string"
          ? insertQuestion.options
          : JSON.stringify(insertQuestion.options || []),
    };
    await db.insert(questions).values(newQuestion);
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id));
    return question!;
  }

  async createQuestions(
    insertQuestions: InsertQuestion[]
  ): Promise<Question[]> {
    const questionsWithIds = insertQuestions.map((q, index) => ({
      ...q,
      id: randomUUID(),
      orderIndex: q.orderIndex ?? index,
      options:
        typeof q.options === "string"
          ? q.options
          : JSON.stringify(q.options || []),
    }));

    await db.insert(questions).values(questionsWithIds);

    const questionIds = questionsWithIds.map((q) => q.id);
    const createdQuestions: Question[] = [];
    for (const id of questionIds) {
      const [question] = await db
        .select()
        .from(questions)
        .where(eq(questions.id, id));
      if (question) createdQuestions.push(question);
    }
    return createdQuestions;
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id));
    return question;
  }

  async updateQuestion(
    id: string,
    updates: Partial<Question>
  ): Promise<Question | undefined> {
    await db.update(questions).set(updates).where(eq(questions.id, id));
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id));
    return question;
  }

  async deleteQuestion(id: string): Promise<boolean> {
    await db.delete(questions).where(eq(questions.id, id));
    return true;
  }

  // Team methods
  async getTeamsByEvent(eventId: string): Promise<Team[]> {
    return await db
      .select()
      .from(teams)
      .where(eq(teams.eventId, eventId))
      .orderBy(asc(teams.tableNumber));
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async getTeamByNameOrTable(
    eventId: string,
    nameOrTable: string | number
  ): Promise<Team | undefined> {
    const eventTeams = await this.getTeamsByEvent(eventId);
    return eventTeams.find(
      (team) =>
        team.name.toLowerCase() === String(nameOrTable).toLowerCase() ||
        team.tableNumber === Number(nameOrTable)
    );
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = randomUUID();
    const newTeam = { ...insertTeam, id };
    await db.insert(teams).values(newTeam);
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team!;
  }

  async updateTeam(
    id: string,
    updates: Partial<Team>
  ): Promise<Team | undefined> {
    await db.update(teams).set(updates).where(eq(teams.id, id));
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async deleteTeam(id: string): Promise<boolean> {
    // Don't delete if there are participants
    const teamParticipants = await this.getParticipantsByTeam(id);
    if (teamParticipants.length > 0) return false;

    const result = await db.delete(teams).where(eq(teams.id, id));
    return true;
  }

  // Participant methods
  async getParticipant(id: string): Promise<Participant | undefined> {
    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.id, id));
    return participant;
  }

  async getParticipantByToken(token: string): Promise<Participant | undefined> {
    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.participantToken, token));
    return participant;
  }

  async getParticipantsByEvent(eventId: string): Promise<Participant[]> {
    return await db
      .select()
      .from(participants)
      .where(eq(participants.eventId, eventId));
  }

  async getParticipantsByTeam(teamId: string): Promise<Participant[]> {
    return await db
      .select()
      .from(participants)
      .where(eq(participants.teamId, teamId));
  }

  async createParticipant(
    insertParticipant: InsertParticipant
  ): Promise<Participant> {
    const id = randomUUID();
    const participantToken = randomUUID();
    const newParticipant = { ...insertParticipant, id, participantToken };
    await db.insert(participants).values(newParticipant);
    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.id, id));
    return participant!;
  }

  async updateParticipant(
    id: string,
    updates: Partial<Participant>
  ): Promise<Participant | undefined> {
    const updateData = { ...updates, lastActiveAt: new Date() };
    await db
      .update(participants)
      .set(updateData)
      .where(eq(participants.id, id));
    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.id, id));
    return participant;
  }

  async deleteParticipant(id: string): Promise<boolean> {
    await db.delete(participants).where(eq(participants.id, id));
    return true;
  }

  async switchParticipantTeam(
    participantId: string,
    newTeamId: string | null
  ): Promise<Participant | undefined> {
    const participant = await this.getParticipant(participantId);
    if (!participant || !participant.canSwitchTeam) return undefined;

    // Check team capacity if joining a team
    if (newTeamId) {
      const team = await this.getTeam(newTeamId);
      if (!team) return undefined;

      const teamMembers = await this.getParticipantsByTeam(newTeamId);
      if (teamMembers.length >= (team.maxMembers || 6)) return undefined;
    }

    return this.updateParticipant(participantId, { teamId: newTeamId });
  }

  async lockTeamSwitching(eventId: string): Promise<void> {
    await db
      .update(participants)
      .set({ canSwitchTeam: false })
      .where(eq(participants.eventId, eventId));
  }

  // Response methods
  async getResponsesByParticipant(participantId: string): Promise<Response[]> {
    return await db
      .select()
      .from(responses)
      .where(eq(responses.participantId, participantId));
  }

  async getResponsesByQuestion(questionId: string): Promise<Response[]> {
    return await db
      .select()
      .from(responses)
      .where(eq(responses.questionId, questionId));
  }

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const id = randomUUID();
    const newResponse = { ...insertResponse, id };
    await db.insert(responses).values(newResponse);
    const [response] = await db
      .select()
      .from(responses)
      .where(eq(responses.id, id));
    return response!;
  }

  // Fun Facts methods
  async getFunFactsByEvent(eventId: string): Promise<FunFact[]> {
    return await db
      .select()
      .from(funFacts)
      .where(and(eq(funFacts.eventId, eventId), eq(funFacts.isActive, true)))
      .orderBy(asc(funFacts.orderIndex));
  }

  async getFunFact(id: string): Promise<FunFact | undefined> {
    const [funFact] = await db
      .select()
      .from(funFacts)
      .where(eq(funFacts.id, id));
    return funFact;
  }

  async createFunFact(insertFunFact: InsertFunFact): Promise<FunFact> {
    const id = randomUUID();
    const newFunFact = { ...insertFunFact, id };
    await db.insert(funFacts).values(newFunFact);
    const [funFact] = await db
      .select()
      .from(funFacts)
      .where(eq(funFacts.id, id));
    return funFact!;
  }

  async updateFunFact(
    id: string,
    updates: Partial<FunFact>
  ): Promise<FunFact | undefined> {
    await db.update(funFacts).set(updates).where(eq(funFacts.id, id));
    const [funFact] = await db
      .select()
      .from(funFacts)
      .where(eq(funFacts.id, id));
    return funFact;
  }

  async deleteFunFact(id: string): Promise<boolean> {
    await db.delete(funFacts).where(eq(funFacts.id, id));
    return true;
  }

  // Analytics methods
  async getEventStats(hostId: string): Promise<{
    totalEvents: number;
    totalParticipants: number;
    totalQuestions: number;
    averageRating: number;
  }> {
    const userEvents = await this.getEventsByHost(hostId);
    const totalEvents = userEvents.length;

    let totalParticipants = 0;
    let totalQuestions = 0;

    for (const event of userEvents) {
      const eventParticipants = await this.getParticipantsByEvent(event.id);
      totalParticipants += eventParticipants.length;

      const eventQuestions = await this.getQuestionsByEvent(event.id);
      totalQuestions += eventQuestions.filter((q) => q.aiGenerated).length;
    }

    // Mock average rating for now
    const averageRating = 4.9;

    return {
      totalEvents,
      totalParticipants,
      totalQuestions,
      averageRating,
    };
  }
}
