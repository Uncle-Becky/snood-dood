import { Devvit } from '@devvit/public-api';
import { createRedisService } from '../../src/redisService.js';
import { PostData } from '../types/postData.js';

export async function createNewPost(title:string, postData: PostData, context: Devvit.Context) {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
        title: title,
        subredditName: subreddit.name,
        // The preview appears while the post loads
        preview: (
            <vstack height="100%" width="100%" alignment="middle center">
                <text size="large">Loading ...</text>
            </vstack>
        ),
    });
    
    const redisService = createRedisService(context);
    await redisService.savePostData(post.id, postData);

    ui.showToast({ text: 'Created post!' });
    ui.navigateTo(post);
}