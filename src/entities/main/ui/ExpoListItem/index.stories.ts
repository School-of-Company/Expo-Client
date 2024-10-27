import { Meta, StoryObj } from '@storybook/react';
import ExpoListItem from './index';

const config: Meta<typeof ExpoListItem> = {
  title: 'Components/Common/ExpoListItem',
  component: ExpoListItem,
  args: {
    clubName: '2024 AI광주미래교육...',
    description: '안녕하세요!2024 AI광주미래교육박람회 사전 등록 페이지에...',
    startDate: '09.10',
    endDate: '09.20',
  },
};

export default config;

type Story = StoryObj<typeof ExpoListItem>;

export const Primary: Story = {
  args: {},
};
