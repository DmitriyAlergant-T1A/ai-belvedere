import { useState } from "react";
import { useTranslation } from "react-i18next";
import useStore from '@store/store';
import AddCompanyPromptToggle from "./AddCompanyPromptToggle";

const SystemPromptConfig = () => {
    const { t } = useTranslation('');
  
    const setDefaultSystemMessage = useStore(state => state.setDefaultSystemMessage);

    const [_systemMessage, _setSystemMessage] = useState<string>(useStore.getState().defaultSystemMessage);

    const companySystemPrompt = useStore((state) => state.companySystemPrompt);
  
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
      e.target.style.maxHeight = `${e.target.scrollHeight}px`;
    };
  
    const handleOnFocus = (e: React.FocusEvent<HTMLTextAreaElement, Element>) => {
      e.target.style.height = `32`;
      e.target.style.maxHeight = `${e.target.scrollHeight}px`;
    };
  
    const handleOnBlur = (e: React.FocusEvent<HTMLTextAreaElement, Element>) => {
      e.target.style.height = 'auto';
      e.target.style.maxHeight = '2.5rem';
      e.target.scrollTop = 0;
    };
  
    return (
      <div>
        {/* <div className='block text-sm font-medium text-gray-900 dark:text-white'>
          {t('systemPrompt')}
        </div> */}
        <div className="block">
            <div title="Company-managed system prompt. You can't change it, and it may evolve over time. If you don't like it, you may disable it from being added to the chats.">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-300">
                    {t('companySystemPrompt')}
                </div>
                    <div className="ml-4">
                        <textarea
                            className='my-2 mx-0 px-2 w-full resize-none rounded-lg bg-transparent resize-none leading-7 p-1 border border-gray-400/50 max-h-8 transition-all 
                                bg-gray-500/10 hover:bg-gray-500/10 dark:bg-gray-800 dark:border-gray-800
                                text-gray-900 dark:text-gray-500'
                            onFocus={handleOnFocus}
                            onBlur={handleOnBlur}
                            value={companySystemPrompt}
                            readOnly
                            rows={8}
                        ></textarea>
                        <AddCompanyPromptToggle />
                    </div>
            </div>
            <div className="mt-4" title="Your configurable system prompt, added after the company's prompt">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-300">
                        {t('yourSystemPrompt')}
                    </div>
                    <div>
                        <div className="ml-4">
                            <textarea
                                className='my-2 mx-0 px-2 w-full resize-none rounded-lg bg-transparent resize-none leading-7 p-1 border border-gray-400/50 focus:ring-1 focus:ring-blue max-h-8 transition-all 
                                    bg-white hover:white dark:bg-gray-800 dark:border-gray-600
                                    text-gray-900 dark:text-gray-300'
                                onFocus={handleOnFocus}
                                onBlur={handleOnBlur}
                                onChange={(e) => {
                                    _setSystemMessage(e.target.value);       // Local state for display
                                    setDefaultSystemMessage(e.target.value); // Update the store
                                }}
                                onInput={handleInput}
                                value={_systemMessage}
                                rows={8}
                            ></textarea>
                        </div>
                    </div>
            </div>
        </div>
      </div>
    );
  };
  

export default SystemPromptConfig;