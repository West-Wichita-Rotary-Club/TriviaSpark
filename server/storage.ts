/**
 * Storage Interface and Implementation
 *
 * This file defines the storage interface and exports the storage instance.
 * Mock data has been migrated to SQLite database via scripts/seed-database.mjs
 *
 * Usage:
 * - Local Development: Uses DatabaseStorage with SQLite persistence
 * - Static Build: Data extracted from database and embedded in build
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
} from "@shared/schema";
import { DatabaseStorage } from "./database-storage";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Event methods
  getEvent(id: string): Promise<Event | undefined>;
  getEventsByHost(hostId: string): Promise<Event[]>;
  getActiveEvents(hostId: string): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined>;
  updateEventStatus(id: string, status: string): Promise<Event | undefined>;

  // Question methods
  getQuestionsByEvent(eventId: string): Promise<Question[]>;
  getQuestion(id: string): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  createQuestions(questions: InsertQuestion[]): Promise<Question[]>;
  updateQuestion(
    id: string,
    updates: Partial<Question>
  ): Promise<Question | undefined>;
  deleteQuestion(id: string): Promise<boolean>;

  // Team methods
  getTeamsByEvent(eventId: string): Promise<Team[]>;
  getTeam(id: string): Promise<Team | undefined>;
  getTeamByNameOrTable(
    eventId: string,
    nameOrTable: string | number
  ): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined>;
  deleteTeam(id: string): Promise<boolean>;

  // Participant methods
  getParticipant(id: string): Promise<Participant | undefined>;
  getParticipantByToken(token: string): Promise<Participant | undefined>;
  getParticipantsByEvent(eventId: string): Promise<Participant[]>;
  getParticipantsByTeam(teamId: string): Promise<Participant[]>;
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  updateParticipant(
    id: string,
    updates: Partial<Participant>
  ): Promise<Participant | undefined>;
  deleteParticipant(id: string): Promise<boolean>;
  switchParticipantTeam(
    participantId: string,
    newTeamId: string | null
  ): Promise<Participant | undefined>;
  lockTeamSwitching(eventId: string): Promise<void>;

  // Response methods
  getResponsesByParticipant(participantId: string): Promise<Response[]>;
  getResponsesByQuestion(questionId: string): Promise<Response[]>;
  createResponse(response: InsertResponse): Promise<Response>;

  // Fun Facts methods
  getFunFactsByEvent(eventId: string): Promise<FunFact[]>;
  getFunFact(id: string): Promise<FunFact | undefined>;
  createFunFact(funFact: InsertFunFact): Promise<FunFact>;
  updateFunFact(
    id: string,
    updates: Partial<FunFact>
  ): Promise<FunFact | undefined>;
  deleteFunFact(id: string): Promise<boolean>;

  // Analytics methods
  getEventStats(hostId: string): Promise<{
    totalEvents: number;
    totalParticipants: number;
    totalQuestions: number;
    averageRating: number;
  }>;
}

// Use database storage with SQLite persistence
export const storage = new DatabaseStorage();
