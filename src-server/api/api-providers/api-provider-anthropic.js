export function prepareRequest(req, userProfileEmail) {
    const apiUrl = process.env.ANTHROPIC_API_URL;
    const apiKey = process.env.ANTHROPIC_API_KEY;
  
    let provider = 'anthropic';
    if (process.env.PORTKEY_MODE === 'Y' || apiUrl.includes('portkey') || apiUrl.includes(':8787')) {
      console.log(`PortkeyAI Gateway mode detected. Using PortkeyAI provider mode...`);
      provider = 'portkey';
    }
  
    const authHeader = {
      'x-api-key': `${apiKey}`,
      "anthropic-version": "2023-06-01"
    };
  
    if (provider === 'portkey') {
      authHeader['x-portkey-provider'] = 'anthropic';
    }
  
    const { messages, model, temperature, top_p, frequency_penalty, presence_penalty, max_completion_tokens, stream, ...restBody } = req.body;
  
    const systemMessage = messages.find(msg => msg.role === 'system')?.content || '';
    const filteredMessages = messages.filter(msg => msg.role !== 'system');
    
    const requestPayload = {
      model: model,
      system: systemMessage,
      temperature: temperature,
      top_p: top_p,
      stream: stream,
      max_tokens: max_completion_tokens,
      messages: filteredMessages,
      // user: userProfileEmail   /*Anthropic does not currently support user attribution*/
    };
  
    return { provider, apiUrl, apiKey, authHeader, requestPayload };
  }
  
  export function handleStreamChunk(res, chunk, partial, responseSize, responseSizeDataChunks, streamCompleted) {
    const receivedValue = chunk.toString();
    const lines = (partial + receivedValue).split('\n');
    partial = lines.pop() || '';
  
    for (const line of lines) {
      if (line.startsWith('data:')) {
        const data = JSON.parse(line.slice(5));
        if (data.type === 'content_block_delta') {
          const content = data.delta?.text;
          if (content) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
            responseSizeDataChunks += 1;
            responseSize += content.length;
          }
        } else if (data.type === 'message_stop') {
          res.write('data: [DONE]\n\n');
          streamCompleted = true;
        }
      }
    }
  
    return { partial, responseSize, responseSizeDataChunks, streamCompleted };
  }
  
  export function formatBatchResponse(batchResponseData, provider) {
    const jsonResponseData = JSON.parse(batchResponseData);
    return {
      message: {
        role: jsonResponseData.role,
        content: jsonResponseData.content[0].text
      },
      usage: {
        prompt_tokens: jsonResponseData.usage.input_tokens,
        completion_tokens: jsonResponseData.usage.output_tokens,
        reasoning_tokens: 0
      }
    };
  }
  