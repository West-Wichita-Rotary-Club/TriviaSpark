// Fallback demo data for static build
// Last updated: 2025-09-09T22:35:51.348Z
// Using default demo data (no database found)

import { demoEvent as fallbackEvent, demoQuestions as fallbackQuestions, demoFunFacts as fallbackFunFacts } from './fallback-data';

export const demoEvent = fallbackEvent;
export const demoQuestions = fallbackQuestions;
export const demoFunFacts = fallbackFunFacts;

export const allEvents = fallbackEvent ? [fallbackEvent] : [];

export const buildInfo = {
  extractedAt: "2025-09-09T22:35:51.348Z",
  databaseUrl: "fallback",
  eventsCount: fallbackEvent ? 1 : 0,
  questionsCount: fallbackQuestions?.length || 0,
  funFactsCount: fallbackFunFacts?.length || 0,
  primaryEventId: fallbackEvent?.id || null,
  usingFallbackData: true,
};
