const express = require('express');

const router = express.Router();

router.post('/', async (req, res) => {
  try {

    //TODO: get OPENAI_API_URL from env vars
    //TODO: get OPENAI_API_KEY from env vars
    //TODO: get ANTHROPIC_API_KEY from env vars

    //TODO determine provider by "x-portkey-provider" API header ('openai', 'anthropic'), 
    // and add authentication header depending on a provider
    //  -- for OpenAI: 'Authentication: Beared {key}'
    //  -- for Anthropic: 'Authentication: Beared {key}'

    //TODO get AZURE_LOG_ANALYTICS_RESOURCE_URI from env vars. If it is not empty:
    
      // 1. Authenticate using Managed Identity (or a default identity)
      
      // 2. Log a record to 'chatbot_api_requests' table.:
      //     - timestamp
      //     - x-ms-principal (from request headers)
      //     - request Content-Length
      //     - headers (JSON array of all request headers)

    //TODO forward the request to OPENAI_API_URL and pass back the response, while supporting SSE STREAMING (if the servers response was streaming)

    // If AZURE_LOG_ANALYTICS_RESOURCE_URI was not empty, make another log entry at completion of the response:
    // (whether naturally or by a client terminating a connection)
      //   log a record to 'chatbot_api_req_responses' table.:
      //     - timestamp
      //     - x-ms-principal (from request headers)
      //     - request Content-Length
      //     - headers (JSON array of all request headers)
      //     - response code
      //     - if response code was not ok, then also an error message from the response payload
      //     - stream_completed (Y/N) 
      //             Y if the stream finished naturally with the DONE chunk; 
      //             Otherwise, N (ex: client terminated connection prematurely);
      //     - actually transferred streaming response size in characters

  } catch (error) {

    //TODO valid way of returning HTTP 500 while wrapping the underlying error

  }
});

module.exports = router;
