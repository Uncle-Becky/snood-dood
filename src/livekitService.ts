import { Devvit, TriggerContext } from "@devvit/public-api";
import { 
    RoomServiceClient, 
    AccessToken,
    RoomCreateOptions,
    ParticipantInfo 
} from "livekit-server-sdk";
import { CollaborationSession, Participant } from "../shared/types/collaboration";

export type LiveKitService = {
    createRoom: (sessionId: string) => Promise<string>;
    generateToken: (sessionId: string, participant: Participant) => Promise<string>;
    deleteRoom: (sessionId: string) => Promise<void>;
    getRoomParticipants: (sessionId: string) => Promise<string[]>;
};

export function createLiveKitService(context: Devvit.Context | TriggerContext): LiveKitService {
    const { redis } = context;
    
    // LiveKit configuration
    const livekitHost = process.env.LIVEKIT_HOST || "http://localhost:7880";
    const apiKey = process.env.LIVEKIT_API_KEY || "devkey";
    const apiSecret = process.env.LIVEKIT_API_SECRET || "secret";
    
    const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

    return {
        createRoom: async (sessionId: string): Promise<string> => {
            try {
                const roomOptions: RoomCreateOptions = {
                    name: `collab_${sessionId}`,
                    emptyTimeout: 60 * 30, // 30 minutes
                    maxParticipants: 20
                };

                const room = await roomService.createRoom(roomOptions);

                // Store room info in Redis
                await redis.set(`livekit_room_${sessionId}`, JSON.stringify({
                    name: room.name,
                    sid: room.sid,
                    createdAt: Date.now()
                }));

                return room.name;
            } catch (error) {
                console.error('Failed to create LiveKit room:', error);
                throw new Error('Failed to create collaboration room');
            }
        },

        generateToken: async (sessionId: string, participant: Participant): Promise<string> => {
            try {
                const roomName = `collab_${sessionId}`;
                
                const accessToken = new AccessToken(apiKey, apiSecret, {
                    identity: participant.id,
                    name: participant.username
                });

                accessToken.addGrant({
                    roomJoin: true,
                    room: roomName,
                    canPublish: true,
                    canSubscribe: true,
                    canPublishData: true
                });

                return accessToken.toJwt();
            } catch (error) {
                console.error('Failed to generate LiveKit token:', error);
                throw new Error('Failed to generate access token');
            }
        },

        deleteRoom: async (sessionId: string): Promise<void> => {
            try {
                const roomName = `collab_${sessionId}`;
                await roomService.deleteRoom(roomName);
                await redis.del(`livekit_room_${sessionId}`);
            } catch (error) {
                console.error('Failed to delete LiveKit room:', error);
                throw new Error('Failed to delete collaboration room');
            }
        },

        getRoomParticipants: async (sessionId: string): Promise<string[]> => {
            try {
                const roomName = `collab_${sessionId}`;
                const participants = await roomService.listParticipants(roomName);
                return participants.map((p: ParticipantInfo) => p.identity || '');
            } catch (error) {
                console.error('Failed to get room participants:', error);
                throw new Error('Failed to get room participants');
            }
        }
    };
}
