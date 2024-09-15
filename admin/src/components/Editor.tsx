import "@blocknote/core/fonts/inter.css";
import {
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
  useCreateBlockNote
} from "@blocknote/react";
import {BlockNoteView, darkDefaultTheme, lightDefaultTheme} from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {BlockNoteEditor, filterSuggestionItems} from "@blocknote/core";
import React, {useCallback, useEffect, useRef, useState} from "react";
import PromptPopover from "./PromptPopover";
import styled from "styled-components";
import {
  Box,
  Typography,
  Dialog,
  DialogBody,
  DialogFooter,
  Button,
  Field,
  FieldLabel,
  FieldError,
  Stack
} from "@strapi/design-system";
import {locales} from "@blocknote/core";
import {getTranslation} from "../utils/getTranslation";
import {useIntl} from "react-intl";
import {marked} from "marked";
import {getToken} from "../utils/getToken";
import ImageGenerateModal from "./ImageGenerateModal";

// @ts-ignore
import OpenAILogo from '../openai-logomark.svg'
// @ts-ignore
import geminiLogo from '../gemini.svg'

import {Config} from "../types/config";

darkDefaultTheme.colors.menu.background = 'RGB(30, 30, 46)'

export enum GenerateType {
  chatGPTText = '1',
  chatGPTImage = '2',
  geminiText = '3'
}

const EditorStyle = styled<any>(BlockNoteView)`
  & .bn-editor {
    background: ${({isDark}) => (isDark ? 'rgb(30, 30, 46)' : 'initial')};
    color: ${({isDark}) => (isDark ? '#fff' : 'initial')};
    border: ${({isDark}) => (isDark ? '1px solid #888' : 'none')};
  }

  & strong {
    font-weight: bold !important;
  }

  & em {
    font-style: italic;
  }
`

type MenuIconProps = React.ComponentPropsWithoutRef<'img'> & {
  isDark: boolean,
};

const ChatGPTIcon = styled.img<MenuIconProps>`
  background-color: ${props => props.isDark ? '#fff' : 'initial'};
  border-radius: 50%;
  width: 20px;
  height: 20px;
`
const GeminiIcon = styled.img<MenuIconProps>`
  background-color: ${props => props.isDark ? '#fff' : 'initial'};
  width: 40px;
`
const Required = styled.span`
  color: rgb(208, 43, 32);
`

marked.setOptions({
  breaks: true,
  gfm: true
});

const Editor = (props: any) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isDark] = useState(localStorage.getItem('STRAPI_THEME') === 'dark')
  const [adminLanguage] = useState(localStorage.getItem('strapi-admin-language') ?? '')
  const [selectGenerateType, setGenerateType] = useState<GenerateType>()
  const [generateError, setGenerateError] = useState('')
  const [config, setConfig] = useState<Config>()
  const [sizes, setSizes] = useState<string[]>([])

  // for image
  const [showImageGenerateModal, setImageGenerateModal] = useState(false)
  const [isImageGenerating, setImageGenerating] = useState(false)
  const [imageURL, setImageURL] = useState('')

  const {formatMessage} = useIntl();
  const ref = useRef<any>()

  useEffect(() => {
    fetchData()
  }, [])

  const group = formatMessage({
    id: getTranslation('app.generate-group'),
    defaultMessage: 'Generate'
  })

  const fetchData = async () => {
    const fetchConfig = async () => {
      const response = await fetch('/prompt-editor/config', {
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
      })
      return await response.json()
    }
    const fetchModel = async () => {
      const response = await fetch('/prompt-editor/models', {
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
      })
      return response.json()
    }

    Promise.all([fetchConfig(), fetchModel()]).then(result => {
      setConfig(result[0])
      const {
        chatgpt_image_config
      } = result[0]
      const chatGPTImage = result[1].chatGPTImage.find((row: any) => row.name === chatgpt_image_config.model)
      setSizes(chatGPTImage.size)
    })
  }

  // ChatGPT Text Menu
  const chatgptTextItem = () => ({
    title: "ChatGPT Text",
    onItemClick: () => {
      setGenerateType(GenerateType.chatGPTText)
      setShowPopup(true)
    },
    aliases: ["chatgpt"],
    group,
    icon: (
      <ChatGPTIcon src={OpenAILogo} isDark={isDark}/>
    ),
    subtext: formatMessage({
      id: getTranslation('app.chatgpt.text'),
      defaultMessage: 'ChatGPT text generation'
    })
  })

  // ChatGPT Image Menu
  const chatgptImageItem = () => ({
    title: "ChatGPT Image",
    onItemClick: () => {
      setGenerateType(GenerateType.chatGPTImage)
      setShowPopup(true)
    },
    aliases: ["chatgpt"],
    group,
    icon: (
      <ChatGPTIcon src={OpenAILogo} isDark={isDark}/>
    ),
    subtext: formatMessage({
      id: getTranslation('app.chatgpt.image'),
      defaultMessage: 'ChatGPT image generation'
    })
  })

  // Gemini Text Menu
  const geminiTextItem = () => ({
    title: "Gemini Text",
    onItemClick: () => {
      setGenerateType(GenerateType.geminiText)
      setShowPopup(true)
    },
    aliases: ["gemini"],
    group,
    icon: (
      <GeminiIcon src={geminiLogo} isDark={isDark}/>
    ),
    subtext: formatMessage({
      id: getTranslation('app.gemini.text'),
      defaultMessage: 'Gemini text generation'
    })
  })

  const initialContent = props.value ? JSON.parse(props.value) : undefined
  const editor = useCreateBlockNote({
    dictionary: (locales as any)[adminLanguage] ?? locales.en,
    initialContent,
  });
  const getCustomSlashMenuItems: any = (
    editor: BlockNoteEditor
  ): any[] => {
    const items = [
      ...getDefaultReactSlashMenuItems(editor),
    ]
    if (config?.enableGemini) {
      items.unshift(geminiTextItem())
    }
    if (config?.enableChatGPT) {
      items.unshift(chatgptTextItem(), chatgptImageItem())
    }
    return items
  }

  const onClosePopup = async (prompt: string, size?: string) => {
    setShowPopup(false)
    if (!prompt) {
      editor.focus()
      return
    }
    if (selectGenerateType === GenerateType.chatGPTText) {
      // ChatGPT Text
      const response = await fetch('/prompt-editor/chatgpt/text', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          prompt,
          ...config?.chatgpt_text_config
        })
      })
      if (response.status >= 400) {
        setGenerateError(await response.text())
        return
      }
      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      if (!reader) {
        return
      }
      let latestBlock: any = editor.getTextCursorPosition().block
      let blockText = ""
      let removeBlockIds: string[] = []
      let focusBlockId = ""
      while (true) {
        const {done, value} = await reader.read();
        if (done) {
          break;
        }
        const chunkText = decoder.decode(value, {stream: true});
        blockText += chunkText
        editor.removeBlocks(removeBlockIds)
        const html = await marked.parse(blockText)
        const blocks = await editor.tryParseHTMLToBlocks(html.replaceAll("\n", "<br/>"))

        // Remove blocks with only newlines
        const filledBlocks = blocks.filter(block => {
          if (block.children.length > 0) {
            return true
          }
          if (!!block.content && Array.isArray(block.content)) {
            if (block.content.length === 1) {
              const target: any = block.content[0]
              if (target.text !== target.text.replaceAll("\n", '')) {
                return false
              }
            }
          }
          return true
        })
        removeBlockIds = filledBlocks.map(block => block.id)
        const insertBlocks = editor.insertBlocks(filledBlocks, latestBlock, "after")
        focusBlockId = insertBlocks[insertBlocks.length - 1].id
      }
      // If the block of focus before adding is empty, delete
      if (latestBlock.children.length === 0 && (!latestBlock.content || latestBlock.content.length === 0)) {
        editor.removeBlocks([latestBlock.id])
      }
      editor.focus()
      editor.setTextCursorPosition(focusBlockId, "end")
    } else if (selectGenerateType === GenerateType.chatGPTImage) {
      // ChatGPT Image
      setImageGenerateModal(true)
      setImageGenerating(true)
      let params = structuredClone(config!.chatgpt_image_config)
      if (typeof size !== 'undefined') {
        params.size = size
      }

      const response = await fetch('/prompt-editor/chatgpt/image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          prompt,
          ...params
        })
      })
      if (response.status >= 400) {
        setGenerateError(await response.text())
        return
      }
      const {url} = await response.json()
      setImageGenerating(false)
      setImageURL(url)
    } else if (selectGenerateType === GenerateType.geminiText) {
      const response = await fetch('/prompt-editor/gemini/text', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          prompt,
          ...config?.gemini_text_config
        })
      })
      if (response.status >= 400) {
        setGenerateError(await response.text())
        return
      }
      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      if (!reader) {
        return
      }
      let latestBlock: any = editor.getTextCursorPosition().block
      let blockText = ""
      let removeBlockIds: string[] = []
      let focusBlockId = ""
      while (true) {
        const {done, value} = await reader.read();
        if (done) {
          break;
        }
        const chunkText = decoder.decode(value, {stream: true});
        blockText += chunkText
        editor.removeBlocks(removeBlockIds)
        const html = await marked.parse(blockText)
        const blocks = await editor.tryParseHTMLToBlocks(html.replaceAll("\n", "<br/>"))

        // Remove blocks with only newlines
        const filledBlocks = blocks.filter(block => {
          if (block.children.length > 0) {
            return true
          }
          if (!!block.content && Array.isArray(block.content)) {
            if (block.content.length === 1) {
              const target: any = block.content[0]
              if (target.text !== target.text.replaceAll("\n", '')) {
                return false
              }
            }
          }
          return true
        })
        removeBlockIds = filledBlocks.map(block => block.id)
        const insertBlocks = editor.insertBlocks(filledBlocks, latestBlock, "after")
        focusBlockId = insertBlocks[insertBlocks.length - 1].id
      }
      // If the block of focus before adding is empty, delete
      if (latestBlock.children.length === 0 && (!latestBlock.content || latestBlock.content.length === 0)) {
        editor.removeBlocks([latestBlock.id])
      }
      editor.focus()
      editor.setTextCursorPosition(focusBlockId, "end")
    }
  }

  const onInsertImageBlock = (url: string) => {
    let latestBlock: any = editor.getTextCursorPosition().block
    const imageBlock: any = {
      type: 'image',
      props: {
        url,
        caption: ''
      },
    };

    // focus
    editor.focus()
    const insertBlocks = editor.insertBlocks([imageBlock], latestBlock, "after");
    const focusBlockId = insertBlocks[insertBlocks.length - 1].id
    editor.setTextCursorPosition(focusBlockId, "end")
  }

  const handleKeyDown = useCallback((event: any) => {
    if (event.metaKey && event.key === 's') {
      event.preventDefault()
      const el = document.querySelector("button[type=submit]") as any
      if (el) {
        el.click()
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
      <Field
        name={props.name}
        id={props.name}
        error={props.error}
        required={props.required}
        hint={props.description && formatMessage(props.description)}
      >
        <Stack spacing={1}>
          <FieldLabel action={props.labelAction}>{formatMessage(props.intlLabel)}</FieldLabel>
          <EditorStyle
            editor={editor}
            slashMenu={false}
            sideMenu={false}
            className='editor'
            name={props.name}
            isDark={isDark}
            theme={isDark ? darkDefaultTheme : lightDefaultTheme}
            onChange={() => {
              const content = editor.document
              const isEmpty = () => {
                if (content.length === 0) {
                  return true
                }
                if (content.length > 1) {
                  return false
                }
                return content[0].children.length === 0 && (typeof content[0].content === 'undefined' || (Array.isArray(content[0].content) && content[0].content.length === 0))
              }

              props.onChange({
                target: {
                  name: props.name,
                  value: isEmpty() ? null : JSON.stringify(content)
                }
              })
            }}
          >
            <SuggestionMenuController
              triggerCharacter={"/"}
              getItems={async (query) =>
                filterSuggestionItems(getCustomSlashMenuItems(editor).filter((row: any) => {
                  if (row.group === 'Media' || row.key === 'emoji') {
                    return false
                  }
                  return true
                }), query)
              }
            />
          </EditorStyle>
          <FieldError/>
          <div ref={ref}/>
        </Stack>
      </Field>

      {(showPopup && !!selectGenerateType) && (
        <PromptPopover
          sourceRef={ref}
          open={showPopup}
          onClose={onClosePopup}
          type={selectGenerateType}
          imageSizes={sizes}
          defaultSize={config?.chatgpt_image_config.size}
        />
      )}
      <ImageGenerateModal
        loading={isImageGenerating}
        open={showImageGenerateModal}
        url={imageURL}
        onClose={(url?: string) => {
          if (url) {
            onInsertImageBlock(url)
            setImageGenerateModal(false)
          } else {
            // no image
            setImageGenerateModal(false)
            editor.focus()
          }
        }}/>

      <Dialog onClose={() => setGenerateError('')} title="Error" isOpen={!!generateError}>
        <DialogBody>
          <Typography>{generateError}</Typography>
        </DialogBody>
        <DialogFooter
          startAction={
            <Button onClick={() => setGenerateError('')} variant="tertiary">
              OK
            </Button>
          }
        />
      </Dialog>
    </>
  )
}

export default Editor
