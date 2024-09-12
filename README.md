<h1 align="center"><b>AI Belvedere: Chatbot UI for families and small companies</b></h1>

<p align="center">
    <img src="public/apple-touch-icon.png" width="100" />
</p>


## 👋🏻 

AI Belvedere: Chatbot UI for Teams, Small Companies, or Families

A self-hosted chatbot UI indended to facilitate PAYG (Pay-As-You-Go) access to frontier AI LLM models for smaller companies and private groups (friends, families). Focuses on reduced complexity, easy selection of best supported models (currently by OpenAI and Anthropic) for each new chat.

Originally based on "BetterChatGPT" project by Jing Hua (https://github.com/ztjhz/BetterChatGPT), but at this point it was significantly modified with little possibility to merge upstream.

# 🔥 Features

- Currently supports OpenAI and Anthropic models (Google Gemini is TBD)
- Server-Side secure management the API keys, and implement basic usage logging (only metadata, not conversations content)
- Containerized build is tested with deployment to Azure Container Apps (CI/CD workflow provided),
including support for Azure AD Single Sign-On authentication
- Containerized build is tested with deployment to self-hosted Docker environment with authentication with Auth0. This is a good choice for personal and familt deployments.
- Prompt Library
- Dark Mode
- Add Clarification button to quickly amending the previous message (instead of lengtherning the thread)
- Organize chats into folders (with colours), filter chats and folders
- Keeps track and displays tokens count and pricing estimates
- Quick model selection window for new chats (with hotkeys)
- Chat title auto-generation
- Chats, and unsent message drafts are automatically persisted to browser's local storage
- Import / Export of chat history
- Download Chat (markdown, json, PNG)
- Multiple language support (i18n) -> currently narrowed down to English and Russian (other languages i18n existed in the upstream project, but these translations were not maintained with fork changes)

Features that existed in the original project, but were hidden or removed
- Conversation publishing to ShareGPT - removed for privacy considerations
- Conversations sync to Google Drive  - removed for privacy considerations
- Advanced options to edit the thread such as rearranging the messages, changing roles, etc. There was no obvious business use-case, it looked complex, and it did not work with Anthropic models.

# 🛠️ Docker deployment to self-hosted AWS Lightsails VM

   TBD

# 🛠️ Docker deployment to Google Cloud Run

   TBD
   
# 🛠️ Deployment to Azure Container Apps: Step by Step Guide

   1. Create a Resource Group
   2. Create Azure Container Registry (Basic Tier)
      - Enable Admin Access (but no need to retain the password)
   3. Build, tag and push docker image
      - See command examples in the `./github/workflows/docker-image-to-acr.yml` pipeline
   4. Create Azure Key Vault
      - IAM policy type
      - Grant yourself an IAM role Secrets Officer
      - Create secrets named `openai-api-key`, `anthropic-api-key`
   6. Create Azure Container App (and let it automatically create a Container App Environment)
      - Select a container from ACR
      - Define environment variables for the app:
      ```
      AUTH_AAD_EXTERNAL=Y
      AUTH_AUTH0=N
      OPENAI_API_URL=https://api.openai.com/v1/chat/completions
      OPENAI_API_KEY=placeholder
      ANTHROPIC_API_URL=https://api.anthropic.com/v1/messages
      ANTHROPIC_API_KEY=placeholder
      LOG_DESTINATION_AZURE_LOG_ANALYTICS=N
      LOG_DESTINATION_POSTGRESQL=N
      LOG_DESTINATION_CONSOLE=Y
      COMPANY_SYSTEM_PROMPT="... default system prompt"
      ```
      - Enable Ingress to port 5500 (public)
   7. After the Container App is deployed:
      - Configure Scaling (1 .. 1)
      - Define "Secrets" (`openai-api-key`, `anthropic-api-key`) as references to a Key Vault
      - Adjust environment variables (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) to reference these secrets
      - Enable Authentication with Azure Entra ID (details TBD)
   8. Enable Managed Identities and grant IAM Roles:
      - on Key Vault to the Container App [Key Vault Secrets User]
      - on ACR to the Container App [Role: AcrPull Role]

# 🛠️ For Azure Container Apps, enabling logging to Azure Logs Analytics workspace (optional)

   TBD step-by-step guide on creating ALA Workspace, Data Collection Endpoint, and Data Source tables;
   
   TBD configuring environment variables;

   TBD managed identity grants

   TBD validation and recommended Kusto queries

# 🛠️ Running it locally with client app pre-built and statically served

This local running mode is useful for testing authentication-related code and configurations (ex. with Auth0)

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

      LOG_DESTINATION_AZURE_LOG_ANALYTICS=N;
      LOG_DESTINATION_POSTGRESQL=N;
      LOG_DESTINATION_CONSOLE=Y;

      COMPANY_SYSTEM_PROMPT="... default system prompt"

      AUTH_AUTH0=N
      AUTH_AAD_EXTERNAL=N
      ```

4. Create .env.production file to configure client-side build
      ```
      VITE_COMPANY_NAME=(Your Preferred Company/Group/Family name)
      VITE_ANTHROPIC_ENABLE=Y
      VITE_CHECK_AAD_AUTH=N
      ```

5. Run `npm install`

6. Launch the app by running `**npm run client-build && npm run server**`

7. Navigate to http://localhost:5500
   

# 🛠️ Running it locally for client-side debugging through Vite

This local running mode is useful for debugging React client code

1. Ensure that you have the following installed:

   - [node.js](https://nodejs.org/en/) (v14.18.0 or above)
   - [npm](https://www.npmjs.com/) (6.14.15 or above)

2. Clone this repository

3. Create .env.server.local and .env.develipment files

   Same as above. See previous chapter "Running it locally with client app built and statically served by the Server"

5. Run `npm install`

6. Launch the app by running `**npm run dev**`

7. Navigate to http://localhost:5173

8. **When the app loads, in Settings -> API Settings, chose "Development Endpoint" (localhost:5500/api)**
