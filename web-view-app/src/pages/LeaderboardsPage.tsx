import React, { useState, useEffect } from 'react';
import Panel from '../components/Panel';
import Button from '../components/Button';
import devvitClient from '../lib/DevvitClient';
import { LeaderboardEntry } from '../../../shared/types/leaderboardEntry';

const LeaderboardsPage: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [message, setMessage] = useState<string>(' ');

  useEffect(() => {
    // Set up message handler for leaderboard data
    devvitClient.on('fetchLeaderboardResponse', (message) => {
      console.log('Received leaderboard data', message);
      if ('leaderboard' in message.data) {
        setMessage('Leaderboard loaded.');
        setEntries(message.data.leaderboard as LeaderboardEntry[]);
      }
    });

    devvitClient.on('setUserScoreResponse', (message) => {
      console.log('Received set user score response', message);
      if ('status' in message.data) {
        setMessage(message.data.status);
      }
      fetchLeaderboardFromDevvit();
    });

    // Clean up event listeners when component unmounts
    return () => {
      devvitClient.off('fetchLeaderboardResponse');
      devvitClient.off('setUserScoreResponse');
    };
  }, []);

  const fetchLeaderboardFromDevvit = () => {
    setMessage('Loading...');
    devvitClient.postMessage({ type: 'fetchLeaderboard', data: { topEntries: 10 } });
  };

  const sendCurrentScoreToDevvit = (score: number) => {
    setMessage(`Sending score to Devvit: ${score}`);
    devvitClient.postMessage({ type: 'setUserScore', data: { score } });
  };

  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Leaderboards</h1>
      <p className="text-s text-gray-400" id="message">{message}</p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 sm:w-48">
          <Button onClick={fetchLeaderboardFromDevvit}>Load Leaderboard</Button>
          <Panel title="Demo Instructions">
            <p className="text-gray-600">Click on load leaderboards to show leaderboards on the panel below. You can also set your current score.</p>
          </Panel>
        </div>
        
        <div className="flex-1">
          <Panel title="Leaderboard">
          <input
              type="number"
              value={currentScore}
              onChange={(e) => setCurrentScore(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md p-2" ></input>
          <Button onClick={() => sendCurrentScoreToDevvit(currentScore)} >Set Score</Button>
            {entries.length === 0 ? (
              <p className="text-gray-600"><i>(No leaderboard data available.)</i></p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {entries.map((entry, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {entry.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600">
                          {entry.score.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardsPage;