import type { Preview } from '@storybook/react';
import React from 'react';
import { pretendard } from '../src/shared/styles/fonts';
import '../src/shared/styles/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) =>
      React.createElement(
        'div',
        { className: pretendard.variable },
        React.createElement(Story, null),
      ),
  ],
};

export default preview;
