import { DrawingTool } from './drawingTools';

export type Participant = {
    id: string;
    username: string;
    isHost: boolean;
    joinedAt: number;
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
};

export type CollaborationSession = {
    id: string;
    createdAt: number;
    participants: Participant[];
    isActive: boolean;
};

export type DrawingEvent = {
    type: 'stroke';
    sessionId: string;
    userId: string;
    timestamp: number;
    data: {
        points: { x: number; y: number; pressure: number }[];
        tool: { type: string };
        color: string;
        width: number;
    };
};

export type CollaborationMessage = {
    type: string;
    sessionId: string;
    senderId: string;
    timestamp: number;
    payload: any; // Consider more specific types based on message type
};
