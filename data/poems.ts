import { PostData } from '../shared/types/postData.js';
const poems =  [
    {
    "id": 1,
    "title": "Blank Canvas",
    "body": "White space waiting,\nInfinite possibilities—\nOne brushstroke changes all."
    },
    {
    "id": 2,
    "title": "Spark",
    "body": "A thought ignites,\nTiny ember in darkness.\nFan it to flame."
    },
    {
    "id": 3,
    "title": "The Muse Calls",
    "body": "She whispers secrets\nIn languages of color,\nSound, and memory."
    },
    {
    "id": 4,
    "title": "Uncharted Paths",
    "body": "No maps exist\nFor the journey ahead—\nYou make the way by walking."
    },
    {
    "id": 5,
    "title": "Creation's Dance",
    "body": "Chaos and order,\nPartners in eternal waltz.\nBeauty emerges."
    },
    {
    "id": 6,
    "title": "Mind Untethered",
    "body": "Break the chains of\n'Should' and 'always been'—\nFly toward the unknown."
    },
    {
    "id": 7,
    "title": "First Light",
    "body": "Something from nothing,\nA universe born from void—\nYour hands, creating."
    },
    {
    "id": 8,
    "title": "Permission",
    "body": "The greatest gift:\nAllowing yourself to fail,\nThen try once more."
    },
    {
    "id": 9,
    "title": "Connecting Dots",
    "body": "Old ideas meeting,\nForming unexpected bonds—\nNew life emerges."
    },
    {
    "id": 10,
    "title": "The Inner Well",
    "body": "Deep within you:\nEndless source of wonder waits.\nDraw from it daily."
    }
];
// In this template, each new post will be a random poem.
// Feel free to delete this method and create your own.
export async function getNewRandomPoem(): Promise<PostData> {
    const randomIndex = Math.floor(Math.random() * poems.length);
    const poem = poems[randomIndex];
    const postData: PostData = {
        poemTitle: poem.title,
        poemBody: poem.body,
    };    
    return postData;
}