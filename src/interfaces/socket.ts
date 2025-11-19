export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ServerToClientEvents {
  'connection:success': (data: { message: string }) => void;
  'chat:message': (data: { message: string; timestamp: string }) => void;
  'chat:typing': (data: { isTyping: boolean }) => void;
  'chat:error': (data: { error: string }) => void;
}

export interface ClientToServerEvents {
  'chat:send': (data: { message: string }) => void;
  'chat:typing': (data: { isTyping: boolean }) => void;
}

export interface SocketAuthData {
  token: string;
}
