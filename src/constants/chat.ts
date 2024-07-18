import { v4 as uuidv4 } from 'uuid';
import { ChatInterface, ConfigInterface, ModelOptions, ModelsList } from '@type/chat';
import useStore from '@store/store';

const date = new Date();
const dateString =
  date.getFullYear() +
  '-' +
  ('0' + (date.getMonth() + 1)).slice(-2) +
  '-' +
  ('0' + date.getDate()).slice(-2);

const companyName:string = import.meta.env.VITE_COMPANY_NAME || "";

export const _defaultSystemMessage =
  import.meta.env.VITE_DEFAULT_SYSTEM_MESSAGE ??
  `Carefully follow the user's instructions. Respond using Markdown. Respond briefly, elaborate further when asked. If asked for code writing, only give that code, withhold explanations until requested. If asked for code modification, only give the relevant or changed pieces of code. Unless specifically requested provide a complete snippet, then comply.`;

export const defaultModel: ModelOptions = 'gpt-4o';

export const defaultTitleGenModel: ModelOptions = 'gpt-3.5-turbo';

export const supportedModels: ModelsList = {
  'gpt-3.5-turbo': {
    maxModelInputTokens: 16384-4096,
    maxModelCompletionTokens: 4096,
    displayName: 'GPT-3.5',
    enabled: false,
    apiAliasCurrent: 'gpt-3.5-turbo',
    portkeyProvider: 'openai',
    titleGenModel: 'gpt-3.5-turbo',
    cost: {
      prompt: { price: 0.5, unit: 1000000 },
      completion: { price: 1.5, unit: 1000000 },
    },
    usage_description: '',
    cost_description: ''
  },
  'gpt-4': {
    maxModelInputTokens: 8192,
    maxModelCompletionTokens: 4096,
    displayName: 'GPT-4 Original',
    enabled: false,
    apiAliasCurrent: 'gpt-4',
    portkeyProvider: 'openai',
    titleGenModel: 'gpt-4o-mini',
    cost: {
      prompt: { price: 30.00, unit: 1000000 },
      completion: { price: 60.00, unit: 1000000 },
    },
    usage_description:  '',
    cost_description: ''
  },
  'gpt-4-turbo-preview': {
    maxModelInputTokens: 128000-4096,
    maxModelCompletionTokens: 4096,
    displayName: 'GPT-4 Turbo Preview (legacy)',
    enabled: false,
    apiAliasCurrent: 'gpt-4-turbo-preview',
    portkeyProvider: 'openai',
    titleGenModel: 'gpt-4o-mini',
    cost: {
      prompt: { price: 10.00, unit: 1000000 },
      completion: { price: 30.00, unit: 1000000 },
    },
    usage_description: '',
    cost_description: '',
  },
  'claude-3-sonnet': {
    maxModelInputTokens: 200000-4096,
    maxModelCompletionTokens: 4096,
    displayName: 'Claude 3 Sonnet',
    enabled: false,
    apiAliasCurrent: 'claude-3-sonnet-20240229',
    portkeyProvider: 'anthropic',
    titleGenModel: 'claude-3-haiku', 
    cost: {
      prompt: { price: 3.00, unit: 1000000 },
      completion: { price: 15.00, unit: 1000000 },
    },
    usage_description: '',
    cost_description: ''
  },
  'gpt-4o-mini': {
    maxModelInputTokens: 128000-4096,
    maxModelCompletionTokens: 4096,
    displayName: 'GPT-4o Mini',
    enabled: true,
    apiAliasCurrent: 'gpt-3.5-turbo',
    portkeyProvider: 'openai',
    titleGenModel: 'gpt-3.5-turbo',
    cost: {
      prompt: { price: 0.15, unit: 1000000 },
      completion: { price: 0.6, unit: 1000000 },
    },
    usage_description: "Latest and greatest small class model, they use it now in 'free' ChatGPT since July 2024",
    cost_description: 'Cost: <b>baseline</b>'
  },
  'gpt-4-turbo': {
    maxModelInputTokens: 128000-4096,
    maxModelCompletionTokens: 4096,
    displayName: 'GPT-4 Turbo',
    enabled: true,
    apiAliasCurrent: 'gpt-4-turbo',
    portkeyProvider: 'openai',
    titleGenModel: 'gpt-4o-mini',
    cost: {
      prompt: { price: 10.00, unit: 1000000 },
      completion: { price: 30.00, unit: 1000000 },
    },
    usage_description: "OpenAI's previous generation flagship, March 2024.</b> May still beat GPT-4o in some use-cases.",
    cost_description: 'Cost: <b>60x</b> baseline',
  },
  'gpt-4o': {
    maxModelInputTokens: 128000-4096,
    maxModelCompletionTokens: 4096,
    displayName: 'GPT-4o',
    enabled: true,
    apiAliasCurrent: 'gpt-4o',
    portkeyProvider: 'openai',
    titleGenModel: 'gpt-4o-mini',
    cost: {
      prompt: { price: 5.00, unit: 1000000 },
      completion: { price: 15.00, unit: 1000000 },
    },
    usage_description: "OpenAI's current flagship model, industry leading. May 2024. Very strong but reasonably priced.",
    cost_description: 'Cost: <b>30x</b> baseline',
  },
  'claude-3-haiku': {
    maxModelInputTokens: 200000-4096,
    maxModelCompletionTokens: 4096,
    displayName: 'Claude 3 Haiku',
    enabled: true,
    apiAliasCurrent: 'claude-3-haiku-20240307',
    portkeyProvider: 'anthropic',
    titleGenModel: 'claude-3-haiku',
    cost: {
      prompt: { price: 0.25, unit: 1000000 },
      completion: { price: 1.25, unit: 1000000 },
    },
    usage_description: 'Strong small-class model (fast and cheap) by Anthropic, works great for many use-cases',
    cost_description: 'Cost: <b>2x</b> baseline'
  },
  'claude-3-opus': {
    maxModelInputTokens: 200000-4096,
    maxModelCompletionTokens: 4096,
    displayName: 'Claude 3 Opus',
    enabled: true,
    apiAliasCurrent: 'claude-3-opus-20240229',
    portkeyProvider: 'anthropic',
    titleGenModel: 'claude-3-haiku', 
    cost: {
      prompt: { price: 15.00, unit: 1000000 },
      completion: { price: 75.00, unit: 1000000 },
    },
    usage_description: "Anthropic's previous flagship, Feb 2024. Intelligent but expensive. Still shines in some use-cases.",
    cost_description: 'Cost: <b>100x</b> baseline'
  },
  'claude-3.5-sonnet': {
    maxModelInputTokens: 200000-4096,
    maxModelCompletionTokens: 4096,
    displayName: 'Claude 3.5 Sonnet',
    enabled: true,
    apiAliasCurrent: 'claude-3-5-sonnet-20240620',
    portkeyProvider: 'anthropic',
    titleGenModel: 'claude-3-haiku', 
    cost: {
      prompt: { price: 3.00, unit: 1000000 },
      completion: { price: 15.00, unit: 1000000 },
    },
    usage_description: "Anthropic's newest mid-class flagship, June 2024. Competes head-to-head with gpt-4o.",
    cost_description: 'Cost: <b>20x</b> baseline'
  }
};

export const _defaultChatConfig: ConfigInterface = {
  model: defaultModel,
  maxPromptTokens: 8000,
  maxGenerationTokens: 4000,
  temperature: 0.3,
  presence_penalty: 0,
  top_p: 0.2,
  frequency_penalty: 0.1,
};

export const generateDefaultChat = (
  title?: string,
  folder?: string
): ChatInterface => ({
  id: uuidv4(),
  title: title ? title : 'New Chat',
  messages: [{ 
      role: 'system', 
      content: 
        (useStore.getState().addCompanyPromptToggle ? useStore.getState().companySystemPrompt + '\n\n' : '')
        + 
        (useStore.getState().defaultSystemMessage ?? '')
            }],
  config: { ...useStore.getState().defaultChatConfig },
  titleSet: false,
  folder,
});

export const codeLanguageSubset = [
  'python',
  'javascript',
  'java',
  'go',
  'bash',
  'c',
  'cpp',
  'csharp',
  'css',
  'diff',
  'graphql',
  'json',
  'kotlin',
  'less',
  'lua',
  'makefile',
  'markdown',
  'objectivec',
  'perl',
  'php',
  'php-template',
  'plaintext',
  'python-repl',
  'r',
  'ruby',
  'rust',
  'scss',
  'shell',
  'sql',
  'swift',
  'typescript',
  'vbnet',
  'wasm',
  'xml',
  'yaml',
];
