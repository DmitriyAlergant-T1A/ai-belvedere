import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import logRequestRouter from './logging/logging-router.js';
import os from 'os';
import { handleApiRequest } from './api-providers/api-provider-http-api-generic.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const requestId = uuidv4();

  try {
    const { requestedProvider, userProfileEmail, requestPurpose } = extractRequestInfo(req);

    if (process.env.DEMO_MODE=='Y') {
      const demoProviderModule = await import(`./api-providers/api-provider-demo.js`)
      await demoProviderModule.handleDemoRequest(req, res, requestPurpose);
      return; 
    }

    const providerModule = await import(`./api-providers/api-provider-${requestedProvider}.js`);    

    const { provider, apiUrl, authHeader, requestPayload } = providerModule.prepareRequest(req, userProfileEmail);

    logRequestRouter("Chat Completions Request", requestId, {
      principal: userProfileEmail,
      requestSize: req.headers['content-length'],
      model: requestPayload.model,
      provider: provider,
      purpose: requestPurpose,
      headers: ""
    });

    let result;

    const apiReqHeaders = {
      hostname: new URL(apiUrl).hostname,
      path: new URL(apiUrl).pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
    };
    result = await handleApiRequest(req, res, apiReqHeaders, requestPayload, provider, requestId, userProfileEmail, requestPurpose, providerModule);

    logRequestRouter("Chat Completions Response", requestId, {
      principal: userProfileEmail,
      requestStreaming: req.body.stream,
      requestSize: req.headers['content-length'],
      responseSize: result.responseSize.toString(),
      responseSizeDataChunks: result.responseSizeDataChunks,
      model: requestPayload.model,
      provider: provider,
      purpose: requestPurpose,
      headers: "",
      apiResponseCode: result.apiResponseCode,
      apiRequestID: result.apiRequestID,
      streamCompleted: result.streamCompleted,
      batchTokensPrompt: result.promptTokens,
      batchTokensCompletion: result.completionTokens,
      batchTokensReasoning: result.reasoningTokens,
    });

  } catch (error) {
    console.error(`${requestId}: Error: `, error);
    res.status(500).json({ error: 'Internal Server Error' + error.message });
  }
});

function extractRequestInfo(req) {
  const userProfileEmail = req.oidc?.user?.email || req.headers['x-ms-client-principal-name'] 
    || `unknown user (${os.userInfo().username}@${os.hostname()})`;

  const requestPurpose = req.headers['x-purpose'];
  const requestedProvider = req.headers['x-model-provider'];
  return { requestedProvider, userProfileEmail, requestPurpose };
}

export default router;
