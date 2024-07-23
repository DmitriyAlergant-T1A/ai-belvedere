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
import ReactMarkdown from 'react-markdown';

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


  const ModelSelectionButton = ({ model }: { model: ModelOptions }) => {
    return (
      <div className='flex justify-center'>
        <button
          className={`btn h-16 w-28 p-2 text-center justify-center rounded-lg md:border 
          ${
            supportedModels[model].enabled ? 'btn-neutral border-gray-900 dark:border-gray-200 font-semibold' 
              : 'btn-disabled bg-gray-100 text-gray-400 border-gray-300 dark:bg-gray-700 dark:border-gray-500/70 dark:text-gray-500/70'
          }`}
          disabled={!supportedModels[model].enabled}
          onClick={() => supportedModels[model].enabled && handleModelSelect(model)}
        >
          {supportedModels[model].displayName.trim()}
        </button>
      </div>
    );
  };

  const ModelCell = ({ model }: { model: ModelOptions }) => {
    const modelDetails = supportedModels[model];
    return (
      <td className="p-4 text-center align-top border border-slate-400 dark:border-gray-400 ">
        <ModelSelectionButton model={model} />
        <div className={`${supportedModels[model].enabled ? 'text-gray-800 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500/70'}`}>
          <div className="mt-1">
            <ReactMarkdown>{'**Released:** ' + modelDetails.released_description ?? ''}</ReactMarkdown>
          </div>
          <div className="mt-1">
            <ReactMarkdown>{'**Cost:** ' + modelDetails.cost_description}</ReactMarkdown>
          </div>
        </div>
      </td>
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
          <div className='w-full'>
            {replaceCurrentChat && (
              <div className='flex flex-col items-center text-center mt-4 mb-2 text-lg font-medium text-red-700'>
                <div className='border-2 border-red-700 p-2'>
                  <div>Warning: currently active chat will be dropped, replaced with new chat.</div>
                  <div>See "Drop active chat when New Chat is created" toggle in Settings.</div>
                </div>
              </div>
            )}
            <table className='w-full text-left align-middle text-sm text-center border-none'>
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 border border-slate-400 dark:border-gray-600 text-gray-800 dark:text-gray-300">
                  <th className="w-1/4 p-2 border-none"></th>
                  <th className="w-1/4 p-2 border border-slate-400 dark:border-gray-400">Small-Class models. Cheap, fast, efficient - but not smartest. Works well in simpler use-cases.</th>
                  <th className="w-1/4 p-2 border border-slate-400 dark:border-gray-400">Earlier generation flagships. Mostly obsolete but may still shine in some niche situations.</th>
                  <th className="w-1/4 p-2 border border-slate-400 dark:border-gray-400">Current flagship models. Today's best AI intelligence leading in most use-cases.</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 text-left font-semibold bg-gray-100 dark:bg-gray-800 border border-slate-400 dark:border-gray-300 text-gray-800 dark:text-gray-300">
                      OpenAI Industry Leading Models that started it all.
                  </td>
                  <ModelCell model='gpt-4o-mini' />
                  <ModelCell model='gpt-4-turbo' />
                  <ModelCell model='gpt-4o' />
                </tr>
                {(anthropicEnable=='Y') && (
                  <tr>
                    <td className="p-2 text-left font-semibold bg-gray-100 dark:bg-gray-800 border border-slate-400 dark:border-gray-300 text-gray-800 dark:text-gray-300">
                        Anthropic Models are a very strong alternative.<br/>Great for Coding!
                    </td>
                    <ModelCell model='claude-3-haiku' />
                    <ModelCell model='claude-3-opus' />
                    <ModelCell model='claude-3.5-sonnet' />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </PopupModal>
      )}
    </>
  );
};

export default NewChat;
