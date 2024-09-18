import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import logRequestRouter from './logging/logging-router.js';
import https from 'https';

const router = express.Router();

router.post('/', async (req, res) => {
  const requestId = uuidv4();

  try {
    const { requestedProvider, userProfileEmail, requestPurpose } = extractRequestInfo(req);

    const providerModule = await import(`./api-providers/api-provider-${requestedProvider}.js`);

    const { provider, apiUrl, apiKey, authHeader, requestPayload } = providerModule.prepareRequest(req);

    logRequestRouter("Chat Completions Request", requestId, {
      principal: userProfileEmail,
      requestSize: req.headers['content-length'],
      model: requestPayload.model,
      provider: provider,
      purpose: requestPurpose,
      headers: ""
    });

    const apiReqHeaders = {
      hostname: new URL(apiUrl).hostname,
      path: new URL(apiUrl).pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
    };

    await handleApiRequest(req, res, apiReqHeaders, requestPayload, provider, requestId, userProfileEmail, requestPurpose, providerModule);

  } catch (error) {
    console.error(`${requestId}: Error: `, error);
    res.status(500).json({ error: 'Internal Server Error' + error.message });
  }
});

async function handleApiRequest(req, res, apiReqHeaders, requestPayload, provider, requestId, userProfileEmail, requestPurpose, providerModule) {
  let responseSize = 0, responseSizeDataChunks = 0;
  let streamCompleted = false;
  let apiResponseCode;
  let promptTokens = 0, completionTokens = 0, reasoningTokens = 0;

  const apiReq = https.request(apiReqHeaders, (apiRes) => {
    apiResponseCode = apiRes.statusCode;
    console.log(`${requestId}: APIResponse received... status: ${apiRes.statusCode}.`);

    if (apiRes.statusCode !== 200) {
      handleErrorResponse(res, apiRes);
      return;
    }

    if (req.body.stream) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
    }

    let batchResponseData = '';
    let partial = '';

    apiRes.on('data', (chunk) => {
      /* BATCH RESPONSE */
      if (!req.body.stream) {
        batchResponseData += chunk.toString();
        responseSize += chunk.length;
      } 
      /* STREAM RESPONSE */
      else {
        ({ partial, responseSize, responseSizeDataChunks, streamCompleted } = 
          providerModule.handleStreamChunk(res, chunk, partial, responseSize, responseSizeDataChunks, streamCompleted));
      }

      if (req.socket.destroyed) {
        console.log(`${requestId}: Client connection terminated, aborting the API request.`);
        apiRes.destroy();
        return;
      }
    });

    apiRes.on('end', () => {
      if (req.body.stream) {
        //STREAM COMPLETED
        if (res.statusCode === 200) {
          res.write('data: [DONE]\n\n');
        }
        res.end();
      } else {
        //BATCH RESPONSE COMPLETED
        const universalResponse = providerModule.formatBatchResponse(batchResponseData, provider);
        promptTokens = universalResponse.usage.prompt_tokens;
        completionTokens = universalResponse.usage.completion_tokens;
        reasoningTokens = universalResponse.usage.reasoning_tokens;

        res.status(apiRes.statusCode).send(universalResponse);

        streamCompleted = true;
      }
    });
  });

  apiReq.on('error', (error) => {
    console.error(`${requestId}: Error: `, error);
    res.status(500).json({ error: 'Internal Server Error' + error.message });
  });

  apiReq.on('close', () => {
    logRequestRouter("Chat Completions Response", requestId, {
      principal: userProfileEmail,
      requestStreaming: req.body.stream,
      requestSize: req.headers['content-length'],
      responseSize: responseSize.toString(),
      responseSizeDataChunks: responseSizeDataChunks,
      model: requestPayload.model,
      provider: provider,
      purpose: requestPurpose,
      headers: "",
      apiResponseCode: apiResponseCode,
      streamCompleted: streamCompleted,
      batchTokensPrompt: promptTokens,
      batchTokensCompletion: completionTokens,
      batchTokensReasoning: reasoningTokens,
    });
  });

  apiReq.write(JSON.stringify(requestPayload));
  apiReq.end();
}

function extractRequestInfo(req) {
  const userProfileEmail = req.oidc?.user?.email || req.headers['x-ms-client-principal-name'] || 'unknown user';
  const requestPurpose = req.headers['x-purpose'];
  const requestedProvider = req.headers['x-model-provider'];
  return { requestedProvider, userProfileEmail, requestPurpose };
}

function handleErrorResponse(res, apiRes) {
  let data = '';
  apiRes.on('data', (chunk) => {
    data += chunk;
  });
  apiRes.on('end', () => {
    res.status(apiRes.statusCode).send(data);
  });
}

export default router;
