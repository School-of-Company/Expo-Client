import ExpoInput from '.';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ExpoInput> = {
  title: 'Components/Common/ExpoInput',
  component: ExpoInput,
  tags: ['autodocs'],
  args: { number: 1 },
};

export default meta;
type Story = StoryObj<typeof ExpoInput>;

export const Default: Story = {
  args: {},
};
