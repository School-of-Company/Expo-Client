import { Meta, StoryObj } from '@storybook/react';
import TextArea from './index';

const config: Meta<typeof TextArea> = {
  title: 'Components/Common/TextArea',
  component: TextArea,
  args: {
    title: '텍스트 영역',
    placeholder: '여기에 텍스트를 입력하세요',
    maxLength: 100,
    text: '',
    state: '',
    row: 3,
  },
  argTypes: {
    setState: { action: 'setState' },
  },
};

export default config;

type Story = StoryObj<typeof TextArea>;

export const Primary: Story = {
  args: {},
};

export const WithContent: Story = {
  args: {
    state: '이미 입력된 텍스트입니다.',
  },
};

export const LongContent: Story = {
  args: {
    state:
      '이것은 매우 긴 텍스트 내용입니다. 텍스트 영역이 어떻게 확장되는지 보여주기 위한 예시입니다.',
    row: 1,
  },
};

export const NearMaxLength: Story = {
  args: {
    maxLength: 50,
    state: '이 텍스트는 최대 길이에 가깝습니다. 글자 수를 확인해보세요.',
  },
};
