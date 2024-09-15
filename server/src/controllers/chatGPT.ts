import {Strapi} from "@strapi/strapi";

const chatGPT = ({strapi}: { strapi: Strapi }) => ({
  async generateText(ctx) {
    // debug mode
    if (process.env.PROMPT_EDITOR_DEBUG === 'true') {
      ctx.body = 'This is a debugging message. It is needed to reduce the cost of using the API each time during development'
      return;
    }

    const {ChatGPTAPI} = await import('chatgpt')
    const {prompt, model, temperature} = JSON.parse(ctx.request.body)
    const apiKey = strapi.config.get<string>("plugin.prompt-editor.openai_api_key")
    const api = new ChatGPTAPI({
      apiKey,
      completionParams: {
        model,
        temperature: Number.parseFloat(temperature),
      }
    })
    ctx.res.writeHead(200, {
      'Content-Type': 'text/plain;charset=UTF-8',
      'Transfer-Encoding': 'chunked',
    });
    await api.sendMessage(prompt, {
      onProgress: (partialResponse) => {
        if (partialResponse.delta) {
          ctx.res.write(partialResponse.delta)
        }
      }
    })
    ctx.res.end();
  },
  async generateImage(ctx) {
    // debug mode
    if (process.env.PROMPT_EDITOR_DEBUG === 'true') {
      ctx.body = JSON.stringify({
        url: 'https://picsum.photos/200/300'
      })
      return;
    }

    const {prompt, size, model} = JSON.parse(ctx.request.body)
    const apiKey = strapi.config.get<string>("plugin.prompt-editor.openai_api_key")
    const response = await fetch(
      'https://api.openai.com/v1/images/generations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt,
          n: 1,
          size,
          model
        })
      }
    )
    const result = await response.json()
    const {data} = result as { created: number, data: { url: string }[] }
    if (data.length > 0) {
      ctx.body = JSON.stringify({
        url: data[0].url
      })
    } else {
      ctx.body = JSON.stringify({
        url: ''
      })
    }
  }
});

export default chatGPT;
