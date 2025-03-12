import React, { useState, useEffect } from 'react';
import Panel from '../components/Panel';
import Button from '../components/Button';
import devvitClient from '../lib/DevvitClient';

const PostDataPage: React.FC = () => {
  const [title, setTitle] = useState<string|undefined>(undefined);
  const [poem, setPoem] = useState<string|undefined>(undefined);
  const [message, setMessage] = useState<string>(' ');

  useEffect(() => {
    // Set up message handler for post data
    devvitClient.on('fetchPostDataReponse', (message) => {
      if ('postData' in message.data) {
        setTitle(message.data.postData.poemTitle);
        setPoem(message.data.postData.poemBody);
        setMessage('Post data loaded.');
      }
    });
    
    // Clean up event listeners when component unmounts
    return () => {
      devvitClient.off('fetchPostDataReponse');
    };
  }, []);

  const handleCreatePost = () => {
    setMessage('Creating new post...');
    devvitClient.postMessage({ type: 'createNewPost' });
  };

  const fetchPostData = () => {
    setMessage('Fetching Post Data...');
    devvitClient.postMessage({ type: 'fetchPostData' });
  };

  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Post Information</h1>
      <p className="text-s text-gray-400" id="message">{message}</p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 sm:w-48">
          <Button onClick={fetchPostData} >Fetch Post Data</Button>
          <Button onClick={handleCreatePost} variant="secondary">Create Post</Button>
          <Panel title="Demo Instructions">
            <p className="text-gray-600">Post Data is defined in <pre>postData.ts</pre> <br />In this example, each post has an AI-generated poem. Click the buttons to the left to load data for this post, or create a new post with a new poem</p>
          </Panel>
        </div>

        <div className="flex-1">
          <Panel title={title !== undefined ? title : '(No post title loaded)'}>
            {poem === undefined ? (
              <p className="text-gray-600"><i>(No post data loaded)</i></p>
            ) : (
              <p className="text-gray-600" style={{whiteSpace: 'pre-line'}}>{poem}</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default PostDataPage;