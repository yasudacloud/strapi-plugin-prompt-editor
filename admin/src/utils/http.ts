import { getToken } from './getToken';

export const fetchStream = async (
  url: string,
  options: any,
  callback: (chunkText: string) => void
) => {
  return new Promise(async (resolve, reject) => {
    const response = await fetch(url, options);
    if (response.status >= 400) {
      return reject(await response.text());
    }
    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    if (!reader) {
      reject('failed to parse stream');
    }
    while (true) {
      const { done, value } = await reader!.read();
      if (done) {
        break;
      }
      const chunkText = decoder.decode(value, { stream: true });
      callback(chunkText);
    }
    resolve({});
  });
};

/**
 * LLM Model List
 */
export const fetchModel = async () => {
  const response = await fetch('/prompt-editor/models', {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return await response.json();
};

/**
 * LLM User Config
 */
export const fetchUserConfig = async () => {
  const response = await fetch('/prompt-editor/config', {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return response.json();
};

export const updateUserConfig = async (params: any) => {
  const response = await fetch('/prompt-editor/config', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ params }),
  });
  return response.status;
};
