import type { Core } from '@strapi/strapi';

const chatGPT = ({ strapi }: { strapi: Core.Strapi }) => ({
  async generateText(ctx) {
    // debug mode
    if (process.env.PROMPT_EDITOR_DEBUG === 'true') {
      ctx.body =
        'This is a debugging message. It is needed to reduce the cost of using the API each time during development';
      return;
    }

    const { ChatGPTAPI } = await import('chatgpt');
    const { prompt, model, temperature } = JSON.parse(ctx.request.body);
    const apiKey = strapi.config.get<string>('plugin::prompt-editor.openai_api_key');
    const api = new ChatGPTAPI({
      apiKey,
      completionParams: {
        model,
        temperature: Number.parseFloat(temperature),
      },
    });
    let writeHeader = false;
    await api
      .sendMessage(prompt, {
        onProgress: (partialResponse) => {
          if (!writeHeader) {
            ctx.res.writeHead(200, {
              'Content-Type': 'text/plain;charset=UTF-8',
              'Transfer-Encoding': 'chunked',
            });
            writeHeader = true;
          }
          if (partialResponse.delta) {
            ctx.res.write(partialResponse.delta);
          }
        },
      })
      .catch((e) => {
        ctx.res.writeHead(400, {
          'Content-Type': 'application/json',
        });
        ctx.res.write(JSON.stringify({ message: e.message }));
      });
    ctx.res.end();
  },
});

export default chatGPT;
