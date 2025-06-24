import '@blocknote/core/fonts/inter.css';
import {
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
  useCreateBlockNote,
} from '@blocknote/react';
import { darkDefaultTheme, lightDefaultTheme } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { BlockNoteEditor, filterSuggestionItems } from '@blocknote/core';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import { Box, Field } from '@strapi/design-system';
import { en, ja } from '@blocknote/core/locales';
import { getTranslation } from '../utils/getTranslation';
import { useIntl } from 'react-intl';
import { marked } from 'marked';

// @ts-ignore
import OpenAILogo from '../openai-logomark.svg';
// @ts-ignore
import geminiLogo from '../gemini.svg';

import { Config } from '../types/config';
import Drawer from './Drawer';
import { getToken } from '../utils/getToken';
import { fetchStream } from '../utils/http';
import { ChatGPTIcon, EditorStyle, GeminiIcon } from './EditorStyle';
import { ErrorDialog } from './ErrorDialog';

darkDefaultTheme.colors.menu.background = 'RGB(30, 30, 46)';

export enum GenerateType {
  none,
  chatGPTText,
  geminiText,
}

export const Editor = (props: any) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isDark] = useState(localStorage.getItem('STRAPI_THEME') === 'dark');
  const [adminLanguage] = useState(localStorage.getItem('strapi-admin-language') ?? '');
  const [selectGenerateType, setGenerateType] = useState<GenerateType>(GenerateType.none);
  const [visibleError, setVisibleError] = useState(false);
  const [config, setConfig] = useState<Config>();
  const { get } = useFetchClient();
  const { formatMessage } = useIntl();
  const ref = useRef<any>();

  useEffect(() => {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
    fetchData();
  }, []);

  const group = formatMessage({
    id: getTranslation('app.generate-group'),
    defaultMessage: 'Generate',
  });

  const fetchData = async () => {
    const fetchConfig = async () => {
      const response = await get('/prompt-editor/config');
      return response.data;
    };
    const fetchModel = async () => {
      const response = await get('/prompt-editor/models');
      return response.data;
    };

    Promise.all([fetchConfig(), fetchModel()]).then((result) => {
      setConfig(result[0]);
    });
  };

  // ChatGPT Text Menu
  const chatgptTextItem = () => ({
    title: 'ChatGPT',
    onItemClick: () => {
      setGenerateType(GenerateType.chatGPTText);
      setShowPopup(true);
    },
    aliases: ['chatgpt'],
    group,
    icon: <ChatGPTIcon src={OpenAILogo} dark={isDark} />,
    subtext: formatMessage({
      id: getTranslation('app.chatgpt.text'),
      defaultMessage: 'ChatGPT text generation',
    }),
  });

  // Gemini Text Menu
  const geminiTextItem = () => ({
    title: 'Gemini',
    onItemClick: () => {
      setGenerateType(GenerateType.geminiText);
      setShowPopup(true);
    },
    aliases: ['gemini'],
    group,
    icon: <GeminiIcon src={geminiLogo} dark={isDark} />,
    subtext: formatMessage({
      id: getTranslation('app.gemini.text'),
      defaultMessage: 'Gemini text generation',
    }),
  });

  const initialContent = props.value ? JSON.parse(props.value) : undefined;
  const editor = useCreateBlockNote({
    dictionary: adminLanguage === 'en' ? en : ja,
    initialContent,
  });
  const getCustomSlashMenuItems: any = (editor: BlockNoteEditor): any[] => {
    const items = [...getDefaultReactSlashMenuItems(editor)];
    if (config?.enableGemini) {
      items.unshift(geminiTextItem());
    }
    if (config?.enableChatGPT) {
      items.unshift(chatgptTextItem());
    }
    return items;
  };

  const getLLMRequestOptions = (prompt: string) => {
    let url: string;
    let params: any;
    if (selectGenerateType === GenerateType.geminiText) {
      url = '/prompt-editor/gemini/text';
      params = {
        prompt,
        ...config?.gemini_text_config,
      };
    } else {
      url = '/prompt-editor/chatgpt/text';
      params = {
        prompt,
        ...config?.chatgpt_text_config,
      };
    }
    return {
      url,
      options: {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    };
  };

  const onClosePopup = async (prompt: string, size?: string) => {
    setShowPopup(false);
    if (!prompt) {
      editor.focus();
      return;
    }
    let latestBlock: any = editor.getTextCursorPosition().block;
    let blockText = '';
    let removeBlockIds: string[] = [];
    let focusBlockId = '';
    const { url, options } = getLLMRequestOptions(prompt);

    await fetchStream(url, options, async (chunkText) => {
      blockText += chunkText;
      if (removeBlockIds.length > 0) {
        editor.removeBlocks(removeBlockIds);
      }
      const html = await marked.parse(blockText);
      const blocks = await editor.tryParseHTMLToBlocks(html.replaceAll('\n', '<br/>'));

      // Remove blocks with only newlines
      const filledBlocks = blocks.filter((block) => {
        if (block.children.length > 0) {
          return true;
        }
        if (!!block.content && Array.isArray(block.content)) {
          if (block.content.length === 1) {
            const target: any = block.content[0];
            if (target.text !== target.text.replaceAll('\n', '')) {
              return false;
            }
          }
        }
        return true;
      });
      removeBlockIds = filledBlocks.map((block) => block.id);
      const insertBlocks = editor.insertBlocks(filledBlocks, latestBlock, 'after');
      focusBlockId = insertBlocks[insertBlocks.length - 1].id;
    }).catch((e) => {
      setVisibleError(true);
    });

    if (
      latestBlock.children.length === 0 &&
      (!latestBlock.content || latestBlock.content.length === 0)
    ) {
      editor.removeBlocks([latestBlock.id]);
    }
    editor.focus();
    editor.setTextCursorPosition(focusBlockId, 'end');
  };

  const handleKeyDown = useCallback((event: any) => {
    if (event.metaKey && event.key === 's') {
      event.preventDefault();
      const el = document.querySelector('button[type=submit]') as any;
      if (el) {
        el.click();
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  return (
    <>
      <Field.Root name={props.name} id={props.name} error={props.error} required={props.required}>
        <Box>
          <Field.Label onClick={() => editor.focus()}>{props.label}</Field.Label>
          <EditorStyle
            editor={editor}
            slashMenu={false}
            sideMenu={false}
            className={`editor ${props.error ? 'error' : ''}`}
            name={props.name}
            dark={isDark}
            theme={isDark ? darkDefaultTheme : lightDefaultTheme}
            onChange={() => {
              const content = editor.document;
              const isEmpty = () => {
                if (content.length === 0) {
                  return true;
                }
                if (content.length > 1) {
                  return false;
                }
                return (
                  content[0].children.length === 0 &&
                  (typeof content[0].content === 'undefined' ||
                    (Array.isArray(content[0].content) && content[0].content.length === 0))
                );
              };

              props.onChange({
                target: {
                  name: props.name,
                  value: isEmpty() ? null : JSON.stringify(content),
                },
              });
            }}
          >
            <SuggestionMenuController
              triggerCharacter={'/'}
              getItems={async (query) =>
                filterSuggestionItems(
                  getCustomSlashMenuItems(editor).filter((row: any) => {
                    const excludeKeys = ['image', 'video', 'audio', 'file', 'emoji'];
                    if (excludeKeys.some((excludeKey) => excludeKey === row.key)) {
                      return false;
                    }
                    return true;
                  }),
                  query
                )
              }
            />
          </EditorStyle>
          <Field.Error />
          <div ref={ref} />
        </Box>
      </Field.Root>

      <Drawer
        open={showPopup && typeof selectGenerateType !== 'undefined'}
        onClose={onClosePopup}
        isDark={isDark}
      />
      {visibleError && <ErrorDialog onClose={() => setVisibleError(false)} />}
    </>
  );
};
