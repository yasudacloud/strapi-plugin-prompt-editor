import {
  Box,
  BaseHeaderLayout,
  Main,
  ContentLayout,
  TextInput,
  Button,
  Typography,
  SingleSelect,
  SingleSelectOption,
} from '@strapi/design-system';
import {Check} from '@strapi/icons'
import {useIntl} from 'react-intl';
import {useEffect, useState} from "react";
import {getToken} from "../utils/getToken";
import {Config, Model} from 'src/types/config';
import styled from 'styled-components';
import {getTranslation} from "../utils/getTranslation";

const SaveMessage = styled.div`
  min-height: 25px;
  display: flex;
  align-items: center;
`
const Success = styled(Typography)`
  color: #5cb85c;
  font-weight: bold;
`

const Setting = () => {
  const {formatMessage} = useIntl();
  const [launch, setLaunch] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isSuccess, setSuccess] = useState(false)
  const [models, setModels] = useState<Model>({
    chatGPTImage: [],
    chatGPTText: [],
    geminiText: []
  })

  const [initialConfig, setInitialConfig] = useState<Config>()
  const [chatGPTTextModel, setChatGPTTextModel] = useState('')
  const [chatGPTTemperature, setChatGPTTemperature] = useState(0)
  const [chatGPTImageModel, setChatGPTImageModel] = useState('')
  const [chatGPTImageSize, setChatGPTImageSize] = useState('')
  const [geminiTextModel, setGeminiTextModel] = useState('')

  useEffect(() => {

    fetchUserConfig()

    fetch('/prompt-editor/models', {
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
    }).then(async (response) => {
      const result = await response.json()
      setModels(result)
    })
  }, [])

  const fetchUserConfig = async () => {
    fetch('/prompt-editor/config', {
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
    }).then(async (response) => {
      const config = await response.json()
      setChatGPTTextModel(config.chatgpt_text_config.model)
      setChatGPTTemperature(config.chatgpt_text_config.temperature)
      setChatGPTImageModel(config.chatgpt_image_config.model)
      setChatGPTImageSize(config.chatgpt_image_config.size)
      setGeminiTextModel(config.gemini_text_config.model)
      setInitialConfig(config)
      setLaunch(true)
    })
  }

  const onSave = () => {
    setSaving(true)
    fetch('/prompt-editor/config', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        params: {
          chatgpt_text_config: {
            model: chatGPTTextModel,
            temperature: chatGPTTemperature
          },
          chatgpt_image_config: {
            model: chatGPTImageModel,
            size: chatGPTImageSize
          },
          gemini_text_config: {
            model: geminiTextModel
          }
        }
      })
    }).then(async (response) => {
      setSaving(false)
      if (response.status === 204) {
        setSuccess(true)
        fetchUserConfig()
      } else {
        alert('')
      }
    })
  }
  const isChange = initialConfig?.chatgpt_text_config.model !== chatGPTTextModel ||
    initialConfig?.chatgpt_text_config.temperature !== chatGPTTemperature ||
    initialConfig?.chatgpt_image_config.size !== chatGPTImageSize ||
    initialConfig?.chatgpt_image_config.model !== chatGPTImageModel ||
    initialConfig?.gemini_text_config.model !== geminiTextModel

  const isEmpty = !chatGPTTextModel || !chatGPTTemperature || !chatGPTImageModel || !chatGPTImageSize || !geminiTextModel

  return (
    <Main>
      <BaseHeaderLayout
        id="title"
        title={'Prompt Editor'}
        subtitle={
          formatMessage({
            id: getTranslation('setting.description'),
            defaultMessage: 'ChatGPT and Gemini Settings'
          })
        }
        primaryAction={
          <Button
            onClick={() => onSave()}
            startIcon={<Check/>}
            disabled={saving || !isChange || isEmpty}
            loading={saving}
          >
            Save
          </Button>
        }
      />
      <ContentLayout>
        <Box
          padding={6}
          background="neutral0"
          hasRadius
          shadow="filterShadow"
        >
          {
            launch && (
              <>
                <SaveMessage>
                  {
                    isSuccess && (
                      <>
                        <Check fill={'#5cb85c'}/>
                        &nbsp;
                        <div>
                          <Success variant={'omega'}>
                            {
                              formatMessage({
                                id: getTranslation('setting.form-saved'),
                                defaultMessage: 'Configuration saved.'
                              })
                            }
                          </Success>
                        </div>
                      </>
                    )
                  }
                </SaveMessage>
                <Box paddingTop={3}>
                  <Typography variant={'epsilon'}>
                    {
                      formatMessage({
                        id: getTranslation('setting.chatgpt-text'),
                        defaultMessage: 'ChatGPT Text'
                      })
                    }
                  </Typography>
                  <Box padding={2}>
                    <SingleSelect
                      label={'model'}
                      value={chatGPTTextModel}
                      required={true}
                      onChange={(model: string) => setChatGPTTextModel(model)}
                    >
                      {
                        models.chatGPTText.map(model => (
                          <SingleSelectOption value={model}>{model}</SingleSelectOption>
                        ))
                      }
                    </SingleSelect>
                  </Box>

                  <Box padding={2}>
                    <TextInput
                      label={'temperature'}
                      step={0.1}
                      max={2.0}
                      min={0}
                      type={'number'}
                      placeholder="temperature"
                      name="temperature"
                      required={true}
                      value={chatGPTTemperature}
                      onChange={(e: any) => setChatGPTTemperature(e.target.value)}
                    />
                  </Box>
                </Box>

                <Box paddingTop={3}>
                  <Typography variant={'epsilon'}>
                    {
                      formatMessage({
                        id: getTranslation('setting.chatgpt-image'),
                        defaultMessage: 'ChatGPT Image'
                      })
                    }
                  </Typography>
                  <Box padding={2}>
                    <SingleSelect
                      label={'model'}
                      value={chatGPTImageModel}
                      required={true}
                      onChange={(newModel: string) => {
                        setChatGPTImageModel(newModel)
                        const target = models.chatGPTImage.find(row => row.name === newModel)
                        if (!target?.size.some(size => size === chatGPTImageSize)) {
                          setChatGPTImageSize('')
                        }
                      }}
                    >
                      {
                        models.chatGPTImage.map(model => (
                          <SingleSelectOption value={model.name}>{model.name}</SingleSelectOption>
                        ))
                      }
                    </SingleSelect>
                  </Box>
                  <Box padding={3}>
                    <SingleSelect
                      label={'size'}
                      value={chatGPTImageSize}
                      required={true}
                      onChange={(size: string) => setChatGPTImageSize(size)}
                    >
                      {
                        models.chatGPTImage.find(model => model.name === chatGPTImageModel)?.size.map(size => (
                          <SingleSelectOption value={size}>{size}</SingleSelectOption>
                        ))
                      }
                    </SingleSelect>
                  </Box>
                </Box>

                <Box paddingTop={2}>
                  <Typography variant={'epsilon'}>
                    {
                      formatMessage({
                        id: getTranslation('setting.gemini-text'),
                        defaultMessage: 'Gemini Text'
                      })
                    }
                  </Typography>
                  <Box padding={2}>
                    <SingleSelect
                      label={'model'}
                      value={geminiTextModel}
                      required={true}
                      onChange={(model: string) => setGeminiTextModel(model)}
                    >
                      {
                        models.geminiText.map(model => (
                          <SingleSelectOption value={model}>{model}</SingleSelectOption>
                        ))
                      }
                    </SingleSelect>
                  </Box>
                </Box>
              </>
            )
          }
        </Box>
      </ContentLayout>
    </Main>
  )
    ;
};

export default Setting;
