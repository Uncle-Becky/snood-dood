# "Devvit as a Backend" template

This is a template aimed at web developers that provides scaffolding for building web view-powered Devvit apps.

The goal of this template is to spend as little time as possible configuring the Devvit side of the application (also known as Blocks) and to spend more time focusing on building the web application.

Here's what it provides:

 - Pre-built Devvit scaffolding for common operations:
    - Create a new post
    - Read/write post data to Redis
    - Read/write user data to Redis
    - List In-App purchases product catalog
    - List In-App purchases orders for current user
    - Trigger In-App purchase to buy product
    - Add player score to leaderboard
    - Retrieve leaderboard
 - A `DevvitClient.js` file to send messages to Devvit and handle its responses

## Examples
To showcase how this template makes it easier to use Devvit as a Backend and focus on the Web View code, here are some example usages:

### 1. Use Payments

List available products:

```typescript

// Request available producs from Devvit
devvitClient.postMessage({ type: 'fetchAvailableProducts' });

// Handle Response from Devvit
devvitClient.on('fetchAvailableProductsResponse', (message) => {
    if ('products' in message.data) {
        console.log('Products loaded.');
        console.log(message.data.products as Product[]);
    }
});
```

Purchase product
```typescript
// This triggers the payment flow on the Devvit app
devvitClient.postMessage({ type: 'buyProduct', data: { selectedProductSku } });

// The message that returns from Devvit will say if the purchase was a success or not
devvitClient.on('buyProductResponse', (message) => {
    if ('status' in message.data) {
        console.log(`Payment flow completed: ${message.data.status}`);
    }
});
```

As expected in any web application, the user's inventory of purchased items is stored in the backend. So in this example, the Devvit backend needs to be modified to customize the product catalog.Here's an example of how that modification would be made

```typescript
// 1. Modify src/products.json
{
    "sku": "flower_pot_1",
    "displayName": "Basic Flower Pot",
    "description": "A flower pot with capacity for 1 flower",
    "price": 25,
    "metadata": {
        "category": "pots"
    },
    "accountingType": "DURABLE"
}

// 2. Modify the user model in shared/userData.ts
export type GameUserData = {
    favoriteColor: string;
    //weapons: string[]; // -> Get rid of weapons
    flowerPots:string[]; // <- Add your new product to the user model
}

// 3. Modify the `fulfillOrder` handler at `src/webViewMessageHandler.ts`
export async function fulfillOrder(order: DevvitOrder, context: TriggerContext) {
    //...
    order.products.forEach((product) => {
        user.flowerPots.push(product.displayName);
    });
    // The rest of the fulfillOrder method already takes care of persisting this to Redis
    //...
}

// And that's it. Now you've configured your own products and everything else will work accordingly (fetch user data, fetch products, fetch orders, etc.)
```

## Extending the User Model and Post Model
As demonstrated above, this template is built in a way that the User Model and the Post Model are extensible. Just by modifying the classes in `shared/userData.ts` and `shared/postData.ts` to better represent the data you want stored in your user and post, you will get the benefit of compile-time typechecks that will keep your Devvit application and your web application in sync. Modifying these models should enable you to take full advantage of the Redis persistence and message handling.

Modifying the user model:
```typescript
// 1. Modify `shared/userData.ts`
export type GameUserData = {
    farmName:string;
    flowerPots:string[];
    flowerSeeds:string[];
    tools:string[];   
    myAwesomeProperty:number;
    //...
}

// 2. Request user data in web view:
devvitClient.postMessage({ type: 'fetchUserData', data: { userId: devvitClient.userId! } });

// 3. Handle response from Devvit
devvitClient.on('fetchUserDataResponse', (message) => {
    console.log('Received user data', message);
    // Upon response, you'll receive a strongly-typed user object with the custom properties defined in your model
    if ('dbUser' in message.data) {
        const currentUser = message.data.dbUser as GameUserData;
        console.log(`User's farm is called ${currentUser.farmName}`);
    }
    // You will also receive a second object with the user's information from the Reddit API:
    if ('redditUser' in message.data) {
        const redditUserInfo = message.data.redditUser as RedditUserData;
        console.log(`Reddit username: ${redditUserInfo.username}`);
    }
});

// And that's it. Now all database-related operations of the user are handled for you without needing to customize the Devvit code.
```

The example above is also valid for the Post Data model in `shared/postData.ts`

## Creating new posts
This template has a simple use case of creating posts with poems. 
Here's how you can modify the Post Model and configure it to create posts for your app:
```typescript
// 1. Modify the Post Model in `shared/postData.ts`
export type PostData = {
  puzzleTitle:string;
  puzzleBoard:number[];
  myCustomProperty1:string;
  //...
};

// 2. Modify how you want a new post to be created in `webViewMessageHandler.tsx`
export async function createNewRandomPost(context:Devvit.Context) {
    // ...
    // Your logic here..
    // ...
    createNewPost(postTitle, postData, context);
}

// 3. Similarly, you should modify the post creation context menu in `menuActions.tsx`
Devvit.addMenuItem({
  label: 'Create a new My Awesome App post',
  location: 'subreddit',
  onPress: async (_event, context) => {
    // ...
    // Your logic here...
    // ...
    await createNewPost(postTile, postData, context);
  },
});
```

## Mocked Responses
For convenience, while developing the web view app in a local environment, you can set the DevvitClient to use only locally mocked responses. 
It accepts an argument in its constructor to set the messages to be routed to a local handler that will mock responses instead of trying to send them to Devvit. By default this will be set to false.
You can use it in your application and connect it to environment variables or build-time command-line arguments to set the correct environment when developing locally.

```typescript
const useMockedResponses = true;
devvitClient.initialize(useMockedResponses);
```

If you want to change the mocked responses, you can refer to the file `DevvitMockedResponses.ts`
```typescript
// ...
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
```



## Building and testing this template

Install dependencies:
```
npm install
```

### Build and run the template to test on your subreddit:

First, change the "useMockedResponses" argument to the `DevvitClient` initialization:
```typescript
// web-view-app/src/App.ts
const useMockedResponses = false;
```

Then run:
```
npm run build
devvit upload
devvit playtest r/my_test_subreddit
```

### Build it and run locally on your local server
First, change the "useMockedResponses" argument to the `DevvitClient` initialization:
```typescript
// web-view-app/src/App.ts
const useMockedResponses = true;
```

Then run:
```
npm run dev
```


Once you've tested and it works, the idea is that you can delete most or all of the web-view-app folder and start your web development from scratch, keeping the DevvitClient.ts as a library to perform all communications with Devvit as the backend of your web app (which should be built into the `/webroot` folder)


