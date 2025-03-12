import { DevvitMessage, WebViewMessage, DevvitSystemMessage } from '../../../shared/types/message';

export interface DevvitMessageHandler {
    setMessageHandler: (handler: (message: DevvitSystemMessage) => void) => void;
    postMessage: (message: WebViewMessage) => void;
}
  
export class DevvitMockedResponses implements DevvitMessageHandler {
    private messageHandler!: (message: DevvitSystemMessage) => void;

    postMessage(message: WebViewMessage) {
      this.mockWebViewMessageResponse(message);
    }
    setMessageHandler(handler: (message: DevvitSystemMessage) => void) {
      this.messageHandler = handler;
    }

    sendMockedResponse(message: DevvitMessage) {
        this.messageHandler({
            type: 'devvit-message',
            data: { message }
        });
    }
    
    mockWebViewMessageResponse(message: WebViewMessage): void {
        console.log('WebView Mocked Responses', 'Handling message', message);
        switch (message.type) {
            case 'webViewReady':
                this.sendMockedResponse({
                    type: 'initialData',
                    data: {
                        userId: 'anon',
                        postId: '123'
                    }
                })
                break;
            case 'fetchPostData':
                this.sendMockedResponse({
                    type: 'fetchPostDataReponse',
                    data: {
                        postData: {
                            poemTitle: 'A new poem',
                            poemBody: 'This is a new poem',
                        }
                    }
                });
                break;
            case 'createNewPost':
                // no-op
                break;
            case 'setUserScore':
                this.sendMockedResponse({
                    type: 'setUserScoreResponse',
                    data: {
                        status: 'success'
                    }
                });
                break;
            case 'setUserData':
                this.sendMockedResponse({
                    type: 'setUserDataResponse',
                    data: {
                        status: 'success'
                    }
                });
                break;
            case 'fetchLeaderboard':
                this.sendMockedResponse({
                    type: 'fetchLeaderboardResponse',
                    data: {
                        leaderboard: [
                            { username: 'anon2', score: 200 },
                            { username: 'anon3', score: 300 },
                        ]
                    }
                });
                break;
            case 'fetchUserData':
                this.sendMockedResponse({
                    type: 'fetchUserDataResponse',
                    data: {
                        redditUser: { userId: 'anon', username: 'anon' },
                        dbUser: { favoriteColor: 'blue', weapons:[] },
                    }
                });
                break;
            case 'fetchAvailableProducts':
                this.sendMockedResponse({
                    type: 'fetchAvailableProductsResponse',
                    data: {
                        products: [
                            { sku: '123', description: 'Product 1', name: 'Product 1', price: 25, imageUrl: 'https://via.placeholder.com/150' },
                            { sku: '234', description: 'Product 2', name: 'Product 2', price: 200, imageUrl: 'https://via.placeholder.com/150' },
                        ],
                        error: ''
                    }
                });
                break;
            case 'fetchOrders':
                this.sendMockedResponse({
                    type: 'fetchOrdersResponse',
                    data: {
                        orders: [
                            { orderId: '123', productSku: '123', productName: 'Product 1', purchaseDate: '2021-01-01', status: 'completed' },
                            { orderId: '234', productSku: '234', productName: 'Product 2', purchaseDate: '2021-01-02', status: 'completed' },
                        ],
                    }
                });
                break;
            case 'buyProduct':
                this.sendMockedResponse({
                    type: 'buyProductResponse',
                    data: {
                        productSku: message.data.sku,
                        status: 'success',
                        error: ''
                    }
                });
                break;
            
        };
    } 
}

const devvitMockedResponses = new DevvitMockedResponses();
export default devvitMockedResponses;