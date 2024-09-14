import useStore from '@store/store';
import { ChatInterface, MessageInterface, OpenAICompletionsConfig } from '@type/chat';
import { prepareApiHeaders, getChatCompletion } from '@src/api-helpers/api';
import { countTokens } from '@utils/messageUtils';
import { supportedModels, _defaultChatConfig } from '@constants/chat';
import { updateTokensUsed } from '@utils/updateTokensUsed';

const useGenerateChatTitle = () => {

  const generateChatTitle = async () => {
    console.debug('Chat title generation request initiated...');

    const countTotalTokens  = useStore.getState().countTotalTokens;
    const currentChatIndex  = useStore.getState().currentChatIndex;
    const currChats         = useStore.getState().chats;
    const setChats          = useStore.getState().setChats;

    if (!currChats)
        return;

    try {
      const messages_length = currChats[currentChatIndex].messages.length;
      const assistant_message =
        currChats[currentChatIndex].messages[messages_length - 1].content;
      const user_message =
        currChats[currentChatIndex].messages[messages_length - 2].content;
        
      function formatMessage(message: string, maxLength: number) {
        if (message.length <= maxLength) {
          return message;
        } else {
          const firstHalf = message.slice(0, maxLength/2);
          const lastHalf = message.slice(-maxLength/2);
          return `${firstHalf}... ${lastHalf}`;
        }
      }
        
      const titleGenPromptMessage: MessageInterface = {
        role: 'user',
        content: `Generate a title in less than 6 words for the following AI Chatbot Assistance scenario:\n"""\nUser:\n${formatMessage(user_message, 280)}\n\nAssistant:\n${formatMessage(assistant_message, 280)}\n"""`,
      };

      const titleGenModel = supportedModels[currChats[currentChatIndex].config.model].titleGenModel;

      const titleGenConfig: OpenAICompletionsConfig = {
        model: supportedModels[titleGenModel].apiAliasCurrent,
        max_completion_tokens: 100,
        temperature: _defaultChatConfig.temperature,
        presence_penalty: _defaultChatConfig.presence_penalty,
        top_p: _defaultChatConfig.top_p,
        frequency_penalty: _defaultChatConfig.frequency_penalty
      };

      const headers = await prepareApiHeaders(titleGenModel, [titleGenPromptMessage], 'Title Generation');

      let data = await getChatCompletion(
        useStore.getState().apiEndpoint + "/chat/completions",
        [titleGenPromptMessage],
        titleGenConfig,
        headers.headers
      );

      let title = data?.message?.content?.trim();
  
      if (title) {
        if (title.startsWith('"') && title.endsWith('"')) {
          title = title.slice(1, -1);
        }

        const updatedChats: ChatInterface[] = JSON.parse(
          JSON.stringify(useStore.getState().chats)
        );
        updatedChats[currentChatIndex].title = title;
        updatedChats[currentChatIndex].titleSet = true;
        setChats(updatedChats);
      }

      console.debug('Chat title succesfully generated: ' + title);

      if (countTotalTokens) {

        const newPromptTokens = countTokens([titleGenPromptMessage], titleGenModel, true);

        const newCompletionTokens = countTokens([{role: 'assistant',content: title}], titleGenModel, false);

        updateTokensUsed(titleGenModel, 
            newPromptTokens, 
            newCompletionTokens, 
            false);

      }

    } catch (e: unknown) {
      const err = 'Error generating chat title! ' + (e as Error).message;
      
      console.error(err);
      
      const { setToastStatus, setToastMessage, setToastShow} = useStore.getState();

      setToastStatus('error');
      setToastMessage(err);
      setToastShow(true);
    }
  };

  return { generateChatTitle };
};

export default useGenerateChatTitle;
