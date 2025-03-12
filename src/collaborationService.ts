import { Devvit, TriggerContext } from "@devvit/public-api";
import { CollaborationSession, CollaborationMessage, Participant, DrawingEvent } from "../shared/types/collaboration";

export type CollaborationService = {
    // Session Management
    createSession: (hostId: string, hostUsername: string) => Promise<CollaborationSession>;
    joinSession: (sessionId: string, userId: string, username: string) => Promise<CollaborationSession>;
    endSession: (sessionId: string) => Promise<void>;
    getActiveSession: (sessionId: string) => Promise<CollaborationSession | null>;
    
    // Real-time Events
    broadcastDrawingEvent: (event: DrawingEvent) => Promise<void>;
    subscribeToSession: (sessionId: string, callback: (message: CollaborationMessage) => void) => Promise<void>;
    unsubscribeFromSession: (sessionId: string) => Promise<void>;
    
    // Participant Management
    updateParticipantStatus: (sessionId: string, userId: string, updates: Partial<Participant>) => Promise<void>;
    removeParticipant: (sessionId: string, userId: string) => Promise<void>;
};

export function createCollaborationService(context: Devvit.Context | TriggerContext): CollaborationService {
    const { redis, realtime } = context;
    
    const sessionKey = (sessionId: string) => `collab_session_${sessionId}`;
    
    return {
        createSession: async (hostId: string, hostUsername: string): Promise<CollaborationSession> => {
            const sessionId = `session_${Date.now()}_${hostId}`;
            const session: CollaborationSession = {
                id: sessionId,
                createdAt: Date.now(),
                participants: [{
                    id: hostId,
                    username: hostUsername,
                    isHost: true,
                    joinedAt: Date.now(),
                    isVideoEnabled: false,
                    isAudioEnabled: false
                }],
                isActive: true
            };
            
            await redis.set(sessionKey(sessionId), JSON.stringify(session));
            
            const message: CollaborationMessage = {
                type: 'session_start',
                sessionId,
                senderId: hostId,
                timestamp: Date.now(),
                payload: session
            };
            
            realtime.send(`collab_${sessionId}`, message);
            return session;
        },

        joinSession: async (sessionId: string, userId: string, username: string): Promise<CollaborationSession> => {
            const sessionData = await redis.get(sessionKey(sessionId));
            if (!sessionData) {
                throw new Error('Session not found');
            }

            const session: CollaborationSession = JSON.parse(sessionData);
            if (!session.isActive) {
                throw new Error('Session has ended');
            }

            const newParticipant: Participant = {
                id: userId,
                username,
                isHost: false,
                joinedAt: Date.now(),
                isVideoEnabled: false,
                isAudioEnabled: false
            };

            session.participants.push(newParticipant);
            await redis.set(sessionKey(sessionId), JSON.stringify(session));

            const message: CollaborationMessage = {
                type: 'participant_join',
                sessionId,
                senderId: userId,
                timestamp: Date.now(),
                payload: newParticipant
            };

            realtime.send(`collab_${sessionId}`, message);
            return session;
        },

        endSession: async (sessionId: string): Promise<void> => {
            const sessionData = await redis.get(sessionKey(sessionId));
            if (!sessionData) {
                throw new Error('Session not found');
            }

            const session: CollaborationSession = JSON.parse(sessionData);
            session.isActive = false;
            await redis.set(sessionKey(sessionId), JSON.stringify(session));

            const message: CollaborationMessage = {
                type: 'session_end',
                sessionId,
                senderId: 'system',
                timestamp: Date.now(),
                payload: session
            };

            realtime.send(`collab_${sessionId}`, message);
        },

        getActiveSession: async (sessionId: string): Promise<CollaborationSession | null> => {
            const sessionData = await redis.get(sessionKey(sessionId));
            if (!sessionData) {
                return null;
            }
            const session: CollaborationSession = JSON.parse(sessionData);
            return session.isActive ? session : null;
        },

        broadcastDrawingEvent: async (event: DrawingEvent): Promise<void> => {
            const message: CollaborationMessage = {
                type: 'drawing_event',
                sessionId: event.sessionId,
                senderId: event.userId,
                timestamp: Date.now(),
                payload: event
            };

            realtime.send(`collab_${event.sessionId}`, message);
        },

        subscribeToSession: async (sessionId: string, callback: (message: CollaborationMessage) => void): Promise<void> => {
            realtime.subscribe(`collab_${sessionId}`, callback);
        },

        unsubscribeFromSession: async (sessionId: string): Promise<void> => {
            realtime.unsubscribe(`collab_${sessionId}`);
        },

        updateParticipantStatus: async (sessionId: string, userId: string, updates: Partial<Participant>): Promise<void> => {
            const sessionData = await redis.get(sessionKey(sessionId));
            if (!sessionData) {
                throw new Error('Session not found');
            }

            const session: CollaborationSession = JSON.parse(sessionData);
            const participantIndex = session.participants.findIndex(p => p.id === userId);
            
            if (participantIndex === -1) {
                throw new Error('Participant not found');
            }

            session.participants[participantIndex] = {
                ...session.participants[participantIndex],
                ...updates
            };

            await redis.set(sessionKey(sessionId), JSON.stringify(session));
        },

        removeParticipant: async (sessionId: string, userId: string): Promise<void> => {
            const sessionData = await redis.get(sessionKey(sessionId));
            if (!sessionData) {
                throw new Error('Session not found');
            }

            const session: CollaborationSession = JSON.parse(sessionData);
            const participantIndex = session.participants.findIndex(p => p.id === userId);
            
            if (participantIndex === -1) {
                throw new Error('Participant not found');
            }

            session.participants = session.participants.filter(p => p.id !== userId);
            await redis.set(sessionKey(sessionId), JSON.stringify(session));

            const message: CollaborationMessage = {
                type: 'participant_leave',
                sessionId,
                senderId: userId,
                timestamp: Date.now(),
                payload: session.participants[participantIndex]
            };

            realtime.send(`collab_${sessionId}`, message);
        }
    };
}
