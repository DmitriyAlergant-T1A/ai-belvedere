import express from 'express';
import http from 'http';
import https from 'https';
import { v4 as uuidv4 } from 'uuid';

import { isAggregateLogsUploadError, LogsIngestionClient } from "@azure/monitor-ingestion";

import { getAzureCredential } from '../azure-credentials.js';

const router = express.Router();

function logToAzureLogAnalytics(logsIngestionClient, streamName, requestId, logsData) {

  const AZURE_LOG_ANALYTICS_RESOURCE_URI = process.env.AZURE_LOG_ANALYTICS_RESOURCE_URI;
  const AZURE_LOG_ANALYTICS_DCR_IMMUTABLE_ID = process.env.AZURE_LOG_ANALYTICS_DCR_IMMUTABLE_ID;

  if (AZURE_LOG_ANALYTICS_RESOURCE_URI) {

    //console.log(JSON.stringify(logsData));

    logsIngestionClient.upload(AZURE_LOG_ANALYTICS_DCR_IMMUTABLE_ID, streamName, logsData)
    .catch(e => {
      let aggregateErrors = isAggregateLogsUploadError(e) ? e.errors : [];
      if (aggregateErrors.length > 0) {
        //console.log(`${requestId} Some logs have failed to complete ingestion`);
        for (const error of aggregateErrors) {
          console.log(`${requestId} Logs ingestion error: ${error?.cause?.statusCode}  ${error?.cause?.code} ${error?.cause?.details?.error?.message}`);
          //console.log(`${requestId} Logs ingestion error: ${JSON.stringify(error)}`);
        }
      } else {
        console.log(`${requestId} Error uploading logs to ALA: ` + e);
      }
    });
  }
}


router.post('/', async (req, res) => {

  const requestId = uuidv4();

  try {

    const OPENAI_API_URL = process.env.OPENAI_API_URL;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const ANTHROPIC_API_URL = process.env.ANTHROPIC_API_URL;
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

    const AZURE_LOG_ANALYTICS_REQ_LOGS_DS = process.env.AZURE_LOG_ANALYTICS_REQ_LOGS_DS;
    const AZURE_LOG_ANALYTICS_RES_LOGS_DS = process.env.AZURE_LOG_ANALYTICS_RES_LOGS_DS;

    const AZURE_LOG_ANALYTICS_RESOURCE_URI = process.env.AZURE_LOG_ANALYTICS_RESOURCE_URI;

    let credential, logsIngestionClient;

    if (AZURE_LOG_ANALYTICS_RESOURCE_URI) {
      credential = getAzureCredential();

      logsIngestionClient = new LogsIngestionClient(AZURE_LOG_ANALYTICS_RESOURCE_URI, credential);
    }

    const provider = req.headers['x-portkey-provider'];
    const clientPrincipalName = req.headers['x-ms-client-principal-name'] ?? 'unknown user';
    const requestPurpose = req.headers['x-purpose'];

    let apiUrl = '';
    let authHeader = {};
    let requestPayload = {};

    if (provider == 'openai')
    {
      apiUrl = OPENAI_API_URL;
      authHeader = {'Authorization': `Bearer ${OPENAI_API_KEY}`};
      requestPayload = req.body;
    }
      
    if (provider == 'anthropic')
    {
      apiUrl = ANTHROPIC_API_URL;
      authHeader =  {'x-api-key': `${ANTHROPIC_API_KEY}`, 
                     "anthropic-version": "2023-06-01"};

      const { messages, model, temperature, top_p, frequency_penalty, presence_penalty, max_tokens, stream, ...restBody } = req.body; // decompose the request body
      const systemMessage = messages.find(msg => msg.role === 'system')?.content || '';
      const filteredMessages = messages.filter(msg => msg.role !== 'system');

      requestPayload = {
        model: model,
        system: systemMessage,
        temperature: temperature,
        top_p: top_p,
        stream: stream,
        max_tokens: max_tokens,
        messages: filteredMessages
      };
    }
      
    logToAzureLogAnalytics (logsIngestionClient, AZURE_LOG_ANALYTICS_REQ_LOGS_DS, requestId,
      [{
        requestId: requestId,
        TimeGenerated: new Date().toISOString(),
        principal: clientPrincipalName,
        requestSize: req.headers['content-length'],
        model: requestPayload.model,
        provider: provider,
        purpose: requestPurpose,
        headers: "" //JSON.stringify(req.headers),
      }]);


    const options = {
      hostname: new URL(apiUrl).hostname,
      path: new URL(apiUrl).pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
    };

    let responseSize = 0;
    let streamCompleted = false;
    let responseData = '';

    const requestModule = apiUrl.startsWith('https') ? https : http;

    console.log(`${requestId}: Processing request from client principal '${clientPrincipalName}', purpose: '${requestPurpose}' provider: '${provider}', model: '${req.body.model}'`);

    let apiResponseCode = undefined;

    const apiReq = requestModule.request(options, (apiRes) => {

      apiResponseCode = apiRes.statusCode;

      if (apiRes.statusCode==200 && req.body.stream)
        console.log(`${requestId}: Response received... status: ${apiRes.statusCode}. Starting to stream...`)
      else if (apiRes.statusCode==200)
        console.log(`${requestId}: Response received... status: ${apiRes.statusCode}. Not streaming. Buffering complete response.`)
      else
        console.log(`${requestId}: Response received... status: ${apiRes.statusCode}`)

      if (req.body.stream) {
        res.writeHead(apiRes.statusCode, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        });
      }

      apiRes.on('data', (chunk) => {
        //console.log(`Received chunk of size: ${chunk.length}, data: ${chunk.toString()}`);
        responseData += chunk.toString();
        responseSize += chunk.length;

        if (req.body.stream) {
          res.write(chunk);
        }

        if (req.socket.destroyed) {
          // Handle the terminated connection
          console.log(`${requestId}: Client connection terminated, aborting the API request.`);
          apiRes.destroy();
          return;
        }
      });

      apiRes.on('end', async () => {
        //console.log(`${requestId}: Response stream completed`)
        streamCompleted = true;
        if (req.body.stream) {
          if (res.statusCode == 200)    // Don't append data: [DONE] when status code is not 200 - this is just an error JSON response. It was not streaming and will not be handled as a stream by the client.
            res.write('data: [DONE]\n\n');  
          res.end();
        } else {
          res.status(apiRes.statusCode).send(responseData);
        }
      });
    });

    apiReq.on('error', (error) => {
      console.error(`${requestId}: Error: `, error);
      res.status(500).json({ error: 'Internal Server Error' + error.message });
    });

    apiReq.on('close',async () => {
      if (req.body.stream)
         console.log(`${requestId}: Response closed. Stream completed: `, streamCompleted);
      else
         console.log(`${requestId}: Response closed`);

      logToAzureLogAnalytics (logsIngestionClient, AZURE_LOG_ANALYTICS_RES_LOGS_DS, requestId,
      [{
        requestId: requestId,
        TimeGenerated: new Date().toISOString(),
        principal: clientPrincipalName,
        requestSize: req.headers['content-length'], // content-length could be a number, but we keep it as string - this is how we set up Data Collection Rules in ALA...
        responseSize: responseSize.toString(),      // responseSize is a number, but convert it to string - this is how we set up Data Collection Rules in ALA...
        model: requestPayload.model,
        provider: provider,
        purpose: requestPurpose,
        headers: "", //JSON.stringify(req.headers),
        apiResponseCode: apiResponseCode,
        streamCompleted: streamCompleted,
      }]
      );
    });

    apiReq.write(JSON.stringify(requestPayload));

    apiReq.end();
    
  } catch (error) {
    console.error(`${requestId}: Error: `, error);
    res.status(500).json({ error: 'Internal Server Error' + error.message});
  }
});

export default router;
