import React, { useCallback, useState } from 'react';
import { 
  Tldraw, 
  Editor, 
  TLDrawShape,
  createTLStore,
  TLShapeId,
  useEditor,
  track,
  TLShape
} from '@tldraw/tldraw';
import { CollaborationSession, DrawingEvent } from '../../../shared/types/collaboration';
import { DevvitClient } from '../lib/DevvitClient';
import '@tldraw/tldraw/tldraw.css';

interface DrawingBoardProps {
  client: DevvitClient;
  session: CollaborationSession;
  isHost: boolean;
}

const DrawingBoardInner = track(({ client, session }: { client: DevvitClient; session: CollaborationSession }) => {
  const editor = useEditor();
  const [error, setError] = useState<string | null>(null);

  const handleShapeChange = useCallback(async () => {
    if (!session || !editor) return;

    try {
      const shapes = editor.getCurrentPageShapes();
      const drawShapes = shapes.filter((shape): shape is TLDrawShape => shape.type === 'draw');
      
      if (drawShapes.length === 0) return;

      const drawingEvent: DrawingEvent = {
        type: 'stroke',
        sessionId: session.id,
        userId: session.participants.find(p => p.isHost)?.id || '',
        timestamp: Date.now(),
        data: {
          points: drawShapes.map(shape => ({ 
            x: shape.x, 
            y: shape.y,
            pressure: 1 
          })),
          tool: { type: 'pen' },
          color: '#000000',
          width: 2
        }
      };

      await client.sendMessage('drawingEvent', drawingEvent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send drawing event');
    }
  }, [client, session, editor]);

  React.useEffect(() => {
    if (!editor) return;

    const handleChange = () => {
      handleShapeChange();
    };

    editor.addListener('change', handleChange);

    return () => {
      editor.removeListener('change', handleChange);
    };
  }, [editor, handleShapeChange]);

  React.useEffect(() => {
    const handleRemoteChange = (message: any) => {
      if (!editor || message.type !== 'drawingEvent' || !message.payload?.data?.points) return;

      try {
        const event = message.payload as DrawingEvent;
        
        editor.batch(() => {
          event.data?.points.forEach((point, i) => {
            const shapeId = `${event.timestamp}-${i}` as TLShapeId;
            
            editor.createShape<TLDrawShape>({
              id: shapeId,
              type: 'draw',
              x: point.x,
              y: point.y,
              props: {
                color: 'black',
                size: 'm',
                dash: 'draw',
                fill: 'none'
              },
            });
          });
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to apply remote changes');
      }
    };

    client.subscribeToMessages(handleRemoteChange);

    return () => {
      client.unsubscribeFromMessages();
    };
  }, [editor, client]);

  return error ? (
    <div className="absolute top-0 left-0 right-0 text-red-500 text-sm flex items-center justify-between p-2 bg-red-50">
      <span>{error}</span>
      <button 
        className="ml-2 text-gray-400 hover:text-gray-600"
        onClick={() => setError(null)}
      >
        ✕
      </button>
    </div>
  ) : null;
});

export const DrawingBoard: React.FC<DrawingBoardProps> = ({ client, session, isHost }) => {
  const store = createTLStore();
  
  const handleMount = useCallback((editor: Editor) => {
    if (!isHost) {
      editor.updateInstanceState({ isReadonly: true });
    }
  }, [isHost]);

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
      <div className="h-12 bg-gray-50 border-b flex items-center px-4">
        <h3 className="text-gray-700 font-medium">Drawing Board</h3>
      </div>
      <div className="flex-1 relative">
        <Tldraw
          store={store}
          onMount={handleMount}
          hideUi={!isHost}
          inferDarkMode={false}
          autoFocus
        >
          <DrawingBoardInner client={client} session={session} />
        </Tldraw>
      </div>
    </div>
  );
};
