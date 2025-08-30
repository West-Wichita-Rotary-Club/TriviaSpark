import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { parse } from "url";
import { IStorage } from "./storage";

export interface WebSocketMessage {
  type: string;
  eventId?: string;
  data?: any;
  timestamp?: number;
}

export interface ConnectedClient {
  ws: WebSocket;
  eventId?: string;
  participantId?: string;
  role: "host" | "participant";
  userId?: string;
}

class TriviaSpark_WebSocket_Manager {
  private wss: WebSocketServer;
  private clients: Map<WebSocket, ConnectedClient> = new Map();
  private eventClients: Map<string, Set<WebSocket>> = new Map();
  private storage: IStorage;

  constructor(server: Server, storage: IStorage) {
    this.storage = storage;
    this.wss = new WebSocketServer({
      server,
      path: "/ws",
    });

    this.wss.on("connection", this.handleConnection.bind(this));
  }

  private handleConnection(ws: WebSocket, request: any) {
    console.log("WebSocket connection established");

    // Parse connection URL for initial data
    const url = parse(request.url, true);
    const eventId = url.query.eventId as string;
    const role = (url.query.role as string) || "participant";
    const userId = url.query.userId as string;

    // Store client info
    const client: ConnectedClient = {
      ws,
      eventId,
      role: role as "host" | "participant",
      userId,
    };
    this.clients.set(ws, client);

    // Add to event-specific client list
    if (eventId) {
      if (!this.eventClients.has(eventId)) {
        this.eventClients.set(eventId, new Set());
      }
      this.eventClients.get(eventId)!.add(ws);
    }

    // Handle incoming messages
    ws.on("message", (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        this.handleMessage(ws, message);
      } catch (error) {
        console.error("Invalid WebSocket message:", error);
      }
    });

    // Handle disconnection
    ws.on("close", () => {
      this.handleDisconnection(ws);
    });

    // Send connection confirmation
    this.sendToClient(ws, {
      type: "connection_confirmed",
      data: { eventId, role },
      timestamp: Date.now(),
    });
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage) {
    const client = this.clients.get(ws);
    if (!client) return;

    console.log("WebSocket message received:", message.type);

    switch (message.type) {
      case "join_event":
        this.handleJoinEvent(ws, message);
        break;
      case "participant_answer":
        this.handleParticipantAnswer(ws, message);
        break;
      case "lock_answer":
        this.handleLockAnswer(ws, message);
        break;
      case "next_question":
        this.handleNextQuestion(ws, message);
        break;
      case "timer_update":
        this.handleTimerUpdate(ws, message);
        break;
      case "event_status_change":
        this.handleEventStatusChange(ws, message);
        break;
      default:
        console.log("Unknown message type:", message.type);
    }
  }

  private handleJoinEvent(ws: WebSocket, message: WebSocketMessage) {
    const client = this.clients.get(ws);
    if (!client || !message.eventId) return;

    client.eventId = message.eventId;
    client.participantId = message.data?.participantId;

    // Add to event clients
    if (!this.eventClients.has(message.eventId)) {
      this.eventClients.set(message.eventId, new Set());
    }
    this.eventClients.get(message.eventId)!.add(ws);

    // Broadcast participant joined to all clients in the event
    this.broadcastToEvent(message.eventId, {
      type: "participant_joined",
      data: {
        participantId: client.participantId,
        participantCount: this.getEventParticipantCount(message.eventId),
      },
      timestamp: Date.now(),
    });
  }

  private handleParticipantAnswer(ws: WebSocket, message: WebSocketMessage) {
    const client = this.clients.get(ws);
    if (!client?.eventId) return;

    // Broadcast answer selection to all clients in the event
    this.broadcastToEvent(client.eventId, {
      type: "answer_selected",
      data: {
        participantId: client.participantId,
        questionId: message.data?.questionId,
        selectedAnswer: message.data?.selectedAnswer,
        isLocked: false,
      },
      timestamp: Date.now(),
    });
  }

  private async handleLockAnswer(ws: WebSocket, message: WebSocketMessage) {
    const client = this.clients.get(ws);
    if (!client?.eventId) return;

    // Save the response to database with time-based scoring
    if (
      message.data?.questionId &&
      message.data?.selectedAnswer &&
      client.participantId
    ) {
      try {
        // Get question to check answer and calculate points using proper database lookup
        const question = await this.storage.getQuestion(
          message.data.questionId
        );

        if (question) {
          const isCorrect =
            message.data.selectedAnswer.toLowerCase().trim() ===
            (question.correctAnswer || "").toLowerCase().trim();
          const timeRemaining = message.data?.timeRemaining || 0;

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

          await this.storage.createResponse({
            participantId: client.participantId,
            questionId: message.data.questionId,
            answer: message.data.selectedAnswer,
            isCorrect,
            points,
            responseTime: null,
            timeRemaining: timeRemaining,
          });

          // Update the score in the broadcast message
          message.data.score = points;
          message.data.isCorrect = isCorrect;
        }
      } catch (error) {
        console.error("Error saving response:", error);
      }
    }

    // Broadcast locked answer to all clients in the event
    this.broadcastToEvent(client.eventId, {
      type: "answer_locked",
      data: {
        participantId: client.participantId,
        questionId: message.data?.questionId,
        selectedAnswer: message.data?.selectedAnswer,
        score: message.data?.score,
        timeRemaining: message.data?.timeRemaining,
        isCorrect: message.data?.isCorrect,
      },
      timestamp: Date.now(),
    });
  }

  private handleNextQuestion(ws: WebSocket, message: WebSocketMessage) {
    const client = this.clients.get(ws);
    if (!client?.eventId || client.role !== "host") return;

    // Broadcast next question to all participants
    this.broadcastToEvent(client.eventId, {
      type: "question_started",
      data: {
        questionIndex: message.data?.questionIndex,
        question: message.data?.question,
        timeLimit: message.data?.timeLimit || 30,
      },
      timestamp: Date.now(),
    });
  }

  private handleTimerUpdate(ws: WebSocket, message: WebSocketMessage) {
    const client = this.clients.get(ws);
    if (!client?.eventId || client.role !== "host") return;

    // Broadcast timer update to all participants
    this.broadcastToEvent(client.eventId, {
      type: "timer_update",
      data: {
        timeLeft: message.data?.timeLeft,
        finalCountdown: message.data?.finalCountdown,
      },
      timestamp: Date.now(),
    });
  }

  private handleEventStatusChange(ws: WebSocket, message: WebSocketMessage) {
    const client = this.clients.get(ws);
    if (!client?.eventId || client.role !== "host") return;

    // Broadcast event status change to all participants
    this.broadcastToEvent(client.eventId, {
      type: "event_status_changed",
      data: {
        status: message.data?.status,
        message: message.data?.message,
      },
      timestamp: Date.now(),
    });
  }

  private handleDisconnection(ws: WebSocket) {
    const client = this.clients.get(ws);
    if (client?.eventId) {
      const eventClients = this.eventClients.get(client.eventId);
      if (eventClients) {
        eventClients.delete(ws);

        // Broadcast participant left
        this.broadcastToEvent(client.eventId, {
          type: "participant_left",
          data: {
            participantId: client.participantId,
            participantCount: this.getEventParticipantCount(client.eventId),
          },
          timestamp: Date.now(),
        });
      }
    }

    this.clients.delete(ws);
    console.log("WebSocket client disconnected");
  }

  private sendToClient(ws: WebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private broadcastToEvent(eventId: string, message: WebSocketMessage) {
    const eventClients = this.eventClients.get(eventId);
    if (!eventClients) return;

    eventClients.forEach((ws) => {
      this.sendToClient(ws, message);
    });
  }

  private getEventParticipantCount(eventId: string): number {
    const eventClients = this.eventClients.get(eventId);
    if (!eventClients) return 0;

    return Array.from(eventClients)
      .map((ws) => this.clients.get(ws))
      .filter((client) => client?.role === "participant").length;
  }

  // Public methods for manual broadcasting
  public broadcastQuestionStart(eventId: string, questionData: any) {
    this.broadcastToEvent(eventId, {
      type: "question_started",
      data: questionData,
      timestamp: Date.now(),
    });
  }

  public broadcastAnswerReveal(eventId: string, answerData: any) {
    this.broadcastToEvent(eventId, {
      type: "answer_revealed",
      data: answerData,
      timestamp: Date.now(),
    });
  }

  public broadcastLeaderboardUpdate(eventId: string, leaderboardData: any) {
    this.broadcastToEvent(eventId, {
      type: "leaderboard_updated",
      data: leaderboardData,
      timestamp: Date.now(),
    });
  }

  public broadcastEventEnd(eventId: string, finalResults: any) {
    this.broadcastToEvent(eventId, {
      type: "event_ended",
      data: finalResults,
      timestamp: Date.now(),
    });
  }
}

export { TriviaSpark_WebSocket_Manager };
