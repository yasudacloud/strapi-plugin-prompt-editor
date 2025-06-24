export interface Config {
  user_id: number;
  chatgpt_text_config: {
    model: string;
    temperature: number;
  };
  gemini_text_config: {
    model: string;
  };
  enableChatGPT?: boolean;
  enableGemini?: boolean;
}

export interface Model {
  chatGPTText: string[];
  geminiText: string[];
}
