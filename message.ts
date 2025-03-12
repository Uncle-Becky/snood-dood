export interface DevvitMessage {
    type: 'drawingEvent' | 'getLiveKitToken';
    payload: any;
}

export interface WebViewMessage {
    type: string;
    payload: MessagePayload;
}

export interface MessagePayload {
    sessionId?: string;
    userId?: string;
    username?: string;
    participant?: {
        id: string;
        username: string;
        isHost: boolean;
        joinedAt?: number;
        isVideoEnabled?: boolean;
        isAudioEnabled?: boolean;
    };
}

export interface CollaborationResponse {
    error?: string;
    session?: any;
    token?: string;
}
