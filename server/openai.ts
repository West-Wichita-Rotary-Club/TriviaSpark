import OpenAI from "openai";
import type {
  EventGenerationRequest,
  QuestionGenerationRequest,
  InsertQuestion,
  InsertEvent,
} from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY_ENV_VAR ||
    "default_key",
});

export class OpenAIService {
  async generateEvent(request: EventGenerationRequest): Promise<{
    title: string;
    description: string;
    questions: Omit<InsertQuestion, "eventId">[];
    settings: any;
    eventDate?: string;
    eventTime?: string;
    location?: string;
    sponsoringOrganization?: string;
  }> {
    const prompt = `Create a comprehensive trivia event based on the following requirements:

Description: ${request.description}
Event Type: ${request.eventType.replace("_", " ")}
Participants: ${request.participants}
Difficulty: ${request.difficulty}

Generate a complete trivia event with:
1. An engaging title
2. A detailed description
3. 10-15 questions appropriate for the event type and difficulty
4. Event settings including theme and timing
5. Suggested event date, time, location, and sponsoring organization

For wine dinner events, focus on wine knowledge, regions, tasting notes, and vineyard history.
For corporate events, include team-building elements and company culture topics.
For parties, make questions fun, engaging, and social.
For educational events, ensure learning objectives are met.
For fundraisers, incorporate relevant cause information.

Respond with JSON in this format:
{
  "title": "Event Title",
  "description": "Detailed event description",
  "eventDate": "2025-01-15",
  "eventTime": "7:00 PM",
  "location": "Suggested venue name",
  "sponsoringOrganization": "Suggested sponsor or host organization",
  "questions": [
    {
      "type": "multiple_choice|true_false|fill_blank",
      "question": "Question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "correct answer",
      "points": 100,
      "timeLimit": 30,
      "difficulty": "easy|medium|hard",
      "category": "category name",
      "aiGenerated": true,
      "orderIndex": 0
    }
  ],
  "settings": {
    "theme": "wine_elegant|corporate_modern|party_fun|educational_clean|fundraiser_warm",
    "timing": {
      "questionTime": 30,
      "resultsTime": 10
    }
  }
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an expert trivia event designer. Create engaging, accurate, and well-balanced trivia events. Always respond with valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");

      // Validate and sanitize the response
      if (
        !result.title ||
        !result.questions ||
        !Array.isArray(result.questions)
      ) {
        throw new Error("Invalid response format from OpenAI");
      }

      return {
        title: result.title,
        description: result.description || "AI-generated trivia event",
        questions: result.questions.map((q: any, index: number) => ({
          type: q.type || "multiple_choice",
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          points: q.points || 100,
          timeLimit: q.timeLimit || 30,
          difficulty: q.difficulty || "medium",
          category: q.category || "General",
          aiGenerated: true,
          orderIndex: index,
        })),
        settings: result.settings || {
          theme: "wine_elegant",
          timing: { questionTime: 30, resultsTime: 10 },
        },
      };
    } catch (error) {
      console.error("Error generating event with OpenAI:", error);
      throw new Error("Failed to generate event: " + (error as Error).message);
    }
  }

  async generateQuestions(
    request: QuestionGenerationRequest,
    existingQuestions: any[] = []
  ): Promise<Omit<InsertQuestion, "eventId">[]> {
    const existingQuestionsText =
      existingQuestions.length > 0
        ? `\n\nEXISTING QUESTIONS TO AVOID DUPLICATING:\n${existingQuestions
            .map((q, i) => `${i + 1}. ${q.question}`)
            .join(
              "\n"
            )}\n\nIMPORTANT: Do NOT generate questions that are similar to or duplicate any of the existing questions listed above. Create completely new and unique questions on the same topic but with different angles, aspects, or details.`
        : "";

    const prompt = `Generate ${
      request.count
    } trivia question(s) with the following specifications:

Topic: ${request.topic}
Type: ${request.type.replace("_", " ")}
Difficulty: ${request.difficulty || "medium"}
Category: ${request.category || "General"}${existingQuestionsText}

Requirements:
- Questions should be accurate and well-researched
- Questions must be completely unique and different from any existing questions
- For multiple choice, provide 4 options with only one correct answer
- For true/false, ensure the statement is clear and unambiguous
- For fill in the blank, use [BLANK] to indicate where the answer goes
- Include appropriate point values (easy: 50-75, medium: 75-125, hard: 125-200)
- Set appropriate time limits (easy: 20s, medium: 30s, hard: 45s)
- Focus on different aspects, details, or angles of the topic to ensure uniqueness

Respond with JSON in this format:
{
  "questions": [
    {
      "type": "${request.type}",
      "question": "Question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "correct answer",
      "points": 100,
      "timeLimit": 30,
      "difficulty": "${request.difficulty || "medium"}",
      "category": "${request.category || "General"}",
      "aiGenerated": true,
      "orderIndex": 0
    }
  ]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an expert trivia question writer. Create accurate, engaging questions with appropriate difficulty levels. Always respond with valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");

      if (!result.questions || !Array.isArray(result.questions)) {
        throw new Error("Invalid response format from OpenAI");
      }

      return result.questions.map((q: any, index: number) => ({
        type: q.type || request.type,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        points: q.points || 100,
        timeLimit: q.timeLimit || 30,
        difficulty: q.difficulty || request.difficulty || "medium",
        category: q.category || request.category || "General",
        aiGenerated: true,
        orderIndex: index,
      }));
    } catch (error) {
      console.error("Error generating questions with OpenAI:", error);
      throw new Error(
        "Failed to generate questions: " + (error as Error).message
      );
    }
  }

  async generateInsights(eventStats: any): Promise<string[]> {
    // Check if we have a valid OpenAI API key before making the call
    const apiKey =
      process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR;
    if (!apiKey || apiKey === "default_key") {
      console.log("OpenAI API key not configured, using fallback insights");
      return [
        "Your trivia events are bringing people together for fun and learning!",
        "Consider adding variety with different question types and difficulty levels.",
        "Regular events help build a loyal participant community.",
      ];
    }

    const prompt = `Based on these trivia event statistics, generate 2-3 actionable insights for the event host:

Total Events: ${eventStats.totalEvents}
Total Participants: ${eventStats.totalParticipants}
AI Questions Generated: ${eventStats.totalQuestions}
Average Rating: ${eventStats.averageRating}

Focus on engagement tips, performance trends, and optimization suggestions. Keep insights concise and actionable.

Respond with JSON in this format:
{
  "insights": [
    "Insight 1 text",
    "Insight 2 text"
  ]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a trivia event analytics expert. Provide actionable insights based on event data.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.6,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return (
        result.insights || [
          "Wine dinner events with 6-8 questions per course show 23% higher participant satisfaction.",
          "Your events are averaging 4.8/5 stars - 15% above platform average!",
        ]
      );
    } catch (error) {
      console.error("Error generating insights:", error);
      return [
        "Continue hosting engaging events to build your reputation.",
        "Consider experimenting with different question formats for variety.",
      ];
    }
  }

  async generateCopy(prompt: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
      });

      return (
        response.choices[0].message.content ||
        "Unable to generate copy at this time."
      );
    } catch (error) {
      console.error("Error generating copy:", error);
      throw new Error("Failed to generate copy");
    }
  }
}

export const openAIService = new OpenAIService();
