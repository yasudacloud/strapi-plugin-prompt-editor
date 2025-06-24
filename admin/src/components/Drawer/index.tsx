import React, { useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { getTranslation } from '../../utils/getTranslation';
import { AnimatePresence } from 'motion/react';
import { overlayVariants } from './animation';
import { DrawerContainer, DrawerContent, DrawerOverlay, SendButton, Textarea } from './styles';
import { Cross } from '@strapi/icons';
import styled from 'styled-components';
import { PaperPlane } from '@strapi/icons';

interface Props {
  open: boolean;
  onClose: (value: string, size?: string) => void;
  isDark: boolean;
}

const Header = styled.div`
  margin: 10px 30px;
  justify-content: right;
  display: flex;
`;

const Form = styled.div`
  display: flex;
  align-content: center;
  align-items: flex-end;
  margin: 15px auto;
  max-width: 1024px;
  border: 1px solid #ccc;
  border-radius: 10px;
`;

const Drawer = (props: Props) => {
  const [inputValue, setInputValue] = useState('');
  const { formatMessage } = useIntl();
  const onClear = useCallback(() => {
    setInputValue('');
  }, [inputValue]);
  const onChange = (e: any) => {
    setInputValue(e.target.value);
  };
  const onKeyUp = (e: any) => {
    if (e.key === 'Escape') {
      onClear();
      props.onClose('');
    }
  };

  return (
    <AnimatePresence>
      {props.open && (
        <DrawerContainer>
          <DrawerOverlay
            onClick={() => {
              onClear();
              props.onClose('');
            }}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          <DrawerContent
            isDark={props.isDark}
            variants={{
              hidden: {
                y: '100%',
                opacity: 0,
                transition: {
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                },
              },
              visible: {
                y: '0%',
                opacity: 1,
                transition: {
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                },
              },
              exit: {
                y: '100%',
                opacity: 0,
                transition: {
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                },
              },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div style={{ width: '100vw', height: 240 }}>
              <Header>
                <Cross style={{ cursor: 'pointer' }} onClick={() => props.onClose('')} />
              </Header>
              <Form>
                <div style={{ flex: 1, margin: 8 }}>
                  <Textarea
                    className={'prompt-textarea'}
                    rows={5}
                    autoFocus={true}
                    placeholder={formatMessage({
                      id: getTranslation('app.prompt-placeholder'),
                      defaultMessage: 'input prompt',
                    })}
                    value={inputValue}
                    onChange={onChange}
                    onKeyUp={onKeyUp}
                    isDark={props.isDark}
                  />
                </div>
                &nbsp;
                <SendButton
                  variant={'secondary'}
                  className={'prompt-submit'}
                  disabled={!inputValue}
                  onClick={() => {
                    props.onClose(inputValue);
                  }}
                >
                  <PaperPlane />
                </SendButton>
              </Form>
            </div>
          </DrawerContent>
        </DrawerContainer>
      )}
    </AnimatePresence>
  );
};

export default Drawer;
