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

export const _defaultSystemMessage =
  import.meta.env.VITE_DEFAULT_SYSTEM_MESSAGE ??
  `Carefully follow the user's instructions. Respond using Markdown. Respond briefly, elaborate further when asked. If asked for code writing, only give that code, withhold explanations until requested. If asked for code modification, only give the relevant or changed pieces of code. Unless specifically requested provide a complete snippet, then comply.`;

export const defaultModel: ModelOptions = 'chatgpt-4o-latest';

export const defaultTitleGenModel: ModelOptions = 'gpt-4o-mini';

export const supportedModels: ModelsList = {
  'gpt-4o-mini': {
    maxModelInputTokens: 128000-16384,
    maxModelCompletionTokens: 16384,
    displayName: 'OpenAI GPT 4o Mini',
    enabled: true,
    apiAliasCurrent: 'gpt-4o-mini',
    modelProvider: 'openai',
    titleGenModel: 'gpt-4o-mini',
    cost: {
      prompt: { price: 0.15, unit: 1000000 },
      completion: { price: 0.6, unit: 1000000 },
    },
    usage_description: "New leader in 'small' class. It now serves free ChatGPT users.",
    released_description: 'July 2024',
    cost_description: 'baseline<br/>"<i>too cheap to meter</i>"',
    use_system_prompt: true,
    use_stream: true
  },
  'gpt-4o': {
    maxModelInputTokens: 128000-16384,
    maxModelCompletionTokens: 16384,
    displayName: 'OpenAI GPT 4o (2024-05-13)',
    choiceButtonColor: 'bg-green-100 dark:bg-green-800',
    enabled: true,
    apiAliasCurrent: 'gpt-4o-2024-08-06',
    modelProvider: 'openai',
    titleGenModel: 'gpt-4o-mini',
    cost: {
      prompt: { price: 5.0, unit: 1000000 },
      completion: { price: 15.00, unit: 1000000 },
    },
    usage_description: "Current flagship, industry leading model.",
    released_description: 'May 2024',
    cost_description: '30x baseline<br/>',
    use_system_prompt: true,
    use_stream: true
  },
  'chatgpt-4o-latest': {
    maxModelInputTokens: 128000-16384,
    maxModelCompletionTokens: 16384,
    displayName: 'OpenAI ChatGPT 4o (Latest)',
    choiceButtonColor: 'bg-green-100 dark:bg-green-800',
    enabled: true,
    apiAliasCurrent: 'chatgpt-4o-latest',
    modelProvider: 'openai',
    titleGenModel: 'gpt-4o-mini',
    cost: {
      prompt: { price: 5.0, unit: 1000000 },
      completion: { price: 15.00, unit: 1000000 },
    },
    usage_description: "Current flagship, industry leading model.",
    released_description: 'May 2024',
    cost_description: '30x baseline<br/>',
    use_system_prompt: true,
    use_stream: true
  },
  'o1-preview': {
    maxModelInputTokens: 131072-32768,
    maxModelCompletionTokens: 32768,
    displayName: 'OpenAI GPT o1 (preview) w/Reasoning',
    choiceConfirmationPrompt: 'This is a powerful model. It consumes significant amount of compute, and will take time to respond.<br>' 
      + 'It is recommended to use this model when smaller models could not solve the problem.<br/>' 
      + 'Make sure your prompt is concise with all neccessary context. See <a href="https://platform.openai.com/docs/guides/reasoning/advice-on-prompting" target="_blank" class="text-blue-600 dark:text-blue-400">Advice on Prompting</a>.<br/>' 
      + 'Each request may cost approximately <b>$0.15 to $1.00</b>, please keep an eye on the costs indicator.<br/>'
      + 'Also have you tried the <b>o1 Mini</b> reasoning model? It is comparable in capabilities but 5x cheaper.<br/>' 
      + 'Let us know your feedback! We will love to hear <u>specific examples</u> of situations where regular LLMs (like <b>Claude 3.5 Sonnet</b>) have failed, and then this Reasoning model has performed substantially better?',
    enabled: import.meta.env.VITE_OPENAI_O1_ENABLE=='Y',
    apiAliasCurrent: 'o1-preview',
    modelProvider: 'openai',
    titleGenModel: 'gpt-4o-mini',
    cost: {
      prompt: { price: 15.00, unit: 1000000 },
      completion: { price: 60.00, unit: 1000000 },
    },
    usage_description: "Reasoning model for complex tasks that require broad general knowledge",
    released_description: 'Sep 2024', 
    cost_description: '<span class="text-red-700 dark:text-red-500">100-400x</span><br/>',
    use_system_prompt: false,
    use_stream: false,
    force_temperature: 1,
    force_top_p: 1,
    force_presence_penalty: 0,
    force_frequency_penalty: 0
  },
  'o1-mini': {
    maxModelInputTokens: 65536,
    maxModelCompletionTokens: 65536,
    displayName: 'OpenAI GPT o1 Mini w/Reasoning',
    choiceButtonColor: 'bg-yellow-100 dark:bg-sky-900',
    enabled: import.meta.env.VITE_OPENAI_O1_ENABLE=='Y',
    apiAliasCurrent: 'o1-mini',
    modelProvider: 'openai',
    titleGenModel: 'gpt-4o-mini',
    cost: {
      prompt: { price: 3.00, unit: 1000000 },
      completion: { price: 12.00, unit: 1000000 },
    },
    usage_description: "Cost-balanced reasoning model tailored to coding, math, and science use cases",
    released_description: 'Sep 2024',
    cost_description: '25-100x baseline<br/>',
    use_system_prompt: false,
    use_stream: false,
    force_temperature: 1,
    force_top_p: 1,
    force_presence_penalty: 0,
    force_frequency_penalty: 0
  },
  'claude-3.5-sonnet': {
    maxModelInputTokens: 200000-8192,
    maxModelCompletionTokens: 8192,
    displayName: 'Claude 3.5 Sonnet',
    choiceButtonColor: 'bg-lime-100 dark:bg-lime-800',
    enabled: import.meta.env.VITE_ANTHROPIC_ENABLE=='Y',
    apiAliasCurrent: 'claude-3-5-sonnet-20240620',
    modelProvider: 'anthropic',
    titleGenModel: 'claude-3-haiku', 
    cost: {
      prompt: { price: 3.00, unit: 1000000 },
      completion: { price: 15.00, unit: 1000000 },
    },
    usage_description: "On par with GPT-4o in most benchmark. Best for Coding.",
    released_description: 'Jun 2024',
    cost_description: '20x baseline<br/>',
    use_system_prompt: true,
    use_stream: true
  },
  'claude-3.5-sonnet-new': {
    maxModelInputTokens: 200000-8192,
    maxModelCompletionTokens: 8192,
    displayName: 'Claude 3.5 Sonnet New (aka 3.6)',
    choiceButtonColor: 'bg-lime-100 dark:bg-lime-800',
    enabled: import.meta.env.VITE_ANTHROPIC_ENABLE=='Y',
    apiAliasCurrent: 'claude-3-5-sonnet-20241022',
    modelProvider: 'anthropic',
    titleGenModel: 'claude-3.5-haiku', 
    cost: {
      prompt: { price: 3.00, unit: 1000000 },
      completion: { price: 15.00, unit: 1000000 },
    },
    usage_description: "On par with GPT-4o in most benchmark. Best for Coding, approaches o1.",
    released_description: 'Oct 2024',
    cost_description: '20x baseline<br/>',
    use_system_prompt: true,
    use_stream: true
  },
  'gpt-4-turbo': {
    maxModelInputTokens: 128000-4096,
    maxModelCompletionTokens: 4096,
    displayName: 'OpenAI GPT-4 Turbo',
    enabled: true,
    apiAliasCurrent: 'gpt-4-turbo',
    modelProvider: 'openai',
    titleGenModel: 'gpt-4o-mini',
    cost: {
      prompt: { price: 10.00, unit: 1000000 },
      completion: { price: 30.00, unit: 1000000 },
    },
    usage_description: "An improvement of the original GPT-4.",
    released_description: 'Mar 2024',
    cost_description: '60x baseline',
    use_system_prompt: true,
    use_stream: true
  },
  'claude-3-haiku': {
    maxModelInputTokens: 200000-4096,
    maxModelCompletionTokens: 4096,
    displayName: 'Claude 3 Haiku',
    enabled: false,
    apiAliasCurrent: 'claude-3-haiku-20240307',
    modelProvider: 'anthropic',
    titleGenModel: 'claude-3-haiku',
    cost: {
      prompt: { price: 0.25, unit: 1000000 },
      completion: { price: 1.25, unit: 1000000 },
    },
    usage_description: 'Was an impressive small model at its time, but gpt-4o-mini is stronger now.',
    released_description: 'Feb 2024',
    cost_description: '2x baseline',
    use_system_prompt: true,
    use_stream: true
  },
  'claude-3.5-haiku': {
    maxModelInputTokens: 200000-8192,
    maxModelCompletionTokens: 8192,
    displayName: 'Claude 3.5 Haiku',
    enabled: import.meta.env.VITE_ANTHROPIC_ENABLE=='Y',
    apiAliasCurrent: 'claude-3-5-haiku-latest',
    modelProvider: 'anthropic',
    titleGenModel: 'claude-3.5-haiku',
    cost: {
      prompt: { price: 1.00, unit: 1000000 },
      completion: { price: 5.00, unit: 1000000 },
    },
    usage_description: 'Newest smaller model from Anthropic. Approaches gpt-4o in coding and beats Claude 3 Opus in some benchmarks while being 3x cheaper then Sonnet.',
    released_description: 'Oct 2024',
    cost_description: '7x baseline',
    use_system_prompt: true,
    use_stream: true
  },
  'claude-3-opus': {
    maxModelInputTokens: 200000-4096,
    maxModelCompletionTokens: 4096,
    displayName: 'Claude 3 Opus',
    enabled: import.meta.env.VITE_ANTHROPIC_ENABLE=='Y',
    apiAliasCurrent: 'claude-3-opus-20240229',
    modelProvider: 'anthropic',
    titleGenModel: 'claude-3-haiku', 
    cost: {
      prompt: { price: 15.00, unit: 1000000 },
      completion: { price: 75.00, unit: 1000000 },
    },
    usage_description: "Was most intelligent but expensive model at its time, and may still have some still.",
    released_description: 'Feb 2024',
    cost_description: '100x baseline',
    use_system_prompt: true,
    use_stream: true
  },
  'gpt-3.5-turbo': {
    maxModelInputTokens: 16384-4096,
    maxModelCompletionTokens: 4096,
    displayName: 'GPT-3.5',
    enabled: false,
    apiAliasCurrent: 'gpt-3.5-turbo',
    modelProvider: 'openai',
    titleGenModel: 'gpt-3.5-turbo',
    cost: {
      prompt: { price: 0.5, unit: 1000000 },
      completion: { price: 1.5, unit: 1000000 },
    },
    usage_description: '',
    cost_description: '',
    use_system_prompt: true,
    use_stream: true
  },
  'gpt-4': {
    maxModelInputTokens: 8192,
    maxModelCompletionTokens: 4096,
    displayName: 'GPT-4 Original',
    enabled: false,
    apiAliasCurrent: 'gpt-4',
    modelProvider: 'openai',
    titleGenModel: 'gpt-4o-mini',
    cost: {
      prompt: { price: 30.00, unit: 1000000 },
      completion: { price: 60.00, unit: 1000000 },
    },
    usage_description:  '',
    cost_description: '',
    use_system_prompt: true,
    use_stream: true
  },
  'gpt-4-turbo-preview': {
    maxModelInputTokens: 128000-4096,
    maxModelCompletionTokens: 4096,
    displayName: 'GPT-4 Turbo Preview (legacy)',
    enabled: false,
    apiAliasCurrent: 'gpt-4-turbo-preview',
    modelProvider: 'openai',
    titleGenModel: 'gpt-4o-mini',
    cost: {
      prompt: { price: 10.00, unit: 1000000 },
      completion: { price: 30.00, unit: 1000000 },
    },
    usage_description: '',
    cost_description: '',
    use_system_prompt: true,
    use_stream: true
  },
  'claude-3-sonnet': {
    maxModelInputTokens: 200000-4096,
    maxModelCompletionTokens: 4096,
    displayName: '3 Sonnet',
    enabled: false,
    apiAliasCurrent: 'claude-3-sonnet-20240229',
    modelProvider: 'anthropic',
    titleGenModel: 'claude-3-haiku', 
    cost: {
      prompt: { price: 3.00, unit: 1000000 },
      completion: { price: 15.00, unit: 1000000 },
    },
    usage_description: '',
    cost_description: '',
    use_system_prompt: true,
    use_stream: true
  },
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
