import styled from 'styled-components';
import { motion } from 'motion/react';
import { Button } from '@strapi/design-system';

interface ThemeProps {
  isDark: boolean;
}

export const DrawerContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 1003;
  pointer-events: none;
`;

export const DrawerOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  pointer-events: auto;
  z-index: 1003;
`;

export const DrawerContent = styled(motion.div)<ThemeProps>`
  position: fixed;
  z-index: 1004;
  width: 100%;
  bottom: 0;
  left: 0;
  background-color: ${(props) => (props.isDark ? '#333' : '#fff')};
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  padding: 10px 0;
`;

export const SendButton = styled(Button)`
  position: relative;
  margin: 0 4px 4px 0;
`;

export const Textarea = styled.textarea<ThemeProps>`
  height: 100%;
  width: 100%;
  font-size: 16px;
  resize: none;
  padding: 10px;
  outline: none;
  border: none;
  background-color: ${(props) => (props.isDark ? '#333' : 'initial')};
  caret-color: ${(props) => (props.isDark ? '#fff' : 'initial')};
  color: ${(props) => (props.isDark ? '#fff' : 'initial')};
`;
