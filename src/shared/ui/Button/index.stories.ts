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
    children: '확인',
    variant: 'default',
    disabled: false,
    width: '100%',
  },
};

export const White: Story = {
  args: {
    children: '확인',
    variant: 'white',
    disabled: false,
    width: '100%',
  },
};

export const Danger: Story = {
  args: {
    children: '삭제',
    variant: 'danger',
    disabled: false,
    width: '100%',
  },
};

export const Small: Story = {
  args: {
    children: '다시 불러오기',
    variant: 'white',
    size: 'small',
    disabled: false,
  },
};
