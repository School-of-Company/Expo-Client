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

export const Main100: Story = {
  args: {
    children: '확인',
    variant: 'main100',
    disabled: false,
    width: '100%',
  },
};
