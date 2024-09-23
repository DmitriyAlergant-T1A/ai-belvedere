export function prepareRequest(req, userProfileEmail) {
  return {
    provider: 'demo',
    apiUrl: 'https://demo.example.com', // This URL is not actually used
    authHeader: {},
    requestPayload: {
      model: 'demo-model',
      messages: req.body.messages,
      stream: req.body.stream
    }
  };
}

export async function handleDemoRequest(req, res) {
  const demoResponse = {
    id: 'chatcmpl-demo',
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'demo-model',
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: 'This is a demo response. No actual LLM API was called.'
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    }
  };

  if (req.body.stream) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const chunks = demoResponse.choices[0].message.content.split(' ');
    for (const chunk of chunks) {
      const streamChunk = {
        id: demoResponse.id,
        object: 'chat.completion.chunk',
        created: demoResponse.created,
        model: demoResponse.model,
        choices: [{
          index: 0,
          delta: { content: chunk + ' ' },
          finish_reason: null
        }]
      };
      res.write(`data: ${JSON.stringify(streamChunk)}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay between chunks
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } else {
    const formattedResponse = formatBatchResponse(demoResponse);
    console.log('Demo Batch Response:', JSON.stringify(formattedResponse, null, 2));
    res.status(200).json(demoResponse);
  }

  return {
    responseSize: JSON.stringify(demoResponse).length,
    responseSizeDataChunks: req.body.stream ? demoResponse.choices[0].message.content.split(' ').length : 1,
    streamCompleted: true,
    apiResponseCode: 200,
    apiRequestID: 'demo-request-id',
    promptTokens: 0,
    completionTokens: demoResponse.choices[0].message.content.length,
    reasoningTokens: 0
  };
}

export function formatBatchResponse(demoResponse) {
  return {
    message: {
      role: demoResponse.choices[0].message.role,
      content: demoResponse.choices[0].message.content
    },
    usage: {
      prompt_tokens: demoResponse.usage.prompt_tokens,
      completion_tokens: demoResponse.usage.completion_tokens,
      reasoning_tokens: 0
    }
  };
}
