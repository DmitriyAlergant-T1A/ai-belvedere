import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';

import PopupModal from '@components/PopupModal';
import SettingIcon from '@icon/SettingIcon';
import ThemeSwitcher from '@components/Menu/SettingsMenu/ThemeSwitcher';
import LanguageSelector from '@components/Menu/SettingsMenu/LanguageSelector';
import SystemPromptConfig from './SystemPromptConfig';
import AutoTitleToggle from './Toggles/AutoTitleToggle';
import ShowSystemPromptToggle from './Toggles/ShowSystemPromptToggle';
import InlineLatexToggle from './Toggles/InlineLatexToggle';
import EnterToSubmitToggle from './Toggles/EnterToSubmitToggle';
import RequestTokensCountToggle from './Toggles/RequestTokensCountToggle'
import TotalTokenCostToggle from './Toggles/TotalTokenCostToggle';
import ChatNamesAsPageTitlesToggle from './Toggles/ChatNamesAsPageTitlesToggle';
import PromptLibraryMenu from '@components/Menu/SettingsMenu/PromptLibraryMenu';
import ChatConfigMenu from '@components/Menu/SettingsMenu/DefaultChatConfigMenu';
import ApiButton from './ApiButton';
import ClearConversation from '@components/Menu/SettingsMenu/ClearConversation';
import ImportExportChat from '@components/Chat/ImportExportChat';
import { _defaultChatConfig, _defaultSystemMessage } from '@constants/chat';
import ReplaceCurrentChatToggle from './Toggles/ReplaceCurrentChatToggle';



const SettingsMenu = () => {
  const { t } = useTranslation();

  const theme = useStore.getState().theme;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);
  return (
    <>
      <a
        className='flex py-2 px-2 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm'
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <SettingIcon className='w-4 h-4' /> {t('setting') as string}
      </a>
      {isModalOpen && (
        <PopupModal
          setIsModalOpen={setIsModalOpen}
          title={t('setting') as string}
          cancelButton={false}
        >
          <div className='p-6 border-b border-gray-200 dark:border-gray-600 flex-col flex-col items-start gap-4 w-96'>
            <SystemPromptConfig />
            <div className='p-1'><></></div>
            <LanguageSelector />
            <div className='p-1'><></></div>
            <div className='flex flex-col gap-3'>
                <ShowSystemPromptToggle />
                <AutoTitleToggle />
                <ChatNamesAsPageTitlesToggle/>
                <EnterToSubmitToggle />
                <TotalTokenCostToggle />
                <RequestTokensCountToggle />
                <ReplaceCurrentChatToggle />
                {/* <InlineLatexToggle /> */}
            </div>
            <div className = "block">
              <div className='p-1 mt-4'><ThemeSwitcher /></div>
              <div className='p-1'><PromptLibraryMenu /></div>
              <div className='p-1'><ChatConfigMenu /></div>
              <div className='p-1'><ApiButton /></div>
              <div className='p-1'><ImportExportChat /></div>
              <div className='p-1'><ClearConversation /></div>
            </div>
          </div>
        </PopupModal>
      )}
    </>
  );
};

export default SettingsMenu;
