export interface Config {
  user_id: number
  chatgpt_text_config: {
    model: string
    temperature: number
  }
  chatgpt_image_config: {
    model: string
    size: string
  }
  gemini_text_config: {
    model: string
  }
}

export interface Model {
  chatGPTText: string[]
  chatGPTImage: {
    name: string
    size: string[]
  }[]
  geminiText: string[]
}
