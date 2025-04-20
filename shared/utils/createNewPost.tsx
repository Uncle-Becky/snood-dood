import { Devvit } from "@devvit/public-api";
import { createRedisService } from "../../src/redisService.js";
import { PostData } from "../types/postData.js";

export async function createNewPost(
  title: string,
  postData: PostData,
  context: Devvit.Context
) {
  const { reddit, ui } = context;

  const post = await reddit.submitPost({
    subredditName: context.subredditName!,
    title,
    text: postData.poemBody,
  });

  const redisService = createRedisService(context);
  await redisService.savePostData(post.id, postData);

  ui.showToast({ text: "Created post!" });
  ui.navigateTo(post);
}
