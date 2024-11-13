import { StoreSlice } from './store';
import { Theme } from '@type/theme';
import { ConfigInterface, TotalTokenUsed } from '@type/chat';
import { _defaultChatConfig, _defaultSystemMessage } from '@constants/chat';

export interface ConfigSlice {
  openConfig: boolean;
  theme: Theme;
  autoTitle: boolean;
  requestTokensCount: boolean;
  hideMenuOptions: boolean;
  showSystemPrompt: boolean;
  addCompanyPromptToggle: boolean;
  defaultChatConfig: ConfigInterface;
  defaultSystemMessage: string;
  companySystemPrompt: string;
  hideSideMenu: boolean;
  enterToSubmit: boolean;
  inlineLatex: boolean;
  markdownMode: boolean;
  countTotalTokens: boolean;
  chatNamesAsPageTitles: boolean;
  totalTokenUsed: TotalTokenUsed;
  replaceCurrentChat: boolean;
  setOpenConfig: (openConfig: boolean) => void;
  setTheme: (theme: Theme) => void;
  setAutoTitle: (autoTitle: boolean) => void;
  setRequestTokensCount: (requestTokensCount: boolean) => void;
  setShowSystemPrompt: (showSystemPrompt: boolean) => void;
  setAddCompanyPromptToggle: (addCompanyPromptToggle: boolean) => void;
  setDefaultChatConfig: (defaultChatConfig: ConfigInterface) => void;
  setDefaultSystemMessage: (defaultSystemMessage: string) => void;
  setcompanySystemPrompt: (companySystemPrompt: string) => void;
  setHideMenuOptions: (hideMenuOptions: boolean) => void;
  setHideSideMenu: (hideSideMenu: boolean) => void;
  setEnterToSubmit: (enterToSubmit: boolean) => void;
  setInlineLatex: (inlineLatex: boolean) => void;
  setMarkdownMode: (markdownMode: boolean) => void;
  setCountTotalTokens: (countTotalTokens: boolean) => void;
  setTotalTokenUsed: (totalTokenUsed: TotalTokenUsed) => void;
  setChatNamesAsPageTitles: (chatNamesAsPageTitles: boolean) => void;
  setReplaceCurrentChat: (replaceCurrentChat: boolean) => void;
  companyName: string;
  anthropicEnable: boolean;
  openaiO1Enable: boolean;
  checkAadAuth: boolean;
  demoMode: boolean;
  setCompanyName: (companyName: string) => void;
  setAnthropicEnable: (anthropicEnable: boolean) => void;
  setOpenaiO1Enable: (openaiO1Enable: boolean) => void;
  setCheckAadAuth: (checkAadAuth: boolean) => void;
  setDemoMode: (demoMode: boolean) => void;
}

export const createConfigSlice: StoreSlice<ConfigSlice> = (set, get) => ({
  openConfig: false,
  theme: 'light',
  hideMenuOptions: false,
  hideSideMenu: false,
  autoTitle: true,
  requestTokensCount: true,
  enterToSubmit: true,
  showSystemPrompt: false,
  addCompanyPromptToggle: true,
  defaultChatConfig: _defaultChatConfig,
  defaultSystemMessage: _defaultSystemMessage,
  companySystemPrompt: '',
  inlineLatex: false,
  markdownMode: true,
  countTotalTokens: true,
  chatNamesAsPageTitles: false,
  replaceCurrentChat: false,
  totalTokenUsed: {},
  companyName: import.meta.env.VITE_COMPANY_NAME ?? '',
  anthropicEnable: import.meta.env.VITE_ANTHROPIC_ENABLE=='Y' ?? true,
  openaiO1Enable: import.meta.env.VITE_OPENAI_O1_ENABLE=='Y' ?? false,
  checkAadAuth: import.meta.env.VITE_CHECK_AAD_AUTH=='Y' ?? false,
  demoMode: import.meta.env.VITE_DEMO_MODE=='Y' ?? false,
  
  setOpenConfig: (openConfig: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      openConfig: openConfig,
    }));
  },
  setTheme: (theme: Theme) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      theme: theme,
    }));
  },
  setAutoTitle: (autoTitle: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      autoTitle: autoTitle,
    }));
  },
  setRequestTokensCount: (requestTokensCount: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      requestTokensCount: requestTokensCount,
    }));
  },
  setChatNamesAsPageTitles: (chatNamesAsPageTitles: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      chatNamesAsPageTitles: chatNamesAsPageTitles,
    }));
  },
  setShowSystemPrompt: (showSystemPrompt: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      showSystemPrompt: showSystemPrompt,
    }));
  },
  setAddCompanyPromptToggle(addCompanyPromptToggle: boolean) {
    set((prev: ConfigSlice) => ({ 
      ...prev, 
      addCompanyPromptToggle: addCompanyPromptToggle
    }));
  },
  setDefaultChatConfig: (defaultChatConfig: ConfigInterface) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      defaultChatConfig: defaultChatConfig,
    }));
  },
  setDefaultSystemMessage: (defaultSystemMessage: string) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      defaultSystemMessage: defaultSystemMessage,
    }));
  },
  setcompanySystemPrompt: (companySystemPrompt: string) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      companySystemPrompt: companySystemPrompt,
    }));
  },
  setHideMenuOptions: (hideMenuOptions: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      hideMenuOptions: hideMenuOptions,
    }));
  },
  setHideSideMenu: (hideSideMenu: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      hideSideMenu: hideSideMenu,
    }));
  },
  setEnterToSubmit: (enterToSubmit: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      enterToSubmit: enterToSubmit,
    }));
  },
  setInlineLatex: (inlineLatex: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      inlineLatex: inlineLatex,
    }));
  },
  setMarkdownMode: (markdownMode: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      markdownMode: markdownMode,
    }));
  },
  setCountTotalTokens: (countTotalTokens: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      countTotalTokens: countTotalTokens,
    }));
  },
  setTotalTokenUsed: (totalTokenUsed: TotalTokenUsed) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      totalTokenUsed: totalTokenUsed,
    }));
  },
  setReplaceCurrentChat(replaceCurrentChat) {
    set((prev: ConfigSlice) => ({ ...prev, replaceCurrentChat }));
  },
  setCompanyName: (companyName: string) => {
    set((prev: ConfigSlice) => ({ ...prev, companyName }));
  },
  setAnthropicEnable: (anthropicEnable: boolean) => {
    set((prev: ConfigSlice) => ({ ...prev, anthropicEnable }));
  },
  setOpenaiO1Enable: (openaiO1Enable: boolean) => {
    set((prev: ConfigSlice) => ({ ...prev, openaiO1Enable }));
  },
  setCheckAadAuth: (checkAadAuth: boolean) => {
    set((prev: ConfigSlice) => ({ ...prev, checkAadAuth }));
  },
  setDemoMode: (demoMode: boolean) => {
    set((prev: ConfigSlice) => ({ ...prev, demoMode }));
  }
});