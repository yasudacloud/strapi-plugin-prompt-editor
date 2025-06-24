import styled from 'styled-components';
import { BlockNoteView } from '@blocknote/mantine';
import React from 'react';

interface Dark {
  dark: boolean;
}

type MenuIconProps = React.ComponentPropsWithoutRef<'img'> & Dark;

const EditorStyle = styled(BlockNoteView)<any>`
  & {
    min-height: 200px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin: 10px;
    padding: 8px;
  }

  &.error {
    border: 1px solid #ff0000;
  }

  & .bn-editor {
    background: ${({ dark }) => (dark ? 'rgb(30, 30, 46)' : 'initial')};
    color: ${({ dark }) => (dark ? '#fff' : 'initial')};
    border: none;
    padding: 0;
  }

  & strong {
    font-weight: bold !important;
  }

  & em {
    font-style: italic;
  }
`;

const ChatGPTIcon = styled.img<MenuIconProps>`
  background-color: ${(props) => (props.dark ? '#fff' : 'initial')};
  border-radius: 50%;
  width: 20px;
  height: 20px;
`;

const GeminiIcon = styled.img<MenuIconProps>`
  background-color: ${(props) => (props.dark ? '#fff' : 'initial')};
  width: 40px;
`;

export { EditorStyle, ChatGPTIcon, GeminiIcon };
