import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CollaborationSession, Participant } from '../../../shared/types/collaboration';
import { CollaborationUserData } from '../../../shared/types/userData';
import { DevvitClient } from '../lib/DevvitClient';
import { DrawingBoard } from '../components/DrawingBoard';

interface CollaborationPageProps {
  client: DevvitClient;
}

export const CollaborationPage: React.FC<CollaborationPageProps> = ({ client }) => {
  const [searchParams] = useSearchParams();
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsLoading(true);
        const userData = await client.getUserData() as CollaborationUserData;
        if (!userData || !userData.isAuthenticated) {
          throw new Error('Please log in to join a collaboration session');
        }

        const sessionId = searchParams.get('sessionId');

        if (sessionId) {
          // Join existing session
          const response = await client.sendMessage('joinSession', {
            sessionId,
            userId: userData.id,
            username: userData.username
          });

          if ('error' in response) {
            throw new Error(response.error);
          }

          const joinedSession = response.session as CollaborationSession;
          setSession(joinedSession);
          setIsHost(joinedSession.participants.some(p => p.id === userData.id && p.isHost));
        } else {
          // Create new session
          const response = await client.sendMessage('createSession', {
            hostId: userData.id,
            hostUsername: userData.username
          });

          if ('error' in response) {
            throw new Error(response.error);
          }

          const newSession = response.session as CollaborationSession;
          setSession(newSession);
          setIsHost(true);

          // Update URL with session ID
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set('sessionId', newSession.id);
          window.history.replaceState(null, '', `?${newSearchParams.toString()}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize session');
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, [client, searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-gray-600">Loading session...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-gray-600">No active session found.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Collaboration Session
            </h1>
            <p className="text-sm text-gray-500">
              Session ID: {session.id}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {session.participants.length} participant{session.participants.length !== 1 ? 's' : ''}
            </div>
            {isHost && (
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                onClick={async () => {
                  try {
                    await client.sendMessage('endSession', { sessionId: session.id });
                  } catch (err) {
                    setError('Failed to end session');
                  }
                }}
              >
                End Session
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
    </div>
  );
};
