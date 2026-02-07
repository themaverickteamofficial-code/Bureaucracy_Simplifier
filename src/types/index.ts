export type StructuredSummary = {
  summary: string;
  whatItMeans: string;
  actions: {
    step: string;
    deadline?: string;
  }[];
  consequences: string;
  helplines: string[];
  disclaimer: string;
};

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  data?: any;
};
