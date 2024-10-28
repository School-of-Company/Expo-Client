import ImageInput from '.';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ImageInput> = {
  title: 'Components/Common/ImageInput',
  component: ImageInput,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ImageInput>;

export const Default: Story = {
  args: {},
};
