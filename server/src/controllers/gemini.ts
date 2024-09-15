import {Strapi} from "@strapi/strapi";
import {GoogleGenerativeAI} from "@google/generative-ai";

const gemini = ({strapi}: { strapi: Strapi }) => ({
  async generateText(ctx) {
    // debug mode
    if (process.env.PROMPT_EDITOR_DEBUG === 'true') {
      ctx.body = 'This is a debugging message. It is needed to reduce the cost of using the API each time during development'
      return
    }

    const {prompt, model} = JSON.parse(ctx.request.body)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const generativeModel = genAI.getGenerativeModel({model});
    const result = await generativeModel.generateContentStream(prompt)

    ctx.res.writeHead(200, {
      'Content-Type': 'text/plain;charset=UTF-8',
      'Transfer-Encoding': 'chunked',
    })

    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
      ctx.res.write(chunkText)
    }
    ctx.res.end()
  }
})

export default gemini
