import { Meta, StoryObj } from '@storybook/react';
import Filter from './index';

const config: Meta<typeof Filter> = {
  title: 'Components/Common/SortFilter',
  component: Filter,
};

export default config;

type Story = StoryObj<typeof Filter>;

export const Primary: Story = {
  args: {},
};
