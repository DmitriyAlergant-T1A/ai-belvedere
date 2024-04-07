export interface ShareGPTSubmitBodyInterface {
    avatarUrl: string;
    items: {
      from: 'gpt' | 'human';
      value: string;
    }[];
  }