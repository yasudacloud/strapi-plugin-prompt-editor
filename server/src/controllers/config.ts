import {Strapi} from "@strapi/strapi";

const config = ({strapi}: { strapi: Strapi }) => ({
  async getConfig(ctx) {
    const {
      state: {user},
    } = ctx;

    const configService = strapi.plugin('prompt-editor').service('config')
    const config = await configService.getConfig(user.id)
    ctx.body = JSON.stringify(config)
  },
  async updateConfig(ctx) {
    const {
      state: {user},
    } = ctx
    const {params} = JSON.parse(ctx.request.body)
    const configService = strapi.plugin('prompt-editor').service('config')
    await configService.update(user.id, params)
    ctx.response.status = 204;
    ctx.body = ''
  },
  async getModels(ctx) {
    const chatGPTText = strapi.config.get<string[]>("plugin.prompt-editor.chatGPTTextModels", [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4',
      'gpt-3.5-turbo'
    ]);
    const chatGPTImage = strapi.config.get<{
      name: string,
      size: string[]
    }[]>("plugin.prompt-editor.chatGPTImageModels", [
      {
        name: 'dall-e-2',
        size: [
          '256x256',
          '512x512',
          '1024x1024'
        ]
      },
      {
        name: 'dall-e-3',
        size: [
          '1024x1024',
          '1792x1024',
          '1024x1792'
        ]
      }
    ])
    const geminiText = strapi.config.get<string[]>("plugin.prompt-editor.geminiTextModels", [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-1.0-pro',
    ])

    // support models
    const models = {
      chatGPTText,
      chatGPTImage,
      geminiText
    }
    ctx.body = JSON.stringify(models)
  }
})

export default config;
