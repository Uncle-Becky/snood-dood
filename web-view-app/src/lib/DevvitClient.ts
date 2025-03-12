import { CollaborationSession } from '../../../shared/types/collaboration';
import { CollaborationUserData } from '../../../shared/types/userData';

export type CollaborationResponse = {
  session?: CollaborationSession;
  error?: string;
};

export type MessagePayload = {
  sessionId?: string;
  userId?: string;
  username?: string;
  hostId?: string;
  hostUsername?: string;
  data?: any;
};

export interface DevvitClient {
  getUserData: () => Promise<CollaborationUserData>;
  sendMessage: (type: string, payload: MessagePayload) => Promise<CollaborationResponse>;
  subscribeToMessages: (callback: (message: any) => void) => void;
  unsubscribeFromMessages: () => void;
}

// Mock implementation for development
export class MockDevvitClient implements DevvitClient {
  private mockUser: CollaborationUserData = {
    id: 'user-1',
    username: 'Test User',
    isAuthenticated: true
  };

  private mockSession: CollaborationSession | null = null;
  private subscribers: ((message: any) => void)[] = [];

  async getUserData(): Promise<CollaborationUserData> {
    return this.mockUser;
  }

  async sendMessage(type: string, payload: MessagePayload): Promise<CollaborationResponse> {
    switch (type) {
      case 'createSession':
        this.mockSession = {
          id: `session-${Date.now()}`,
          createdAt: Date.now(),
          participants: [{
            id: payload.hostId!,
            username: payload.hostUsername!,
            isHost: true,
            joinedAt: Date.now(),
            isVideoEnabled: false,
            isAudioEnabled: false
          }],
          isActive: true
        };
        return { session: this.mockSession };

      case 'joinSession':
        if (!this.mockSession) {
          return { error: 'Session not found' };
        }
        if (!this.mockSession.isActive) {
          return { error: 'Session has ended' };
        }
        this.mockSession.participants.push({
          id: payload.userId!,
          username: payload.username!,
          isHost: false,
          joinedAt: Date.now(),
          isVideoEnabled: false,
          isAudioEnabled: false
        });
        return { session: this.mockSession };

      case 'endSession':
        if (!this.mockSession) {
          return { error: 'Session not found' };
        }
        this.mockSession.isActive = false;
        return { session: this.mockSession };

      case 'drawingEvent':
        if (!this.mockSession) {
          return { error: 'Session not found' };
        }
        // Broadcast the drawing event to all subscribers
        this.subscribers.forEach(callback => {
          callback({
            type: 'drawingEvent',
            payload: payload.data
          });
        });
        return {};

      default:
        return { error: 'Unknown message type' };
    }
  }

  subscribeToMessages(callback: (message: any) => void): void {
    this.subscribers.push(callback);
  }

  unsubscribeFromMessages(): void {
    this.subscribers = [];
  }
}
