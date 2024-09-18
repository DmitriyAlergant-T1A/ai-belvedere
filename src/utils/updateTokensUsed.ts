import { ModelOptions } from "@type/chat";
import useStore from '@store/store';

export const updateTokensUsed = (model: ModelOptions, promptTokens: number, completionTokens: number, showToast: boolean) => {

    const { 
      setTokensToastInputTokens, 
      setTokensToastCompletionTokens, 
      setTokensToastShow,
      setTotalTokenUsed
    } = useStore.getState();
  
    if (showToast) {
      setTokensToastInputTokens(promptTokens.toString())
      setTokensToastCompletionTokens(completionTokens.toString())
      setTokensToastShow(true)
    }
  
    const updatedTotalTokenUsed = JSON.parse(JSON.stringify(useStore.getState().totalTokenUsed));
    
    updatedTotalTokenUsed[model] = {
      promptTokens: (updatedTotalTokenUsed[model]?.promptTokens || 0) + promptTokens,
      completionTokens: (updatedTotalTokenUsed[model]?.completionTokens || 0) + completionTokens,
    };
  
    setTotalTokenUsed(updatedTotalTokenUsed);
  }