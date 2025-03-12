import { Order, Product } from "./payments";
import { LeaderboardEntry } from "./leaderboardEntry";
import { GameUserData, RedditUserData } from "./userData";
import { PostData } from "./postData";
import { CollaborationSession, DrawingEvent, Participant } from "./collaboration";

// Messages sent from the web view to Devvit
export type WebViewMessage =
  | { type: 'webViewReady' }
  | { type: 'fetchPostData' }
  | { type: 'createNewPost' }
  | { type: 'setUserScore'; data: { score: number } }
  | { type: 'fetchLeaderboard'; data: { topEntries: number } }
  | { type: 'fetchUserData'; data: { userId: string } }
  | { type: 'setUserData'; data: { userId: string; userData: GameUserData } }
  | { type: 'fetchAvailableProducts' }
  | { type: 'fetchOrders' }
  | { type: 'buyProduct'; data: { sku: string } }
  | { type: 'drawingEvent'; data: DrawingEvent }
  | { type: 'getLiveKitToken', data: { sessionId: string, participant: Participant } }
  | { type: 'createSession', data: { hostId: string, hostUsername: string } }
  | { type: 'joinSession', data: { sessionId: string, userId: string, username: string } }
  | { type: 'endSession', data: { sessionId: string } };

// Messages sent from Devvit to the web view
export type DevvitMessage =
    | { type: 'initialData'; data: { userId: string; postId: string } }
    | { type: 'fetchPostDataReponse'; data: { postData: PostData | null } } // Allow null
    | { type: 'setUserScoreResponse'; data: { status: string } }
    | { type: 'fetchLeaderboardResponse'; data: { leaderboard: LeaderboardEntry[] } }
    | { type: 'fetchUserDataResponse'; data: { redditUser: RedditUserData; dbUser: GameUserData | null } } // Allow null
    | { type: 'setUserDataResponse'; data: { status: string } }
    | { type: 'fetchAvailableProductsResponse', data: { products: Product[], error: string } }
    | { type: 'fetchOrdersResponse', data: { orders: Order[] } }
    | { type: 'buyProductResponse', data: { productSku: string, status: string, error: string } }
    | { type: 'drawingEvent', data: DrawingEvent }
    | { type: 'getLiveKitToken', data: { token: string } }
    | { type: 'createSession', data: { session: CollaborationSession } }
    | { type: 'joinSession', data: { session: CollaborationSession } }
    | { type: 'endSession', data: { session: CollaborationSession } };

// System messages used internally by Devvit
export type DevvitSystemMessage =
    | { type: 'context'; data: Devvit.Context }
    | { type: 'devvit-message'; data: { message: DevvitMessage } };

export type CollaborationResponse = {
    session?: CollaborationSession;
    token?: string;
    error?: string;
};
