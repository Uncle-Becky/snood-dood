import { PostData } from '../shared/types/postData.js';
const poems = [
    {
        poemTitle: "Whispers of the Wind",
        poemBody: `The wind whispers secrets old,\nThrough rustling leaves, stories unfold.\nA gentle breeze, a raging storm,\nNature's breath, forever warm.`
    },
    {
        poemTitle: "City Lights",
        poemBody: `City lights paint the night,\nA canvas dark, with stars so bright.\nConcrete dreams and hurried pace,\nA million souls in a crowded space.`
    },
    {
        poemTitle: "Silent Snowfall",
        poemBody: `Silent snowfall, soft and white,\nBlanketing the world in quiet light.\nA peaceful hush, a serene scene,\nWinter's beauty, pure and clean.`
    },
    {
        poemTitle: "Ocean's Roar",
        poemBody: `Ocean's roar, a powerful sound,\nWaves crashing, on sandy ground.\nVast and deep, a mystery,\nEndless blue, for all to see.`
    },
    {
        poemTitle: "Desert Bloom",
        poemBody: `Desert bloom, a vibrant hue,\nLife persists, where water's few.\nA resilient heart, a thorny crown,\nBeauty thrives, where sun beats down.`
    }
];
// In this template, each new post will be a random poem.
// Feel free to delete this method and create your own.
export async function getNewRandomPoem(): Promise<PostData> {
    const randomIndex = Math.floor(Math.random() * poems.length);
    const poem = poems[randomIndex];
    const postData: PostData = {
        poemTitle: poem.poemTitle,
        poemBody: poem.poemBody,
    };
    return postData;
}
