import { v4 as uuidv4 } from 'uuid';

import {
  Folder,
  FolderCollection,
  LocalStorageInterfaceV0ToV1,
  LocalStorageInterfaceV1ToV2,
  LocalStorageInterfaceV2ToV3,
  LocalStorageInterfaceV3ToV4,
  LocalStorageInterfaceV4ToV5,
  LocalStorageInterfaceV5ToV6,
  LocalStorageInterfaceV6ToV7,
  LocalStorageInterfaceV7oV8,
  LocalStorageInterfaceV8oV9,
  LocalStorageInterfaceV9oV10,
} from '@type/chat';
import {
  _defaultChatConfig,
  defaultModel,
} from '@constants/chat';
import { persist } from 'zustand/middleware';
import { defaultAPIEndpoint } from '@constants/apiEndpoints';

export const migrateV8 = (persistedState: LocalStorageInterfaceV8oV9) => {
 
  if (persistedState.defaultChatConfig) {
    persistedState.defaultChatConfig.maxPromptTokens = _defaultChatConfig.maxPromptTokens;
    persistedState.defaultChatConfig.maxGenerationTokens = _defaultChatConfig.maxGenerationTokens;
    //delete persistedState.defaultChatConfig.max_tokens; 
  }

  // Update each chat's tokens settings
  persistedState.chats.forEach((chat) => {
    if (chat.config) {
      chat.config.maxPromptTokens = _defaultChatConfig.maxPromptTokens;
      chat.config.maxGenerationTokens = _defaultChatConfig.maxGenerationTokens;
      //delete chat.config.max_tokens; // Remove old setting
    }
  });
};


export const migrateV9 = (persistedState: LocalStorageInterfaceV9oV10) => {
  //One-time reset of the API Endpoint, new default does not comptain /chat/completions
  persistedState.apiEndpoint = defaultAPIEndpoint
};