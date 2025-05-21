# blackboxai-1741784466291
Built by https://www.blackbox.ai

## Development and Build Process

This project consists of a main Devvit application and a React-based webview application located in the `web-view-app` directory.

**Important Build Step:**

Before building or deploying the main Devvit application, you **must** build the webview application first. This step ensures that the necessary static assets for the webview are correctly generated and placed in the `webroot` directory, which the Devvit app expects.

To build the webview application:

1.  Navigate to the webview application directory:
    ```bash
    cd web-view-app
    ```
2.  Install dependencies (if you haven't already):
    ```bash
    npm install
    ```
    (or `yarn install`)
3.  Run the build script:
    ```bash
    npm run build:webroot
    ```
    (or `yarn build:webroot`)

This will populate the `webroot` directory with `game.html` and other necessary assets for the webview to function correctly within Devvit.
