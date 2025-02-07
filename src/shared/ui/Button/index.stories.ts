import Button from '.';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Button> = {
  title: 'Components/Common/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    text: '확인',
  },
};

export const White: Story = {
  args: {
    style: 'white',
    text: '확인',
  },
};

export const Main100: Story = {
  args: {
    style: 'main100',
    text: '확인',
  },
};
