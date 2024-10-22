<h1 align="center"><b>AI Belvedere</b></h1>

<p align="center">
    <img src="public/apple-touch-icon.png" width="100" />
</p>


## 👋🏻 

AI Belvedere: Chatbot UI for Teams, Small Companies, or Families

A self-hosted chatbot UI indended to facilitate PAYG (Pay-As-You-Go) access to frontier AI LLM models for companies and small private groups (friends, families). Focuses on reduced complexity, easy selection of best supported models (currently by OpenAI and Anthropic).
It is a full-stack app with a thin server-side part (API keys are server-side) and supports multi-user authentication by OpenID providers (Auth0 and Azure AD Single Sign-On) - but chat history is only stored locally on device and not logged by the back-end.

Originally based on "BetterChatGPT" project by Jing Hua (https://github.com/ztjhz/BetterChatGPT), but at this point it was significantly modified with little possibility to merge upstream.

# 🔥 Features

- Supports Anthropic and OpenAI models, including o1 (configurable, can be enabled or disabled)
- Server-Side handling of API keys, with basic usage logging (only metadata, not conversations content)
- For Organizations: containerized deployment to Azure Container Apps (CI/CD workflow provided) with Azure AD Single Sign-On authentication, and metadata logging to Azure Logs Analytics workspace
- For Personal Use, Friends, and Families: containerized deployment to self-hosted Docker, or to serverless full stack hosting platforms such as Render.com and Koyeb.com, with users authentication by Auth0
- Prompt Library
- Dark Mode
- Keeps track and displays tokens count, and accumulated cost estimates
- Quick model selection window for new chats for best frontier models (with hotkeys)
- Chats, and unsent message drafts are persisted to browser's local storage. Not stored server-side and not availab
- Import / Export of chat history
- Download Chat (markdown, json, png)
- Multiple language support (i18n) -> currently narrowed down to English and Russian. Other languages i18n existed in the upstream project, but these translations were not maintained with fork changes, and currently removed

# 🔥 Screenshots

Main Screen - Chats

![Main Screen Screenshot](documentation/main_screen.png)

New Chat model selection window

![Models Selection Screenshot](documentation/models_selection.png)

# ⏳ Future Roadmap. Planned aspirationally
- Attached Images support (Vision capability)
- Improve local content storage using IndexedDB. Currently the application becomes sluggish with many stored chats, and periodic chat history cleanups are recommended for smooth experience. This may be improved in the future.
- Add support for Google Gemini API models, and keep evolving the model selection window to keep up with the evolving landscape of frontier models 
- Integration with PostrgreSQL for server-side storage of user settings, prompt library, etc. Settings are currently only stored on device.


# 🛠️ Deployment to Koyeb.com + Auth0

### Why Koyeb.com? 
- As of September 2024, Koyeb.com serverless platform provides Free Tier plan that is sufficient for this deployment 
- Similar free tier are available at Render.com and few other providers - but these will be spinning down the application when it's was not used and will have a significant cold start delay.
- Koyeb.com free tier appears to have a negligible cold start delay; And the lowerst "Eco Nano" paid instance is just $1.61/month and should have no cold start delay at all

## Deployment Guide

   1. Register on Koyeb.com, free "hobbyist" plan is enough
   
   2. Create a Service -> Web Service -> Docker

   3. Configure Docker Image

      - Repository: `docker.io/dmitriyalergant/ai-belvedere:latest`
      - Environment variables:
         - `SERVER_PORT=5500`
         - `OPENAI_API_URL=https://api.openai.com/v1/chat/completions`
         - `OPENAI_API_KEY=(your project API key for OpenAI)`
         - `ANTHROPIC_API_URL=https://api.anthropic.com/v1/messages`
         - `ANTHROPIC_API_KEY=(your API key for Anthropic)`
         - `LOG_DESTINATION_AZURE_LOG_ANALYTICS=N`
         - `LOG_DESTINATION_POSTGRESQL=N`
         - `LOG_DESTINATION_CONSOLE=Y`
         - `COMPANY_SYSTEM_PROMPT="A brief defauly system prompt instrusting LLM of its name (e.g. Belvedere), its role as an AI assistant to your family; Introducing your family to the AI Belvedere chatbot: who you are, what languages you speak, etc."`
         - `COMPANY_NAME= Your Company Name or Your Fmaily Name`
         - `DEMO_MODE=N`
         - `AUTH_AUTH0=N` for now, only temporary, until Auth0 is configured!

      - Exposed ports: 5500

      - Validate app via the Koyeb-provided app URL (e.g.: https://gleaming-creater-something-something-213123432423.koyeb.app/)
      
      - At this point it should work, but still does not require authentication. Unsafe!

   4. Optionally: upgrade to a Starter plan to attach a Custom Domain

      -  You will need to purchase a domain separately with any domain registrar, and point it to Koyeb

      -  See https://www.koyeb.com/docs/run-and-scale/domains#create-and-assign-your-domain-to-a-koyeb-app for more details

   5. Create an account on Auth0.com, create an Application (ex: "AI Belvedere - Appleseed family")

      - Add application logo (use public/favicon-516x516.png from this repo)

      - Application type: Regular Web App

      - Application Login URI: leave blank
      
      - Allowed Callback URLs: https://gleaming-creater-something-something-213123432423.koyeb.app/callback

      - Allowed Logout URLs: https://gleaming-creater-something-something-213123432423.koyeb.app/
        **Note: trailing / is important**

      - Allowed Web Origins: https://gleaming-creater-something-something-213123432423.koyeb.app
        **Note: no trailing slashes**

      - Allow Cross-Origin Authentication: Yes

      - Allowed Origins (CORS): https://gleaming-creater-something-something-213123432423.koyeb.app
        **Note: no trailing slashes**

      - ID Token Expiration: 2592000
      
   3. In Auth0, **do not create Social login connectors**. If Google was enabled by default, remove it. With social logins enabled, Auth0 will not limit the users to a predefined list of allowed users: anyone on the web will be able to sign up and use LLM under your API keys. You don't want that

   4. In Auth0, in the User Management tab, create initial users with passwords. They will need to verify their emails (a verification email should come automatically)

   5. Go back to Koyeb app and add the following environment variables to enable authentication with Auth0

      - `AUTH_AUTH0=Y`
      - `OIDC_BASEURL=https://gleaming-creater-something-something-213123432423.koyeb.app/`
      - `OIDC_CLIENTID=Your Auth0 ClientID from the application that was created there`
      - `OIDC_ISSUERBASEURL=Your Auth0 application URL, e.g. https://dev-llkj2l34kj34lj3455.us.auth0.com`
      - `AUTH_SECRET=(any random string)`

   6. Test the app by navigating to the Koyeb-provided URL again. It should now properly authenticate users
   
# 🛠️ Deployment to Azure Container Apps

   1. Create a Resource Group
   2. Create Azure Container Registry (Basic Tier)
      - Enable Admin Access (but no need to retain the password)
   3. Build, tag and push docker image
      - Configure VITE environmen variables for the docker image
      - See command examples in the `./github/workflows/docker-image-to-acr.yml` pipeline
   5. Create Azure Key Vault
      - IAM policy type
      - Grant yourself an IAM role Secrets Officer
      - Create secrets named `openai-api-key`, `anthropic-api-key`
   6. Create Azure Container App (and let it automatically create a Container App Environment)
      - Select a container from ACR
      - Define environment variables for the app:
      ```
      OPENAI_API_URL=https://api.openai.com/v1/chat/completions
      OPENAI_API_KEY=placeholder
      ANTHROPIC_API_URL=https://api.anthropic.com/v1/messages
      ANTHROPIC_API_KEY=placeholder
      LOG_DESTINATION_AZURE_LOG_ANALYTICS=N
      LOG_DESTINATION_POSTGRESQL=N
      LOG_DESTINATION_CONSOLE=Y
      COMPANY_SYSTEM_PROMPT=A brief defauly system prompt instrusting LLM of its name (e.g. Belvedere), its role as an AI assistant to your family; Introducing your family to the AI Belvedere chatbot: who you are, what languages you speak, etc.
      COMPANY_NAME=Your Company Name or Your Fmaily Name
      ANTHROPIC_ENABLE=Y
      OPENAI_O1_ENABLE=Y
      DEMO_MODE=N
      AUTH_AUTH0=N
      AUTH_AAD_EXTERNAL=Y
      ```
      - Enable Ingress to port 5500 (public)
   7. After the Container App is deployed:
      - Configure Scaling (1 .. 1)
      - Define "Secrets" (`openai-api-key`, `anthropic-api-key`) as references to a Key Vault
      - Adjust environment variables (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) to reference these secrets
   8. Enable Authentication with Azure Entra ID
      - Details TBD, requires registration of an Azure App
   10. Enable Managed Identities and grant IAM Roles:
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

      COMPANY_SYSTEM_PROMPT=A brief defauly system prompt instrusting LLM of its name (e.g. Belvedere), its role as an AI assistant to your family; Introducing your family to the AI Belvedere chatbot: who you are, what languages you speak, etc.
      COMPANY_NAME=Your Company Name or Your Fmaily Name
      DEMO_MODE=N
      AUTH_AAD_EXTERNAL=N
      AUTH_AUTH0=N
      ```

4. Create .env.production file to configure client-side build
      ```
    VITE_ANTHROPIC_ENABLE=Y
    VITE_OPENAI_O1_ENABLE=Y
    VITE_CHECK_AAD_AUTH=N
    VITE_LOGOUT_URL=/logout
    VITE_LOGIN_URL=/login
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
