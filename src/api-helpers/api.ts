import { MessageInterface, ModelOptions } from '@type/chat';
import { supportedModels } from '@constants/chat';
import { OpenAICompletionsConfig } from '@hooks/useSubmit';
import useStore from '@store/store';
import { _builtinAPIEndpoint } from '@constants/apiEndpoints';

export const isAuthenticated = async () => {
  try {
    const response = await fetch('/api/profile');
    if (response.ok) {
      const data = await response.json();
      return data.name != null;
    }
    return false;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
}

export const redirectToLogin = async() => {
  // Redirect to the login URL that triggers AAD authentication
  const loginUrl = import.meta.env.VITE_LOGIN_URL;
  window.location.href = loginUrl;
}

  /* Prepare API Request Headers */
export const prepareApiHeaders = async (
    model: ModelOptions, 
    messages: MessageInterface[],
    purpose: string) => {

  const apiEndpoint  = useStore.getState().apiEndpoint;

  const headers: Record<string, string> = {};

  headers['x-model-provider'] = supportedModels[model].portkeyProvider;

  /* Built-in endpoint (/api/v1/chat/completions) */
  if (apiEndpoint === _builtinAPIEndpoint && import.meta.env.VITE_CHECK_AAD_AUTH === 'Y')
  {
    const isAuthenticatedUser = await isAuthenticated();

    if (!isAuthenticatedUser) {
      console.log("User not authenticated, redirecting to login.");
      await redirectToLogin();
      throw new Error(`API Authentication Error, please reload the page`);
    }
  }

  headers['x-api-model'] = supportedModels[model].apiAliasCurrent;
  headers['x-messages-count'] = messages.length.toString();
  headers['x-purpose'] = purpose;

  return {headers};
};

export const getChatCompletion = async (
  endpoint: string,
  messages: MessageInterface[],
  config: OpenAICompletionsConfig,
  customHeaders?: Record<string, string>
) => {

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const path = `chat/completions`;

  if (!endpoint.endsWith(path)) {
    if (!endpoint.endsWith('/')) {
      endpoint += '/';
    }
    endpoint += path;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages,
      ...config
    }),
  });
  if (!response.ok) throw new Error(await response.text());

  const data = await response.json();
  return data;
};


export const getChatCompletionStream = async (
  endpoint: string,
  messages: MessageInterface[],
  config: OpenAICompletionsConfig,
  customHeaders?: Record<string, string>
) => {

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const path = `chat/completions`;

    if (!endpoint.endsWith(path)) {
      if (!endpoint.endsWith('/')) {
        endpoint += '/';
      }
      endpoint += path;
    }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages: messages.map(({ role, content }) => ({ role, content })),
      ...config,
      stream: true,
    }),
  });

  if (response.status === 404 || response.status === 405) {
    const text = await response.text();

    if (text.includes('model_not_found')) {
      throw new Error(
        text +
          '\nModel not found. The API endpoint may not have access to the requested model: ${model}'
      );
    } else {
      throw new Error(
        'Invalid API endpoint, or API Gateway is down.\nPlease contact the application administrator...'
      );
    }
  }

  if (response.status === 429 || !response.ok) {
    const text = await response.text();
    let error = text;
    if (text.includes('insufficient_quota')) {
      error +=
        'API Quota Exceeded. Try again later';
    } else if (response.status === 429) {
      error += 'API Rate Exceeded. Try again later';
    }
    throw new Error(error);
  }

  const stream = response.body;
  return stream;
};

export async function handleStream(stream: ReadableStream, addAssistantContent: (content: string) => void) {
  if (stream) {
    if (stream.locked)
      throw new Error('Oops, the stream is locked right now. Please try again');
    
    const reader = stream.getReader();

    let reading = true;

    /* This is our own simplified implementation of a response stream (provider-agnostic) */
    /* See back-end chat_completions.js implementation */
    

    try {
      while (reading && useStore.getState().generating) {
        const { done, value } = await reader.read();
        
        if (done) {
          reading = false;
        } else {
          const decodedValue = new TextDecoder().decode(value);
          const lines = decodedValue.split('\n');

          let buffer = '';

          for (const line of lines) {
            if (line.startsWith('data:')) {

              const data = line.slice(6);
              //console.debug('handleStream: received data: ', data);

              if (data === '[DONE]') {
                reading = false;
              } else {
                buffer += data;
                try {
                  const content = JSON.parse(buffer)?.content;
                  if (content) {
                    addAssistantContent(content);
                    //console.debug('handleStream: processed content: ', content);
                  }
                  else {
                    //console.debug('handleStream: chunk content is empty ', content);
                  }
                  buffer = '';
                 
                } catch (error) {
                  //console.debug('handleStream: received an incomplete JSON. Line buffered: ', buffer);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error occurred during stream processing:', error);
      // Handle the error and provide appropriate feedback to the client
      addAssistantContent('\n***ERROR*** An error occurred during stream processing. Please try again.');
    } finally {
      
      if (!useStore.getState().generating) {
        reader.cancel('Stream cancelled by user');
        console.debug('Stream cancelled by user');
      } else {
        reader.cancel('Generation completed');
        console.debug('Generation completed');
      }

      reader.releaseLock();
      
      try {
        await stream.cancel();
      } catch (error) {
        console.warn('Error occurred while cancelling the stream:', error);
      }
    }
  }
}