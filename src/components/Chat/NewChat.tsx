// NewChat.tsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';
import PlusIcon from '@icon/PlusIcon';
import useAddChat from '@hooks/useAddChat';
import PopupModal from '@components/PopupModal'; // Ensure this is correctly imported
import { ModelOptions } from '@type/chat';
import { supportedModels } from '@constants/chat';
import { replace } from 'lodash';

const NewChat = ({ folder, hotkeysEnabled }: { folder?: string; hotkeysEnabled: boolean }) => {
  const { t } = useTranslation();
  const generating = useStore((state) => state.generating);
  const [isModelSelectionOpen, setIsModelSelectionOpen] = useState(false);
  const addChat = useAddChat(); 

  const defaultModel = useStore((state) => state.defaultChatConfig.model);

  const replaceCurrentChat = useStore((state) => state.replaceCurrentChat);

  const handleModelSelect = (model: string) => {
    //console.log(`Model selected: ${model}`);

    setIsModelSelectionOpen(false); // Close the modal
  
    // Validate or cast the model string to ModelOptions
    addChat(folder, model as ModelOptions); // Cast to ModelOptions if it's valid
  };

  // Function to handle Enter key press
  const handleEnterKeyPress = (event: KeyboardEvent) => {

    //Use default model; Close modal;
    if ((event.key === '/' || event.key === '.') && isModelSelectionOpen) {
      handleModelSelect(defaultModel);
      event.preventDefault();
    }

    //Show New Chat modal
    if (event.ctrlKey && (event.key === '/' || event.key === '.') && !isModelSelectionOpen && !generating) {
      setIsModelSelectionOpen(true);
      event.preventDefault();
    }
  };

  useEffect(() => {
    // Add event listener for keydown

    console.log("hotkeysEnabled=", hotkeysEnabled);

    if (hotkeysEnabled && !folder)  //Only handle for the main "New Chat" button not additional ones under Folders
      window.addEventListener('keypress', handleEnterKeyPress);

    // Cleanup function to remove event listener
    return () => {
        window.removeEventListener('keypress', handleEnterKeyPress);
    };
  }, [generating, isModelSelectionOpen, defaultModel]); // Add dependencies here


  const ModelSelectionButton = ({ model, enabled = true }: { model: ModelOptions; enabled?: boolean }) => {
    return (
      <div className='flex justify-center'>
        <button
          className={`btn h-16 w-28 p-2 text-center justify-center rounded-lg md:border 
          ${
            enabled ? 'btn-neutral border-gray-900 dark:border-gray-200' 
              : 
                      'btn-disabled bg-gray-100 text-gray-500 border-gray-300 dark:bg-gray-700 dark:border-gray-500/70 dark:text-gray-500/70'
          }`}
          disabled={!enabled}
          onClick={() => enabled && handleModelSelect(model)}
        >
          {supportedModels[model].displayName.trim()}
        </button>
      </div>
    );
  };
  

  const anthropicEnable:string = import.meta.env.VITE_ANTHROPIC_ENABLE || "N";
  // console.log(`Anthropic Enable: ${anthropicEnable}`)

  return (
    <>
      <a
        className={`flex items-center rounded-md hover:bg-gray-500/10 transition-all duration-200 text-white text-sm flex-shrink-0 ${
          generating ? 'cursor-not-allowed opacity-40' : 'cursor-pointer opacity-100'
        } ${folder ? 'justify-start' : 'py-2 px-2 gap-3 mb-2 border border-white/20'}`}
        onClick={() => {
          if (!generating) setIsModelSelectionOpen(true);
        }}
        title={folder ? String(t('newChat')) : 'Hotkey: Ctrl + /'}
      >
        {folder ? (
          <div className='max-h-0 parent-sibling-hover:max-h-10 hover:max-h-10 parent-sibling-hover:py-2 hover:py-2 px-2 overflow-hidden transition-all duration-200 delay-500 text-sm flex gap-3 items-center text-gray-100'>
            <PlusIcon /> {t('newChat')}
          </div>
        ) : (
          <>
            <PlusIcon />
            <span className='inline-flex text-white text-sm'>{t('newChat')}</span>
          </>
        )}
      </a>

      {isModelSelectionOpen && (
        <PopupModal
          title="New Chat: Select Model"
          setIsModalOpen={setIsModelSelectionOpen}
          cancelButton={true}
        >
          <>
            <style>
            {`
                .min-w-btn {
                    min-width: 160px; /* Adjust this value based on your needs */
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            `}
            </style>
            { replaceCurrentChat && (
            <div className='flex flex-col items-center text-center mt-4 mb-2 text-lg font-medium text-red-700'>
                <div className='border-2 border-red-700 p-2'>
                  <div>Warning: currently active chat will be dropped, replaced with new chat.</div>
                  <div>See "Drop active chat when New Chat is created" toggle in Settings.</div>
                </div>
            </div>)}
            <table className='w-full text-center text-gray-700 dark:text-gray-300' style={{ tableLayout: 'fixed' }}>
                <tbody>
                <tr><td className='pt-2 text-lg' colSpan={3}><b>OpenAI: iconic language models that started it all</b></td></tr>
                <tr>
                    <td style={{ paddingTop: '20px' }}>
                      <ModelSelectionButton model='gpt-3.5-turbo'/>
                    </td>
                    <td style={{ paddingTop: '20px' }}>
                      <ModelSelectionButton model='gpt-4' enabled={false}/>
                    </td>
                    <td style={{ paddingTop: '20px' }}>
                      <ModelSelectionButton model='gpt-4-turbo'/>
                    </td>                    
                </tr>
                <tr style={{ paddingTop: '20px', paddingBottom: '20px' }}>
                  <td className="p-2" dangerouslySetInnerHTML={{ __html: supportedModels['gpt-3.5-turbo'].usage_description }}></td>
                  <td className="p-2" dangerouslySetInnerHTML={{ __html: supportedModels['gpt-4'].usage_description }}></td>
                  <td className="p-2" dangerouslySetInnerHTML={{ __html: supportedModels['gpt-4-turbo'].usage_description }}></td>
                </tr>
                <tr style={{ paddingTop: '20px', paddingBottom: '20px', verticalAlign: 'top' }}>
                  <td style={{ paddingTop: '10px' }} dangerouslySetInnerHTML={{ __html: supportedModels['gpt-3.5-turbo'].cost_description }}></td>
                  <td style={{ paddingTop: '10px' }} dangerouslySetInnerHTML={{ __html: supportedModels['gpt-4'].cost_description }}></td>
                  <td style={{ paddingTop: '10px' }} dangerouslySetInnerHTML={{ __html: supportedModels['gpt-4-turbo'].cost_description }}></td>
                </tr>

                <tr><td className='pt-6 text-lg' colSpan={3}></td></tr>
                {(anthropicEnable=='Y') && (
                  <>
                    <tr><td className='pt-2 text-lg border-t' colSpan={3}><b>Claude 3: newest and hottest models by Anthropic</b></td></tr>
                    <tr><td className='' colSpan={3}><a className={`text-indigo-500/80 hover:text-indigo-500/80 visited:text-indigo-700 dark:text-indigo-400/80 dark:hover:text-indigo-300/80 dark:visited:text-indigo-400`} 
                        href="https://www.anthropic.com/news/claude-3-family">https://www.anthropic.com/news/claude-3-family</a></td></tr>
                    <tr>
                        <td style={{ paddingTop: '20px' }}>
                          <ModelSelectionButton model='claude-3-haiku'/>
                        </td>
                        <td style={{ paddingTop: '20px' }}>
                          <ModelSelectionButton model='claude-3-sonnet'/>
                        </td>
                        <td style={{ paddingTop: '20px' }}>
                          <ModelSelectionButton model='claude-3-opus'/>
                        </td>  
                    </tr>
                    <tr style={{ paddingTop: '20px', paddingBottom: '20px' }}>
                      <td className="p-2" dangerouslySetInnerHTML={{ __html: supportedModels['claude-3-haiku'].usage_description }}></td>
                      <td className="p-2" dangerouslySetInnerHTML={{ __html: supportedModels['claude-3-sonnet'].usage_description }}></td>
                      <td className="p-2" dangerouslySetInnerHTML={{ __html: supportedModels['claude-3-opus'].usage_description }}></td>
                    </tr>
                    <tr style={{ paddingTop: '20px', paddingBottom: '20px', verticalAlign: 'top' }}>
                      <td style={{ paddingTop: '10px' }} dangerouslySetInnerHTML={{ __html: supportedModels['claude-3-haiku'].cost_description }}></td>
                      <td style={{ paddingTop: '10px' }} dangerouslySetInnerHTML={{ __html: supportedModels['claude-3-sonnet'].cost_description }}></td>
                      <td style={{ paddingTop: '10px' }} dangerouslySetInnerHTML={{ __html: supportedModels['claude-3-opus'].cost_description }}></td>
                    </tr>

                  </>
                )}
                </tbody>
            </table>
            
          </>
        </PopupModal>
      )}
    </>
  );
};

export default NewChat;
