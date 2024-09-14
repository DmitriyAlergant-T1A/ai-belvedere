import useStore from '@store/store';
import { ChatInterface, OpenAICompletionsConfig, ModelOptions } from '@type/chat';
import { prepareApiHeaders, getChatCompletion, getChatCompletionStream, handleStream } from '@src/api-helpers/api';
import { countTokens, limitMessageTokens } from '@utils/messageUtils';
import { supportedModels, _defaultChatConfig } from '@constants/chat';
import useGenerateChatTitle from './useGenerateChatTitle';
import { updateTokensUsed } from '@utils/updateTokensUsed';

const _contentGeneratingPlaceholder = '_AI model response requested..._';

const useSubmit = () => 
{
  const setError          = useStore((state) => state.setError);
  const setGenerating     = useStore((state) => state.setGenerating);

  const { generateChatTitle } = useGenerateChatTitle();

  const handleSubmit = async () => {

    console.debug('Chat completion request initiated...');

    //This is an util function not a renderable component, so direct State access is used
    const countTotalTokens  = useStore.getState().countTotalTokens;
    const generating        = useStore.getState().generating;
    const currentChatIndex  = useStore.getState().currentChatIndex;
    const currChats         = useStore.getState().chats;
    const setChats          = useStore.getState().setChats;

    if (generating || !currChats) return;

    let _currentChatIndex: number;
    let _currentMessageIndex: number;

    const addAssistantContent = (content: string) => 
    {
      const updatedChats: ChatInterface[] = JSON.parse(
        JSON.stringify(useStore.getState().chats)
      );
      const updatedMessages = updatedChats[_currentChatIndex].messages;

      //Removing "Generating..." placeholder
      if (updatedMessages[_currentMessageIndex].content == _contentGeneratingPlaceholder)
        updatedMessages[_currentMessageIndex].content = ''; 

      updatedMessages[_currentMessageIndex].content += content;
      setChats(updatedChats);
    }

    try {

      if (currChats[currentChatIndex].messages.length === 0)
        throw new Error('No messages submitted!');

      setGenerating(true);

      /* Add Assistant's message placeholder (for future received content)*/
      const updatedChats: ChatInterface[] = JSON.parse(JSON.stringify(useStore.getState().chats));
      updatedChats[currentChatIndex].messages.push({
        role: 'assistant',
        content: _contentGeneratingPlaceholder,
        model: updatedChats[currentChatIndex].config.model
      });
      _currentChatIndex = currentChatIndex;
      _currentMessageIndex = updatedChats[currentChatIndex].messages.length - 1;
      setChats(updatedChats);

      /* Select context messages for submission */
      /* TBD refactor... The limitMessageTokens was already called once during validation phase */
      let [inputMessagesLimited, systemTokenCount, chatTokenCount, lastMessageTokens] = limitMessageTokens(
        currChats[currentChatIndex].messages,
        currChats[currentChatIndex].config.maxPromptTokens,
        currChats[currentChatIndex].config.model
      );

      /* Some models (OpenAI o-1) do not support System Prompt, will replace it with User Message*/
      if (!supportedModels[currChats[currentChatIndex].config.model].use_system_prompt) {
        inputMessagesLimited = inputMessagesLimited.map(message => 
          message.role === 'system' ? { ...message, role: 'user' } : message
        );
      }

      const completionsConfig: OpenAICompletionsConfig = {
        //NOTE: this is API-specific model alias, not our internal model reference
        model: supportedModels[currChats[currentChatIndex].config.model].apiAliasCurrent, 
        
        max_completion_tokens: currChats[currentChatIndex].config.maxGenerationTokens,
        temperature: supportedModels[currChats[currentChatIndex].config.model].force_temperature ?? currChats[currentChatIndex].config.temperature,
        presence_penalty: supportedModels[currChats[currentChatIndex].config.model].force_presence_penalty ?? currChats[currentChatIndex].config.presence_penalty,
        top_p: supportedModels[currChats[currentChatIndex].config.model].force_top_p ?? currChats[currentChatIndex].config.top_p,
        frequency_penalty: supportedModels[currChats[currentChatIndex].config.model].force_frequency_penalty ?? currChats[currentChatIndex].config.frequency_penalty
      };

      const headers = await prepareApiHeaders(currChats[currentChatIndex].config.model, inputMessagesLimited, 'Chat Submission');    
      
      /* Streaming Mode */
      if (supportedModels[currChats[currentChatIndex].config.model].use_stream) {

        const stream = await getChatCompletionStream(
          useStore.getState().apiEndpoint + "/chat/completions",
          inputMessagesLimited,
          completionsConfig,
          headers.headers
        );

        if (headers && stream)    
          await handleStream(stream, addAssistantContent);

        if (countTotalTokens) {
          /* Estimate tokens count based on the prompt and response length */

          const currChatsMessages = JSON.parse(JSON.stringify(useStore.getState().chats))[currentChatIndex].messages;

          const newPromptTokens = countTokens(inputMessagesLimited, 
              currChats[currentChatIndex].config.model, true);

          const newCompletionTokens = countTokens([currChatsMessages[currChatsMessages.length - 1]], 
              currChats[currentChatIndex].config.model, false);

          updateTokensUsed(currChats[currentChatIndex].config.model, newPromptTokens, newCompletionTokens, true);
        }

      } 

      /* Batch Mode */
      else {
        console.log("Submitting NON-STREAMING request");

        const response = await getChatCompletion(
          useStore.getState().apiEndpoint + "/chat/completions",
          inputMessagesLimited,
          completionsConfig,
          headers.headers
        );

        if (response && response.message) {
          addAssistantContent(response.message.content);
        }

        if (response && countTotalTokens)
          if (response.usage) {
            /* Take exact tokens count returned by the API endpoint */
            console.log ("Tokens Usage: " + JSON.stringify (response.usage))

            updateTokensUsed(currChats[currentChatIndex].config.model,
                    response.usage.prompt_tokens, 
                    response.usage.completion_tokens + (response.usage.reasoning_tokens ?? 0), 
                    true);

          } else {
            /* Estimate tokens count based on the prompt and response length */

            const currChatsMessages = JSON.parse(JSON.stringify(useStore.getState().chats))[currentChatIndex].messages;

            const newPromptTokens = countTokens(inputMessagesLimited, 
              currChats[currentChatIndex].config.model, true);

            const newCompletionTokens = countTokens([currChatsMessages[currChatsMessages.length - 1]], 
                currChats[currentChatIndex].config.model, false);

            updateTokensUsed(currChats[currentChatIndex].config.model, 
              newPromptTokens, 
              newCompletionTokens,
              true);
        }
      }
      
    } catch (e: unknown) {
          const err = (e as Error).message;
          console.log(err);
          setError(err);

          addAssistantContent ("\n***ERROR*** could not obtain AI chat response\nuse the 'Regenerate Response' button to try again");
    }

    if ( useStore.getState().autoTitle &&  currChats &&  !currChats[currentChatIndex]?.titleSet )
      generateChatTitle();

    setGenerating(false);
  };

  return { handleSubmit };
};

export default useSubmit;