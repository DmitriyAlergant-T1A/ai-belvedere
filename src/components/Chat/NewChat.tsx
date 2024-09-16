// NewChat.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';
import PlusIcon from '@icon/PlusIcon';
import useAddChat from '@hooks/useAddChat';
import PopupModal from '@components/PopupModal'; // Ensure this is correctly imported
import { ModelOptions } from '@type/chat';
import { supportedModels } from '@constants/chat';

const NewChat = ({ folder, hotkeysEnabled }: { folder?: string; hotkeysEnabled: boolean }) => {
  const { t } = useTranslation();
  const generating = useStore((state) => state.generating);
  const [isModelSelectionOpen, setIsModelSelectionOpen] = useState(false);
  const [confirmationModel, setConfirmationModel] = useState<ModelOptions | null>(null);
  const addChat = useAddChat(); 

  const defaultModel = useStore((state) => state.defaultChatConfig.model);

  const replaceCurrentChat = useStore((state) => state.replaceCurrentChat);

  const handleModelSelect = useCallback((model: string) => {
    const selectedModel = model as ModelOptions;
    if (supportedModels[selectedModel].choiceConfirmationPrompt) {
      setConfirmationModel(selectedModel);
    } else {
      addChat(folder, selectedModel);
      setIsModelSelectionOpen(false);
    }
  }, [folder, addChat]);

  const handleConfirmation = useCallback((confirmed: boolean) => {
    if (confirmed && confirmationModel) {
      addChat(folder, confirmationModel);
      setIsModelSelectionOpen(false);
    }
    setConfirmationModel(null);
  }, [folder, confirmationModel, addChat]);

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

    //console.log("hotkeysEnabled=", hotkeysEnabled);

    if (hotkeysEnabled && !folder)  //Only handle for the main "New Chat" button not additional ones under Folders
      window.addEventListener('keypress', handleEnterKeyPress);

    // Cleanup function to remove event listener
    return () => {
        window.removeEventListener('keypress', handleEnterKeyPress);
    };
  }, [generating, isModelSelectionOpen, defaultModel]); // Add dependencies here


  const ModelSelectionButton = ({ model, backgroundColor }: { model: ModelOptions; backgroundColor?: string }) => {
    return (
      <div className='flex justify-center'>
        <button
          className={`btn h-16 w-28 p-2 text-center justify-center rounded-lg md:border 
          ${
            supportedModels[model].enabled ? 'btn-neutral border-gray-900 dark:border-gray-200 font-semibold' 
              : 'btn-disabled bg-gray-100 text-gray-400 border-gray-300 dark:bg-gray-700 dark:border-gray-500/70 dark:text-gray-500/70'
          }
          ${backgroundColor || ''}`}
          disabled={!supportedModels[model].enabled}
          onClick={() => supportedModels[model].enabled && handleModelSelect(model)}
        >
          {supportedModels[model].displayName.trim()}
        </button>
      </div>
    );
  };  

  const ModelCell = ({ model, backgroundColor }: { model: ModelOptions; backgroundColor?: string }) => {
    const modelDetails = supportedModels[model];
    return (
      <div className="ml-1 mr-1 text-center align-top">
        <ModelSelectionButton model={model} backgroundColor={backgroundColor} />
        <div className={`${supportedModels[model].enabled ? 'text-gray-800 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500/70'}`}>
          <div className="mt-1" dangerouslySetInnerHTML={{ __html: `<strong>From:</strong> ${modelDetails.released_description ?? ''}` }} />
          <div className="mt-1" dangerouslySetInnerHTML={{ __html: `<strong>Cost:</strong> ${modelDetails.cost_description}` }} />
        </div>
      </div>
    );
  };
  
  const ModelGroup = ({ models }: { models: (ModelOptions | null)[] }) => {
    if (models.length === 1 && models[0]) {
      return <ModelCell model={models[0]} backgroundColor={supportedModels[models[0]].choiceButtonColor} />;
    }
    if (models.length === 2) {
      return (
        <table className="w-full h-full border-collapse">
          <tbody>
            <tr>
              {models.map((model, index) => (
                <td key={index} className="p-0 w-1/2">
                  {model && <ModelCell model={model} backgroundColor={supportedModels[model].choiceButtonColor} />}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      );
    }
    return null;
  };
  
  const ModelRow = ({ provider, description, models }: { provider: string; description: string; models: (ModelOptions | null)[][] }) => (
    <tr>
      <td className="hidden md:table-cell p-2 text-left font-semibold bg-gray-100 dark:bg-gray-800 border border-slate-400 dark:border-gray-300 text-gray-800 dark:text-gray-300 align-top">
        {provider}
        <div className="font-normal text-sm mt-2 [&_a]:text-blue-600 [&_a]:dark:text-blue-400 [&_br]:block [&_br]:mb-2 [&_br]:mt-2
                          [&_br]:block [&_br]:mb-2" 
          dangerouslySetInnerHTML={{ __html: description }} 
        />
      </td>
      {models.map((modelGroup, index) => (
        <td key={index} className="p-2 border border-slate-400 dark:border-gray-400 align-top">
          {modelGroup ? <ModelGroup models={modelGroup} /> : null}
        </td>
      ))}
    </tr>
  );
  

  const anthropic_Enable:string = import.meta.env.VITE_ANTHROPIC_ENABLE || "N";
  const openai_o1_Enable:string = import.meta.env.VITE_OPENAI_O1_ENABLE || "N";

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
          <div className='w-3xl'>
            {replaceCurrentChat && (
              <div className='flex flex-col items-center text-center mt-4 mb-2 text-lg font-medium text-red-700'>
                <div className='border-2 border-red-700 p-2'>
                  <div>Warning: currently active chat will be dropped, replaced with new chat.</div>
                  <div>See "Drop active chat when New Chat is created" toggle in Settings.</div>
                </div>
              </div>
             )}
             <div className="overflow-x-auto">
               <table className='w-3xl text-left align-middle text-sm text-center border-none'>
                 <thead className="hidden md:table-header-group">
                   <tr className="bg-gray-100 dark:bg-gray-800 border border-slate-400 dark:border-gray-600 text-gray-800 dark:text-gray-300">
                     <th className="w-[25%] p-2 border-none"></th>
                     <th className="w-[15%] p-2 border border-slate-400 dark:border-gray-400">Smaller class: cheaper and faster models, still very strong</th>
                     <th className="w-[25%] p-2 border border-slate-400 dark:border-gray-400">Leading frontier models. Best artificial intelligence available to us today.</th>
                   </tr>
                 </thead>
                 <tbody>
                   <ModelRow 
                     provider="Traditional LLM models"
                     description="Rely on attention mechanism and pre-trained world knowledge for immediate and continous responding token-by-token. Refined intelligence."
                     models={[['gpt-4o-mini'], ['gpt-4o', 'claude-3.5-sonnet']]}
                   />
                  <ModelRow 
                    provider="Reasoning and Iterative Models"
                    description='Reasoning model "thinks" before responding. It uses its underlying LLM to plan a multi-step thought process, 
                      think "aloud" (internally), and iterate many times - until satisfied to respond.'
                    models={[['o1-mini'], ['o1-preview', null]]}
                  />
                 </tbody>
               </table>
             </div>
           </div>
         </PopupModal>
       )}

      {confirmationModel && (
        <PopupModal
          title={`Confirmation: ${supportedModels[confirmationModel].displayName}`}
          setIsModalOpen={() => setConfirmationModel(null)}
          cancelButton={false}
        >
          <div className='p-4 text-left'>
            <p 
              className='[&_br]:content-[""] [&_br]:block [&_br]:mb-2 text-gray-800 dark:text-gray-200'
              dangerouslySetInnerHTML={{ __html: supportedModels[confirmationModel].choiceConfirmationPrompt ?? '' }} 
            />
            <div className='mt-4 flex justify-center space-x-4'>
              <button
                className='btn btn-neutral'
                onClick={() => handleConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className='btn btn-primary'
                onClick={() => handleConfirmation(true)}
              >
                Proceed
              </button>
            </div>
          </div>
        </PopupModal>
      )}
    </>
  );
};

export default NewChat;
