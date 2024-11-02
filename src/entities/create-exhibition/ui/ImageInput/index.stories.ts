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
  args: {
    img: null,
    setImg: () => {},
  },
};

export const WithImage: Story = {
  args: {
    img: 'https://cdn.discordapp.com/attachments/857824085509799936/1302103898215153764/20240626_192254.jpg?ex=6726e641&is=672594c1&hm=c653865724d6696c043fe6e37ab5cb247c7ba4b374a8520feb0645d2eab55e2f&',
    setImg: () => {},
  },
};
