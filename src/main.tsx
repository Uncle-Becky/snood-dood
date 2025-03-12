import './menuActions.js';

import { Devvit, useState, useWebView } from '@devvit/public-api';

import type { DevvitMessage, WebViewMessage } from '../shared/types/message.js';
import { buyProductResponse, fulfillOrder, handleWebViewMessages, refundOrder } from './webViewMessageHandler.js';
import { addPaymentHandler, useProducts, usePayments, useOrders } from '@devvit/payments';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

addPaymentHandler({
  fulfillOrder: fulfillOrder,
  refundOrder: refundOrder
});

// Add a custom post type to Devvit
Devvit.addCustomPostType({
  name: 'Web View Example',
  height: 'tall',
  render: (context) => {
    // Load username with `useAsync` hook
    const [username] = useState(async () => {
      return (await context.reddit.getCurrentUsername()) ?? 'anon';
    });

    const catalog = useProducts(context);
    const payments = usePayments(async (result) => {
      buyProductResponse(result, webView, context);
    });

    const orders = useOrders(context);

    const webView = useWebView<WebViewMessage, DevvitMessage>({
      // URL of your web view content
      url: 'game.html',

      // Handle messages sent from the web view
      async onMessage(message: WebViewMessage, webView) {
        const paymentsContext = {
          catalog: catalog.products,
          orders: orders.orders,
          payments: payments,
        }
        await handleWebViewMessages(message, webView, context, paymentsContext);        
      },
      onUnmount() {
        context.ui.showToast('Web view closed!');
      },
    });

    // Render the custom post type
    return (
      <vstack grow padding="small">
        <vstack grow alignment="middle center">
          <text size="xlarge" weight="bold">
            Example App
          </text>
          <spacer />
          <vstack alignment="start middle">
            <hstack>
              <text size="medium">Username:</text>
              <text size="medium" weight="bold">
                {' '}
                {username ?? ''}
              </text>
            </hstack>
          </vstack>
          <spacer />
          <button onPress={() => webView.mount()}>Launch App</button>
        </vstack>
      </vstack>
    );
  },
});

export default Devvit;
