import {Strapi} from "@strapi/strapi";

const contentTypeId = 'plugin::prompt-editor.prompt-editor-config'

const config = ({strapi}: { strapi: Strapi }) => ({
  async getConfig(userId: number) {
    const config = await strapi
      .query(contentTypeId)
      .findOne({
        where: {
          user_id: userId
        }
      });
    if (config === null) {
      // default config
      return {
        user_id: userId,
        chatgpt_text_config: {
          model: 'gpt-4o-mini',
          temperature: 0.7
        },
        chatgpt_image_config: {
          model: 'dall-e-2',
          size: '1024x1024'
        },
        gemini_text_config: {
          model: 'gemini-1.5-flash'
        }
      }
    } else {
      return {
        user_id: userId,
        chatgpt_text_config: (config.chatgpt_text_config),
        chatgpt_image_config: (config.chatgpt_image_config),
        gemini_text_config: (config.gemini_text_config)
      }
    }
  },
  async update(userId: number, data: any) {
    const config = await strapi
      .query(contentTypeId)
      .findOne({
        where: {
          user_id: userId
        }
      });
    if (config === null) {
      await strapi.query(contentTypeId).create({
        data: {
          user_id: userId,
          ...data
        }
      });
    } else {
      await strapi.query(contentTypeId).update({
        where: {
          user_id: userId
        },
        data
      });
    }
  }
});

export default config;
