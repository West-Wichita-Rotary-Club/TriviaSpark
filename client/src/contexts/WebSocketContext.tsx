import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocket, WebSocketMessage } from '../hooks/useWebSocket';

interface WebSocketContextType {
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  sendMessage: (message: WebSocketMessage) => void;
  messages: WebSocketMessage[];
  connect: (eventId: string, role: 'host' | 'participant', userId?: string, participantId?: string) => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [eventId, setEventId] = useState<string>();
  const [role, setRole] = useState<'host' | 'participant'>('participant');
  const [userId, setUserId] = useState<string>();
  const [participantId, setParticipantId] = useState<string>();
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);

  const handleMessage = (message: WebSocketMessage) => {
    setMessages(prev => [...prev.slice(-49), message]); // Keep last 50 messages
  };

  const { isConnected, connectionStatus, sendMessage: wsSendMessage, connect: wsConnect, disconnect: wsDisconnect } = useWebSocket({
    eventId,
    role,
    userId,
    participantId,
    onMessage: handleMessage,
    onConnect: () => {
      console.log('WebSocket connected in context');
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected in context');
    }
  });

  const connect = (newEventId: string, newRole: 'host' | 'participant', newUserId?: string, newParticipantId?: string) => {
    setEventId(newEventId);
    setRole(newRole);
    setUserId(newUserId);
    setParticipantId(newParticipantId);
    setMessages([]); // Clear messages when connecting to new event
  };

  const disconnect = () => {
    wsDisconnect();
    setEventId(undefined);
    setMessages([]);
  };

  const contextValue: WebSocketContextType = {
    isConnected,
    connectionStatus,
    sendMessage: wsSendMessage,
    messages,
    connect,
    disconnect
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}