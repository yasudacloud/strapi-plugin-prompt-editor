import {
  Button, Popover, TextInput, SingleSelect,
  SingleSelectOption,
} from "@strapi/design-system";
import React, {useState} from "react";
import styled from "styled-components";
import {useIntl} from "react-intl";
import {getTranslation} from "../utils/getTranslation";
import {GenerateType} from "./Editor";

interface Props {
  sourceRef?: any
  open: boolean
  onClose: (value: string, size?: string) => void
  type: GenerateType
  imageSizes?: string[]
  defaultSize?: string
}

const Form = styled.div`
  display: flex;
  align-content: center;
  align-items: center;
`

const width = 300;
const height = 80;

const PromptPopover = (props: Props) => {
  const [inputValue, setInputValue] = useState('');
  const [imageSize, setImageSize] = useState(props.defaultSize)
  const [isDark] = useState(localStorage.getItem('STRAPI_THEME') === 'dark')
  const {formatMessage} = useIntl();
  const onChange = (e: any) => {
    setInputValue(e.target.value)
  }
  const type = [
    GenerateType.chatGPTText,
    GenerateType.geminiText
  ].some(type => type === props.type) ? 'text' : 'image'
  const getPromptButtonIntl = () => {
    return {
      id: getTranslation(`app.prompt-generate-${type}`),
      defaultMessage: type === 'text' ? 'Generate Text' : 'Generate Image'
    }
  }
  return (
    <Popover
      onDismiss={props.onClose}
      source={props.sourceRef}
      padding={3}
      spacing={4}
      style={{
        position: 'fixed',
        left: `calc(50% - ${width / 2}px)`,
        top: `calc(50% - ${height / 2}px)`,
        backgroundColor: isDark ? 'rgb(30, 30, 46)' : '#fff',
        border: '1px solid #ddd',
        borderRadius: 2
      }}
    >
      <Form>
        <TextInput
          autoFocus={true}
          placeholder={formatMessage({
            id: getTranslation('app.prompt-placeholder'),
            defaultMessage: 'input prompt'
          })}
          autoComplete={false}
          label={' '}
          value={inputValue}
          onChange={onChange}
        />
        {
          type === 'image' && (
            <>
              &nbsp;
              <SingleSelect
                value={imageSize}
                onChange={(e: any) => setImageSize(e)}
              >
                {
                  props.imageSizes?.map(size => (
                    <SingleSelectOption value={size}>{size}</SingleSelectOption>
                  ))
                }
              </SingleSelect>
            </>
          )
        }
        &nbsp;
        <Button
          variant={'secondary'}
          disabled={!inputValue}
          onClick={() => {
            if (type === 'text') {
              props.onClose(inputValue)
            } else {
              props.onClose(inputValue, imageSize)
            }
          }}
        >{
          formatMessage(getPromptButtonIntl())
        }</Button>
      </Form>
    </Popover>
  )
}

export default PromptPopover;
