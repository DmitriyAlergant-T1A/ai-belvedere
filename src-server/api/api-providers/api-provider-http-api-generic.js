import https from 'https';

export function handleApiRequest(req, res, apiReqHeaders, requestPayload, provider, requestId, userProfileEmail, requestPurpose, providerModule) {
  return new Promise((resolve, reject) => {
    let responseSize = 0, responseSizeDataChunks = 0;
    let streamCompleted = false;
    let apiResponseCode;
    let apiRequestID;
    let promptTokens = 0, completionTokens = 0, reasoningTokens = 0;

    const apiReq = https.request(apiReqHeaders, (apiRes) => {
      apiResponseCode = apiRes.statusCode;
      console.log(`${requestId}: APIResponse received... status: ${apiRes.statusCode}.`);

      apiRequestID = apiRes.headers['x-request-id'];

      if (apiRes.statusCode !== 200) {
        handleErrorResponse(res, apiRes);
        reject(new Error(`API responded with status code ${apiRes.statusCode}`));
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
        if (!req.body.stream) {
          batchResponseData += chunk.toString();
          responseSize += chunk.length;
        } else {
          ({ partial, responseSize, responseSizeDataChunks, streamCompleted } = 
            providerModule.handleStreamChunk(res, chunk, partial, responseSize, responseSizeDataChunks, streamCompleted));
        }

        if (req.socket.destroyed) {
          console.log(`${requestId}: Client connection terminated, aborting the API request.`);
          apiRes.destroy();
          reject(new Error('Client connection terminated'));
          return;
        }
      });

      apiRes.on('end', () => {
        if (req.body.stream) {
          if (res.statusCode === 200) {
            res.write('data: [DONE]\n\n');
          }
          res.end();
        } else {
          const universalResponse = providerModule.formatBatchResponse(batchResponseData, provider);
          promptTokens = universalResponse.usage.prompt_tokens;
          completionTokens = universalResponse.usage.completion_tokens;
          reasoningTokens = universalResponse.usage.reasoning_tokens;

          res.status(apiRes.statusCode).send(universalResponse);

          streamCompleted = true;
        }

        resolve({
          responseSize,
          responseSizeDataChunks,
          streamCompleted,
          apiResponseCode,
          apiRequestID,
          promptTokens,
          completionTokens,
          reasoningTokens
        });
      });
    });

    apiReq.on('error', (error) => {
      console.error(`${requestId}: Error: `, error);
      res.status(500).json({ error: 'Internal Server Error' + error.message });
      reject(error);
    });

    apiReq.write(JSON.stringify(requestPayload));
    apiReq.end();
  });
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