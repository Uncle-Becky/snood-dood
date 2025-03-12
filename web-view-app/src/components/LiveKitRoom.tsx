import React, { useEffect, useState } from 'react';
import {
  LiveKitRoom as LKRoom,
  VideoConference,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { CollaborationSession, Participant } from '../../../shared/types/collaboration';
import { DevvitClient } from '../lib/DevvitClient';
import { CollaborationResponse } from '../../../shared/types/message';

interface LiveKitRoomProps {
  client: DevvitClient;
  session: CollaborationSession;
  participant: Participant;
}

export const LiveKitRoom: React.FC<LiveKitRoomProps> = ({ client, session, participant }) => {
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeLiveKit = async () => {
      try {
        const response = await client.sendMessage('getLiveKitToken', {
          sessionId: session.id,
          participant: {
            id: participant.id,
            username: participant.username,
            isHost: participant.isHost
          }
        }) as CollaborationResponse;

        if (response.error) {
          throw new Error(response.error);
        }

        if (!response.token) {
          throw new Error('No token received');
        }

        setToken(response.token);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize LiveKit');
      }
    };

    initializeLiveKit();
  }, [client, session.id, participant]);

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-600">Connecting to video conference...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      <LKRoom
        token={token}
        serverUrl={process.env.REACT_APP_LIVEKIT_URL || 'ws://localhost:7880'}
        connect={true}
        audio={true}
        video={true}
      >
        <div className="h-full flex flex-col">
          <div className="flex-1 relative">
            <VideoConference />
          </div>
          <ControlBar />
          <RoomAudioRenderer />
        </div>
      </LKRoom>
    </div>
  );
};
