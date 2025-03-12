import { DrawingTool } from './drawingTools';

export interface CollaborationSession {
    id: string;
    createdAt: number;
    participants: Participant[];
    isActive: boolean;
}

export interface Participant {
    id: string;
    username: string;
    isHost: boolean;
    joinedAt: number;
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
}

export interface DrawingEvent {
    type: 'stroke' | 'clear' | 'undo' | 'redo';
    sessionId: string;
    userId: string;
    timestamp: number;
    data: StrokeData | null;
}

export interface StrokeData {
    points: Point[];
    tool: DrawingTool;
    color: string;
    width: number;
}

export interface Point {
    x: number;
    y: number;
    pressure?: number;
}

export interface CollaborationMessage {
    type: 'session_start' | 'session_end' | 'participant_join' | 'participant_leave' | 'drawing_event';
    sessionId: string;
    senderId: string;
    timestamp: number;
    payload: CollaborationSession | Participant | DrawingEvent;
}
