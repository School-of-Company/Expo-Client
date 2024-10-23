import { Meta, StoryObj } from '@storybook/react';
import Input from './index';

const config: Meta<typeof Input> = {
  title: 'Input',
  component: Input,
  args: {
    placeholder: '비밀번호',
    error: '비밀번호를 잘못 입력하셨습니다.',
    type: 'password',
  },
};

export default config;

type Story = StoryObj<typeof Input>;

export const Primary: Story = {
  args: {},
};
