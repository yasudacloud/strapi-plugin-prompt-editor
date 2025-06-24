export default [
  {
    method: 'POST',
    path: '/chatgpt/text',
    handler: 'chatGPT.generateText',
  },
  {
    method: 'POST',
    path: '/gemini/text',
    handler: 'gemini.generateText',
  },
  {
    method: 'GET',
    path: '/config',
    handler: 'config.getConfig',
  },
  {
    method: 'PUT',
    path: '/config',
    handler: 'config.updateConfig',
  },
  {
    method: 'GET',
    path: '/models',
    handler: 'config.getModels',
  }
];
