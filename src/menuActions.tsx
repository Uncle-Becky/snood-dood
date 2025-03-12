import { Devvit } from '@devvit/public-api';
import { getNewRandomPoem } from '../data/poems.js';
import { createNewPost } from '../shared/utils/createNewPost.js';

// Configure Devvit's plugins
Devvit.configure({
  redditAPI: true,
});

// Adds a new menu item to the subreddit allowing to create a new post
Devvit.addMenuItem({
  label: '[+] Devvit-as-a-backend post',
  location: 'subreddit',
  onPress: async (_event, context) => {
    // This template creates a new post with a random poem
    // Feel free to delete this method implementation and create your own.
    const postData = await getNewRandomPoem();
    await createNewPost(postData.poemTitle, postData, context);
  },
});
