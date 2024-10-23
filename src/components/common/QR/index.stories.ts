import { Meta, StoryObj } from '@storybook/react';
import QR from './index';

const config: Meta<typeof QR> = {
  title: 'Components/Common/QR',
  component: QR,
  args: { qrData: 'https://github.com/School-of-Company/Expo-Client' },
};

export default config;

type Story = StoryObj<typeof QR>;

export const Primary: Story = {
  args: {},
};
