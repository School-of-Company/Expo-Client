import { Meta, StoryObj } from '@storybook/react';
import ExpoListItem from './index';

const config: Meta<typeof ExpoListItem> = {
  title: 'Components/Common/ExpoListItem',
  component: ExpoListItem,
  args: {
    id: 1,
    coverImage: 'https://via.placeholder.com/140x140',
    title: '박람회 제목',
    description: '박람회 설명',
    startedDay: '2024-01-01',
    finishedDay: '2024-01-02',
  },
};

export default config;

type Story = StoryObj<typeof ExpoListItem>;

export const Primary: Story = {
  args: {},
};
