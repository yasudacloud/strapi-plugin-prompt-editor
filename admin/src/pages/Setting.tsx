import {
  Box,
  Main,
  TextInput,
  Button,
  Typography,
  SingleSelect,
  SingleSelectOption,
} from '@strapi/design-system';
import { Check } from '@strapi/icons';
import { useIntl } from 'react-intl';
import { useEffect, useRef, useState } from 'react';
import { Config, Model } from 'src/types/config';
import { getTranslation } from '../utils/getTranslation';
import { Layouts } from '@strapi/strapi/admin';
import { Message } from '../components/Settings/Message';
import { fetchModel, fetchUserConfig, updateUserConfig } from '../utils/http';

type ConfigState = Config & {
  isChange: boolean;
};

const Setting = () => {
  const { formatMessage } = useIntl();
  const [launch, setLaunch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  const [config, setConfig] = useState<ConfigState>();
  const [models, setModels] = useState<Model>({
    chatGPTText: [],
    geminiText: [],
  });

  useEffect(() => {
    Promise.all([fetchModel(), fetchUserConfig()]).then((result) => {
      // setModels
      const models = result[0];
      const config = result[1];
      setModels(models);

      // setConfig
      const newConfig: ConfigState = Object.assign({ isChange: false }, config);
      setConfig(newConfig);
      setLaunch(true);
    });
  }, []);

  const onSave = () => {
    setLoading(true);
    updateUserConfig(config).then((status) => {
      setLoading(false);
      if (status === 204) {
        setSuccess(true);
      }
    });
  };

  const isEmpty = () => {
    if (!config) {
      return true;
    }
    const chatGPTEmpty =
      !config.chatgpt_text_config.temperature || !config.chatgpt_text_config.model;
    const geminiEmpty = !config.gemini_text_config.model;
    return chatGPTEmpty || geminiEmpty;
  };

  return (
    <Main>
      <Layouts.BaseHeader
        title={'Prompt Editor'}
        subtitle={formatMessage({
          id: getTranslation('setting.description'),
          defaultMessage: 'ChatGPT and Gemini Settings',
        })}
        primaryAction={
          <Button
            onClick={() => onSave()}
            startIcon={<Check />}
            disabled={loading || !config?.isChange || isEmpty()}
            loading={loading}
          >
            {formatMessage({
              id: 'global.save',
              defaultMessage: 'Save',
            })}
          </Button>
        }
      />
      <>
        <Box
          padding={6}
          background="neutral0"
          hasRadius
          shadow="filterShadow"
          style={{ maxWidth: 1024, margin: 'auto' }}
        >
          {launch && (
            <>
              <Message isSuccess={isSuccess} />
              <Box paddingTop={3}>
                <Typography variant={'epsilon'}>
                  {formatMessage({
                    id: getTranslation('setting.chatgpt-text'),
                    defaultMessage: 'ChatGPT Text',
                  })}
                </Typography>
                <Box padding={2}>
                  <SingleSelect
                    label={'model'}
                    required={true}
                    value={config?.chatgpt_text_config.model}
                    onChange={(model: string) =>
                      setConfig((prev: any) => ({
                        ...prev,
                        chatgpt_text_config: {
                          ...prev.chatgpt_text_config,
                          model,
                        },
                        isChange: true,
                      }))
                    }
                  >
                    {models.chatGPTText.map((model, index) => (
                      <SingleSelectOption key={index} value={model}>
                        {model}
                      </SingleSelectOption>
                    ))}
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
                    required={true}
                    value={config?.chatgpt_text_config.temperature}
                    onChange={(e: any) =>
                      setConfig((prev: any) => ({
                        ...prev,
                        chatgpt_text_config: {
                          ...prev.chatgpt_text_config,
                          temperature: e.target.value,
                        },
                        isChange: true,
                      }))
                    }
                  />
                </Box>
              </Box>

              {/* Gemini Text Model */}
              <Box paddingTop={2}>
                <Typography variant={'epsilon'}>
                  {formatMessage({
                    id: getTranslation('setting.gemini-text'),
                    defaultMessage: 'Gemini Text',
                  })}
                </Typography>
                <Box padding={2}>
                  <SingleSelect
                    label={'model'}
                    required={true}
                    value={config?.gemini_text_config.model}
                    onChange={(model: string) =>
                      setConfig((prev: any) => ({
                        ...prev,
                        gemini_text_config: {
                          ...prev.gemini_text_config,
                          model,
                        },
                        isChange: true,
                      }))
                    }
                  >
                    {models.geminiText.map((model, index) => (
                      <SingleSelectOption key={index} value={model}>
                        {model}
                      </SingleSelectOption>
                    ))}
                  </SingleSelect>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </>
    </Main>
  );
};

export default Setting;
