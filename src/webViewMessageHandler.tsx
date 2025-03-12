import { Devvit, TriggerContext, UseWebViewResult } from "@devvit/public-api";
import { WebViewMessage, DevvitMessage } from "../shared/types/message.js";
import { createRedisService } from "./redisService.js";
import { Product, Order } from "../shared/types/payments.js";
import { Product as DevvitProduct, Order as DevvitOrder, OnPurchaseResult, OrderResultStatus } from "@devvit/payments";
import { PaymentsContext } from "./paymentsContext.js";
import { getNewRandomPoem } from "../data/poems.js";
import { createNewPost as createNewPostUtil } from "../shared/utils/createNewPost.js";
import { createLiveKitService } from "./livekitService.js";
import { createCollaborationService } from "./collaborationService.js";

async function fetchPostData(message: WebViewMessage, webView: UseWebViewResult<DevvitMessage>, context: Devvit.Context) {
    const redisService = createRedisService(context);
    if (!context.postId) {
        console.error("postId is undefined!");
        return;
    }
    const postData = await redisService.getPostData(context.postId);
    webView.postMessage({
      type: 'fetchPostDataReponse',
      data: {
        postData: postData
      },
    });
    console.log('Devvit', 'Sent post data to web view');
}

async function setUserScore(message: WebViewMessage, webView: UseWebViewResult<DevvitMessage>, context: Devvit.Context) {
    if (message.type === 'setUserScore') {
        console.log('Devvit', 'Received user score from web view:', message.data.score);
        const redisService = createRedisService(context);
        const username = (await context.reddit.getCurrentUsername()) ?? 'anon';
        redisService.setLeaderboardEntry(username, message.data.score);
        console.log('Devvit', 'Saved user score to leaderboard:', username, message.data.score);
        webView.postMessage({
            type: 'setUserScoreResponse',
            data: {
                status: 'success'
            },
        });
    }
}

async function fetchLeaderboard(message: WebViewMessage, webView: UseWebViewResult<DevvitMessage>, context: Devvit.Context) {
    if (message.type === 'fetchLeaderboard') {
        console.log('Devvit', 'Fetching leaderboard data');
        const redisService = createRedisService(context);
        const leaderboard = await redisService.getLeaderboard(message.data.topEntries);
        webView.postMessage({
        type: 'fetchLeaderboardResponse',
        data: {
            leaderboard: leaderboard
        },
        });
        console.log('Devvit', 'Sent leaderboard data to web view', leaderboard);
    }
}

async function fetchUserData(message: WebViewMessage, webView: UseWebViewResult<DevvitMessage>, context: Devvit.Context) {
    if (message.type === 'fetchUserData') {
        console.log('Devvit', 'Fetching user data for user:', message.data.userId);
        const redisService = createRedisService(context);
        const dbUserData = await redisService.getUserData(message.data.userId);
        const redditUserData = await context.reddit.getUserById(message.data.userId);
        webView.postMessage({
            type: 'fetchUserDataResponse',
            data: {
                redditUser: {userId: redditUserData!.id, username: redditUserData!.username},
                dbUser: dbUserData
            },
        });
        console.log('Devvit', 'Sent user data to web view');
    }
}

async function setUserData(message: WebViewMessage, webView: UseWebViewResult<DevvitMessage>, context: Devvit.Context) {
    if (message.type === 'setUserData') {
        console.log('Devvit', 'Received user data from web view:', message.data.userData);
        const redisService = createRedisService(context);
        redisService.saveUserData(message.data.userId, message.data.userData);
        webView.postMessage({
            type: 'setUserDataResponse',
            data: {
                status: 'success'
            },
        });
        console.log('Devvit', 'Saved user data to redis:', message.data.userData);
    }
}

export async function fetchAvailableProducts(webView: UseWebViewResult<DevvitMessage>, products: DevvitProduct[]) {
    const webviewProducts = products.map((product) => {
        return {
            sku: product.sku,
            name: product.displayName,
            description: product.description,
            price: product.price,
            imageUrl: product.images?.icon ?? '',
        } as Product;
    });

    webView.postMessage({
        type: 'fetchAvailableProductsResponse',
        data: {
            products: webviewProducts,
            error: '',
        },
    });
    console.log('Devvit', 'Sent available products to web view');
}

export async function fulfillOrder(order: DevvitOrder, context: TriggerContext) {
    const redisService = createRedisService(context);
    const user = await redisService.getUserData(context.userId!);
    if (!user.weapons) {
        user.weapons = [];
    }
    order.products.forEach((product) => {
        user.weapons.push(product.displayName);
    });
    await redisService.saveUserData(context.userId!, user);
    console.log('Devvit', 'Fulfilled order:', order);
}

export async function refundOrder(order: DevvitOrder, context: TriggerContext) {
    // TODO
}

export async function buyProductResponse(result:OnPurchaseResult, webView: UseWebViewResult<DevvitMessage>, context: Devvit.Context) {
    const responseMessage:DevvitMessage = {
        type: 'buyProductResponse',
        data: {
            productSku: result.status === OrderResultStatus.Success ? result.sku : '',
            status: result.status === OrderResultStatus.Success ? 'success' : 'error',
            error: result.errorMessage ?? '',
        },
    }
    webView.postMessage(responseMessage);

    // Show a toast message
    context.ui.showToast(result.status === OrderResultStatus.Success ? 'Purchase successful!' : 'Purchase failed');
}

async function fetchOrders(orders:DevvitOrder[], webView: UseWebViewResult<DevvitMessage>) {
    console.log('Devvit', 'Fetching orders', orders);
    const webviewOrders = orders.map((order) => {
        return {
            orderId: order.id,
            productSku: order.products[0].sku,
            productName: order.products[0].displayName,
            purchaseDate: order.createdAt?.toISOString() ?? '',
            status: order.status,
        } as Order;
    });
    webView.postMessage({
        type: 'fetchOrdersResponse',
        data: {
            orders: webviewOrders
        },
    });
    console.log('Devvit', 'Sent orders to web view', webviewOrders);
}

async function createNewPost(message: WebViewMessage, webView: UseWebViewResult<DevvitMessage>, context:Devvit.Context) {
    // This template creates a new post with a random poem
    // Feel free to delete this method implementation and create your own.
    const postData = await getNewRandomPoem();
    await createNewPostUtil(postData.poemTitle, postData, context);
}

async function getLiveKitToken(message: WebViewMessage, webView: UseWebViewResult<DevvitMessage>, context: Devvit.Context) {
    if (message.type === 'getLiveKitToken') {
        console.log('Devvit', 'Received getLiveKitToken request:', message.data);
        const liveKitService = createLiveKitService(context);
        const token = await liveKitService.generateToken(message.data.sessionId, message.data.participant);
        webView.postMessage({
            type: 'getLiveKitToken',
            data: { token },
        });
        console.log('Devvit', 'Sent LiveKit token to web view');
    }
}

async function createSession(message: WebViewMessage, webView: UseWebViewResult<DevvitMessage>, context: Devvit.Context){
    if (message.type === 'createSession') {
        console.log('Devvit', 'Received create session request', message.data);
        const collaborationService = createCollaborationService(context);
        const session = await collaborationService.createSession(message.data.hostId, message.data.hostUsername);
        webView.postMessage({
            type: 'createSession',
            data: { session },
        });
        console.log('Devvit', 'Sent create session response', session);
    }
}

async function joinSession(message: WebViewMessage, webView: UseWebViewResult<DevvitMessage>, context: Devvit.Context) {
     if (message.type === 'joinSession') {
        console.log('Devvit', 'Received join session request', message.data);
        const collaborationService = createCollaborationService(context);
        const session = await collaborationService.joinSession(message.data.sessionId, message.data.userId, message.data.username);
        webView.postMessage({
            type: 'joinSession',
            data: { session },
        });
        console.log('Devvit', 'Sent join session response', session);
    }
}

async function endSession(message: WebViewMessage, webView: UseWebViewResult<DevvitMessage>, context: Devvit.Context) {
    if (message.type === 'endSession') {
        console.log('Devvit', 'Received end session request', message.data);
        const collaborationService = createCollaborationService(context);
        await collaborationService.endSession(message.data.sessionId);
        webView.postMessage({
            type: 'endSession',
            data: {  },
        });
        console.log('Devvit', 'Sent end session response');
    }
}

export async function handleWebViewMessages(message: WebViewMessage, webView: UseWebViewResult<DevvitMessage>, context: Devvit.Context, paymentsContext:PaymentsContext) {
    switch (message.type) {
        case 'webViewReady':
            await webView.postMessage({ type: 'initialData', data: { userId: context.userId ?? 'anon', postId: context.postId! } });
            break;
        case 'fetchPostData':
            await fetchPostData(message, webView, context);
            break;
        case 'createNewPost':
            await createNewPost(message, webView, context);
            break;
        case 'setUserScore':
            await setUserScore(message, webView, context);
            break;
        case 'fetchLeaderboard':
            await fetchLeaderboard(message, webView, context);
            break;
        case 'fetchUserData':
            await fetchUserData(message, webView, context);
            break;
        case 'setUserData':
            await setUserData(message, webView, context);
            break;
        case 'fetchAvailableProducts':
            await fetchAvailableProducts(webView, paymentsContext.catalog);
            break;
        case 'fetchOrders':
            await fetchOrders(paymentsContext.orders, webView);
            break;
        case 'buyProduct':
            paymentsContext.payments.purchase(message.data.sku);
            break;
        case 'drawingEvent':
            console.log('Devvit', 'Received drawing event:', message.data);
            break;
        case 'getLiveKitToken':
            await getLiveKitToken(message, webView, context);
            break;
        case 'createSession':
            await createSession(message, webView, context);
            break;
        case 'joinSession':
            await joinSession(message, webView, context);
            break;
        case 'endSession':
            await endSession(message, webView, context);
            break;
        default:
          const _exhaustiveCheck: never = message;
          return _exhaustiveCheck;
      }
}
