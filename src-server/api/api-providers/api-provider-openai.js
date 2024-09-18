export function prepareRequest(req) {
    const apiUrl = process.env.OPENAI_API_URL;
    const apiKey = process.env.OPENAI_API_KEY;

    let provider = 'openai';
    if (process.env.PORTKEY_MODE === 'Y' || apiUrl.includes('portkey') || apiUrl.includes(':8787')) {
      console.log(`PortkeyAI Gateway mode detected. Using PortkeyAI provider mode...`);
      provider = 'portkey';
    }
  
    const authHeader = {
      'Authorization': `Bearer ${apiKey}`
    };
  
    if (provider === 'portkey') {
      authHeader['x-portkey-provider'] = 'openai';
    }
  
    const requestPayload = req.body;
  
    return { provider, apiUrl, apiKey, authHeader, requestPayload };
  }
  
  export function handleStreamChunk(res, chunk, partial, responseSize, responseSizeDataChunks, streamCompleted) {
    const receivedValue = chunk.toString();
    const accumulatedData = partial + receivedValue;
    
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
          return JSON.parse(jsonString);
        } catch {
          return jsonString;
        }
      });
  
    decodedChunks.forEach((item) => {
      if (item === '[DONE]') {
        res.write('data: [DONE]\n\n');
        streamCompleted = true;
      } else if (typeof item === 'string') {
        partial += item;
      } else if (typeof item === 'object') {
        const content = item.choices[0]?.delta?.content ?? null;
        if (content != null) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
          partial = '';
          responseSizeDataChunks += 1;
          responseSize += content.length;
        } else if (item.choices[0]?.finish_reason === 'stop' || item.choices[0]?.finish_reason === 'length') {
          // Normal stop, ignore
        } else if (item.choices[0]?.finish_reason === 'content_filter') {
          res.write(`data: {"content":"\n[MODEL STOPPED RESPONDING DUE TO CONTENT FILTER]"}\n\n`);
        } else if (item.choices[0]?.finish_reason === 'function_call') {
          res.write(`data: {"content":"\n[MODEL STOPPED RESPONDING AS IT HAS MADE A FUNCTION CALL]"}\n\n`);
        }
      }
    });
  
    return { partial, responseSize, responseSizeDataChunks, streamCompleted };
  }
  
  export function formatBatchResponse(batchResponseData, provider) {
    const jsonResponseData = JSON.parse(batchResponseData);

    return {
      message: {
        role: jsonResponseData.choices[0].message.role,
        content: jsonResponseData.choices[0].message.content
      },
      usage: {
        prompt_tokens: jsonResponseData.usage.prompt_tokens,
        completion_tokens: jsonResponseData.usage.completion_tokens,
        reasoning_tokens: jsonResponseData.usage?.completion_tokens_details?.reasoning_tokens ?? 0
      }
    };
  }
  