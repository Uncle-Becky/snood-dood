import { Devvit, TriggerContext } from "@devvit/public-api";
import {PostData} from "../shared/types/postData.js";
import {GameUserData} from "../shared/types/userData.js";
import {LeaderboardEntry} from "../shared/types/leaderboardEntry.js";

Devvit.configure({
    redis: true,
    realtime: true,
});

export type RedisService = {
    // Post
    getPostData: (postId:string) => Promise<PostData>;
    savePostData: (postId:string, postData: PostData) => Promise<void>;

    // User
    getUserData: (userId:string) => Promise<GameUserData>;
    saveUserData: (userId:string, userData: GameUserData) => Promise<void>;

    // Leaderboard
    getLeaderboard: (topEntries:number) => Promise<LeaderboardEntry[]>;
    setLeaderboardEntry: (username:string, score:number) => Promise<void>;
}

export function createRedisService(context: Devvit.Context|TriggerContext): RedisService {
    const { redis, realtime } = context;
    return {
        // Post
        getPostData: async (postId:string) => {
            const retrievedConfig = await redis.get(`post_${postId}`);
            console.log('Retrieved config', retrievedConfig, postId);
            return retrievedConfig ? JSON.parse(retrievedConfig) : null;
        },
        savePostData: async (postId:String, config:PostData) => {
            await redis.set(`post_${postId}`, JSON.stringify(config));
            console.log('Saved config', config, postId);
        },

        // User
        getUserData: async (userId:string) => {
            const retrievedConfig = await redis.get(`user_${userId}`);
            console.log('Retrieved user', retrievedConfig, userId);
            return retrievedConfig ? JSON.parse(retrievedConfig) : null;
        },
        saveUserData: async (userId:String, userData:GameUserData) => {
            await redis.set(`user_${userId}`, JSON.stringify(userData));
            console.log('Saved user', userData, userId);
        },

        // Leaderboard
        setLeaderboardEntry: async (username:string, score:number) =>  {
            await redis.zAdd('leaderboard', {member: username, score:score});
            realtime.send('leaderboard_updates', {member:username, score:score});
        },
        getLeaderboard: async (topEntries:number) => {
            const scores = await redis.zRange('leaderboard', 0, topEntries, {reverse:true, by:'rank'});
            return scores.map((score) => {
                return {
                    username: score.member,
                    score: score.score,
                };
            });
        }
    };
}