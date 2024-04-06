<h1 align="center"><b>New AI Assistant UI</b></h1>

<p align="center">
    <a href="https://bettergpt.chat" target="_blank"><img src="public/apple-touch-icon.png" width="100" /></a>
</p>


## 👋🏻 New AI Assistant UI for Teams, Groups, or Families

A new ChatBot UI Front-End indended to provide Pay-as-you-Go access to best AI LLM models for small teams or private groups (families).

Focuses on reduced complexity, easy selection of best supported models (currently by OpenAI and Anthropic) for each new chat.

Server-side handling of API Keys (coming from Environment Variables), and basic logging (for usage analysis, who used how much).

Currently made for deployment into an Azure Container App with Azure AD Authentication, but that may evolve soon.

Originally based on "BetterChatGPT" project by Jing Hua (https://github.com/ztjhz/BetterChatGPT), but at this point it was significantly modified with little possibility to merge upstream.

# 🔥 Features

- Currently supports OpenAI and Anthropic models; Anthropic models support is configurable (can be enabled or disabled).
- Server-Side Proxy to secure the API keys, and implement basic usage logging (only metadata, not conversations content)
- Basic support for Azure AD authentication by Azure Container Apps: logout button, authentication redirect on session expiration.
- Prompt Library
- Dark Mode
- Add Clarification button to quickly amending the previous message (instead of lengtherning the thread)
- Organize chats into folders (with colours), filter chats and folders
- Keeps track and displays tokens count and pricing estimates
- Quick model selection window for new chats (with hotkeys)
- Chat title generation (uses GPT-3.5 or Haiku)
- Chats, and unsent message drafts are automatically persisted to browser's local storage
- Import / Export
- Download chat (markdown, json, PNG)
- Multiple language support (i18n) -> currently narrowed down to English and Russian
    (other languages i18n existed in the upstream project, but these translations were not maintained with fork changes)

Features that existed in the original project, but were hidden or removed
- Conversation publishing to ShareGPT - removed for privacy considerations
- Conversations sync to Google Drive  - removed for privacy considerations
- Advanced options to edit the thread such as rearranging the messages, changing roles, etc. There was no obvious business use-case, it looked complex, and did not play well with Anthropic.

# 🛠️ Deployment to Azure

   ```
      1. Create a Resource Group
      2. Create Azure Container Registry (Basic Tier)
         - Enable Admin Access (but no need to retain the password)
      3. Build, tag and push docker image
         - See command examples in the `./github/workflows/docker-image-to-acr.yml` pipeline
      4. Create Azure Key Vault
         - IAM policy type
         - Grant yourself an IAM role Secrets Officer
         - Create secrets with `openai-api-key`, `anthropic-api-key`
      5. Create a Log Analytics Workspace
         - Create a Data Collection Endpoint in Azure Monitor
         - Create Custom Tables in Log Analytics (which will automatically create a Data Collection Rule)
      6. Create Azure Container App (and let it automatically create a Container App Environment)
         - Select a container from ACR
         - Define environment variables:
         - `OPENAI_API_URL=https://api.openai.com/v1/chat/completions`
         - `OPENAI_API_KEY=placeholder`
         - `ANTHROPIC_API_URL=https://api.anthropic.com/v1/messages`
         - `ANTHROPIC_API_KEY=placeholder`
         - `AZURE_LOG_ANALYTICS_RESOURCE_URI=https://your-data-collectionendpoint.eastus-1.ingest.monitor.azure.com`
         - `AZURE_LOG_ANALYTICS_DCR_IMMUTABLE_ID=dcr-immutable-id-of-data-collection-rule`
         - `AZURE_LOG_ANALYTICS_REQ_LOGS_DS=Custom-chatbot_app_api_requests_CL`
         - `AZURE_LOG_ANALYTICS_RES_LOGS_DS=Custom-chatbot_app_api_responses_CL`
         - Enable Ingress to port 5500 (public)
      7. After the Container App is deployed:
         - Configure Scaling (1 .. 1)
         - Define "Secrets" (`openai-api-key`, `anthropic-api-key`) as references to a Key Vault
         - Adjust environment variables (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) to reference these secrets
         - Enable Authentication with Azure AD Entra ID (details TBD)
      8. Enable Managed Identities and grant IAM Roles:
         - on Key Vault to the Container App [Key Vault Secrets User]
         - on ACR to the Container App [Role: AcrPull Role]
         - on Data Collection Rule (!) to the Container App [Role: something something Metrics Publisher]
   ```

# 🛠️ Running it locally
## Client-Side is pre-built and statically served by the Server

1. Ensure that you have the following installed:

   - [node.js](https://nodejs.org/en/) (v14.18.0 or above)
   - [npm](https://www.npmjs.com/) (6.14.15 or above)

2. Clone this repository

3. Create .env.server.local file to configure server-side
      ```
      OPENAI_API_URL=https://api.openai.com/v1/chat/completions
      OPENAI_API_KEY=...
      ANTHROPIC_API_URL=https://api.anthropic.com/v1/messages
      ANTHROPIC_API_KEY=...
      ```

4. Create .env.production file to configure client-side build
      ```
      VITE_COMPANY_NAME=(Your Company/Team/Family name)
      VITE_ANTHROPIC_ENABLE=Y
      VITE_USE_AAD_AUTH=N
      ```

5. Run `npm install`

6. Launch the app by running `**npm run client-build && npm run server**`

7. Navigate to http://localhost:5500
   

# 🛠️ Running it locally for client-side debugging 
## (Server-Side provides the API, Client-Side is served through Vite)

1. Ensure that you have the following installed:

   - [node.js](https://nodejs.org/en/) (v14.18.0 or above)
   - [npm](https://www.npmjs.com/) (6.14.15 or above)

2. Clone this repository

3. **Create .env.server.local file** to configure server-side
      ```
      OPENAI_API_URL=https://api.openai.com/v1/chat/completions
      OPENAI_API_KEY=...
      ANTHROPIC_API_URL=https://api.anthropic.com/v1/messages
      ANTHROPIC_API_KEY=...
      ```

4. **Create .env.develipment file** to configure client-side
      ```
      VITE_COMPANY_NAME=(Your Company/Team/Family name)
      VITE_ANTHROPIC_ENABLE=Y
      VITE_USE_AAD_AUTH=N
      ```

5. Run `npm install`

6. Launch the app by running `**npm run dev**`

7. Navigate to http://localhost:5173
  
# 🛠️ Running it locally using docker compose

1. Ensure that you have the following installed:

   - [docker](https://www.docker.com/) (v24.0.7 or above)
      ```bash
      curl https://get.docker.com | sh \
      && sudo usermod -aG docker $USER
      ```

2. Build the docker image
   ```
   docker compose build
   ```

3. Build and start the container using docker compose
   ```
   docker compose build
   docker compose up -d
   ```

4. Stop the container
   ```
   docker compose down
   ```
