import express from 'express';
import http from 'http';
import https from 'https';
import { v4 as uuidv4 } from 'uuid';

import logRequestRouter from './logging/logging-router.js';

const router = express.Router();

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

    const userProfileEmail = req.oidc?.user?.email || req.headers['x-ms-client-principal-name'] || 'unknown user';

    const requestPurpose = req.headers['x-purpose'];
    const requestedProvider = req.headers['x-model-provider'];

    let provider = '';
    let apiUrl = '';
    let apiKey = '';
    let authHeader = {};
    let requestPayload = {};

    if (requestedProvider == 'openai') {
      apiUrl = OPENAI_API_URL;
      apiKey = OPENAI_API_KEY;
    } else if (requestedProvider == 'anthropic') {
      apiUrl = ANTHROPIC_API_URL;
      apiKey = ANTHROPIC_API_KEY;
    }

    /* Dirty attempt to identify if we will be talking to the PortkeyAI Gateway */
    if (process.env.PORTKEY_MODE == 'Y' || apiUrl.includes('portkey') || apiUrl.includes(':8787')) {
      console.log(`${requestId}: PortkeyAI Gateway mode detected. Using to PortkeyAI provider mode...`);
      provider = 'portkey';
    } else
      provider = requestedProvider;

    //Add OpenAI Headers (same for Portkey)
    if (provider == 'openai' || provider == 'portkey')
    {
      authHeader = {...authHeader, 
              'Authorization': `Bearer ${apiKey}`};

      requestPayload = req.body;
    }
    
    //TBD, system prompt injection for Company-Provided System Prompt Fragment
     
    if (provider == 'anthropic')
    {
      //Anthropic-specific headers
      authHeader =  {...authHeader,
              'x-api-key': `${apiKey}`, 
              "anthropic-version": "2023-06-01"};

      //Anthropic-specific headers body preprocessing

      const { messages, model, temperature, top_p, frequency_penalty, presence_penalty, max_tokens, stream, ...restBody } = req.body; // decompose the request body

      // Anthropic API does not accept 'system' role messages, so we need to extract them and send them as a separate field
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

    //Portkey-specific headers
    if (provider == 'portkey') {
      authHeader = {...authHeader, 
        "x-portkey-provider": requestedProvider};
    }
      
    logRequestRouter ("Chat Completions Request", requestId,
      {
        principal: userProfileEmail,
        requestSize: req.headers['content-length'],
        model: requestPayload.model,
        provider: requestedProvider,
        purpose: requestPurpose,
        headers: "" //JSON.stringify(req.headers),
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

    let responseSizeDataChunks = 0;
    let batchResponseData = '';
    let streamCompleted = false;
    
    const requestModule = apiUrl.startsWith('https') ? https : http;

    //console.log(`${requestId}: Processing request from client principal '${userProfileEmail}', purpose: '${requestPurpose}' provider: '${provider}', model: '${req.body.model}'`);

    let apiResponseCode = undefined;

    const apiReq = requestModule.request(apiReqHeaders, (apiRes) => {

      apiResponseCode = apiRes.statusCode;

      if (apiRes.statusCode==200 && req.body.stream)
        console.log(`${requestId}: Response received... status: ${apiRes.statusCode}. Starting to stream...`)
      else if (apiRes.statusCode==200)
        console.log(`${requestId}: Response received... status: ${apiRes.statusCode}. Not streaming. Buffering complete response.`)
      else { /* Non-200 Responses */
        console.log(`${requestId}: Response received... status: ${apiRes.statusCode}`);
    
        // Handle non-200 responses by sending the response back to the client
        let data = '';
        apiRes.on('data', (chunk) => {
          data += chunk;
        });
        apiRes.on('end', () => {
          res.status(apiRes.statusCode).send(data);
        });
        return; // Exit the function to prevent further processing
      }
        

      if (req.body.stream) {
        res.writeHead(apiRes.statusCode, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        });
      }

      let partial = '';

      apiRes.on('data', (chunk) => {
  
          if (!req.body.stream)
            batchResponseData += chunk.toString();
      
          if (req.body.stream) {
            const receivedValue = chunk.toString();
      
            // Handle OpenAI stream format
            if (provider === 'openai' || provider === 'portkey') {

              const accumulatedData = partial + receivedValue;
              
              // This returns either an Array of response chunks, or a string '[DONE]', or a partial incomplete string...
              const decodedChunks = accumulatedData
                    .split('\n\n')
                    .filter(Boolean)
                    .map((chunk) => {
                      const jsonString = chunk
                        .split('\n')
                        .map((line) => line.replace(/^data: /, ''))
                        .join('');
                      if (jsonString === '[DONE]') {
                        return jsonString;
                      }
                      try {
                        const json = JSON.parse(jsonString);
                        return json;
                      } catch {
                        return jsonString;  // Not a parsable JSON, likely an incomplete string - return it
                      }
                    });

              decodedChunks.forEach((item) => {
                if (item === '[DONE]') {
                  //console.log("Responded With data: [DONE]")
                  res.write('data: [DONE]\n\n');
                  console.log(`${requestId}: Response stream completed`)
                  streamCompleted = true;
                } else if (typeof item === 'string') {
                  //console.log("chunk incomplete (not an object), buffered")
                  partial += item;
                } else if (typeof item === 'object') {
                  //console.log(JSON.stringify(item)); 
                  
                  const content = item.choices[0]?.delta?.content ?? null;
                  if (content != null) {
                    //console.log(`Responded With data: ${JSON.stringify({ content })}`);
                    res.write(`data: ${JSON.stringify({ content })}\n\n`);
                    partial = '';

                    responseSizeDataChunks += 1;
                  } else if (item.choices[0]?.finish_reason === 'stop' || item.choices[0]?.finish_reason === 'length') {
                    // Normal stop is OK, we just ignore this. A [DONE] will follow anyway.
                  } else if (item.choices[0]?.finish_reason in ('content_filter')) {
                    res.write(`data: {"content:"\n[MODEL STOPPED RESPONDING DUE TO CONTENT FILTER]"}\n\n`);
                  } else if (item.choices[0]?.finish_reason in ('function_call')) {
                    res.write(`data: {"content:"\n[MODEL STOPPED RESPONDING AS IT HAS MADE A FUNCTION CALL]"}\n\n`);
                  }
                  else {
                    console.error (`${requestId}: ERROR parsing event stream, chunk item is a null object`);
                  }
                }
                else {
                  console.error(`${requestId}: ERROR parsing event stream, unexpected chunk item type`);
                }
              });
                  
            } else if (provider === 'anthropic') {
              // Handle Anthropic stream format
              const lines = (partial + receivedValue).split('\n');
              partial = lines.pop() || ''; // Store last incomplete line for next iteration
      
              for (const line of lines) {
                if (line.startsWith('data:')) {
                  const data = JSON.parse(line.slice(5));
                  if (data.type === 'content_block_delta') {
                    const content = data.delta?.text;
                    if (content) {
                      res.write(`data: ${JSON.stringify({ content })}\n\n`);
                      responseSizeDataChunks += 1;
                    }
                  } else if (data.type === 'message_stop') {
                    res.write('data: [DONE]\n\n');

                    //console.log(`${requestId}: Response stream completed`)
                    streamCompleted = true;
                  }
                }
              }
            }
          }

        if (req.socket.destroyed) {
          // Handle terminated connection
          console.log(`${requestId}: Client connection terminated, aborting the API request.`);
          apiRes.destroy();
          return;
        }
      });

      apiRes.on('end', async () => {

        if (req.body.stream) {
          if (res.statusCode == 200)    // Don't append data: [DONE] when status code is not 200 - this is just an error JSON response. It was not streaming and will not be handled as a stream by the client.
            res.write('data: [DONE]\n\n');  
          res.end();
        } else {

          let universalResponse = {
            message: {},
            usage: {}
          };

          try {

            const jsonResponseData = JSON.parse(batchResponseData);

            if (provider=='openai' || provider == 'portkey') {
              universalResponse.message.role = jsonResponseData.choices[0].message.role;
              universalResponse.message.content = jsonResponseData.choices[0].message.content;
              universalResponse.usage.prompt_tokens = jsonResponseData.usage.prompt_tokens;
              universalResponse.usage.completion_tokens = jsonResponseData.usage.completion_tokens;
            } else if (provider=='anthropic') { 
              universalResponse.message.role = jsonResponseData.role;
              universalResponse.message.content = jsonResponseData.content[0].text;
              universalResponse.usage.prompt_tokens = jsonResponseData.usage.input_tokens;
              universalResponse.usage.completion_tokens = jsonResponseData.usage.output_tokens;
            } else
            universalResponse = jsonResponseData;
          } catch (error){
            console.error(`${requestId}: Error parsing batch response data: `, error);
          }

          //Not streaming, just send the accumulated response all at once
          res.status(apiRes.statusCode).send(universalResponse);
          //console.log(`${requestId}: batch chat completions response ${JSON.stringify(universalResponse)}`);
        }
      });
    });

    apiReq.on('error', (error) => {
      console.error(`${requestId}: Error: `, error);
      res.status(500).json({ error: 'Internal Server Error' + error.message });
    });

    apiReq.on('close',async () => {

      // if (req.body.stream)
      //    console.log(`${requestId}: Response closed. Stream completed: ${streamCompleted}. Response size sent: ${responseSizeDataChunks + 3} chunks (tokens?)`);
      // else
      //    console.log(`${requestId}: Response closed`);

      logRequestRouter ("Chat Completions Response", requestId,
      {
        principal: userProfileEmail,
        requestStreaming: req.body.stream,
        requestSize: req.headers['content-length'], // content-length could be a number, but we keep it as string - this is how we set up Data Collection Rules in ALA...
        responseSize: responseSizeDataChunks,       
        responseSizeDataChunks: responseSizeDataChunks,
        model: requestPayload.model,
        provider: requestedProvider,
        purpose: requestPurpose,
        headers: "", //JSON.stringify(req.headers),
        apiResponseCode: apiResponseCode,
        streamCompleted: streamCompleted,
      });
    });

    apiReq.write(JSON.stringify(requestPayload));

    apiReq.end();
    
  } catch (error) {
    console.error(`${requestId}: Error: `, error);
    res.status(500).json({ error: 'Internal Server Error' + error.message});
  }
});

export default router;
