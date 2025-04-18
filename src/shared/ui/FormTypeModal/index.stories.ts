import Modal from '.';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Modal> = {
  title: 'Components/Common/FormTypeModal',
  component: Modal,
  tags: ['autodocs'],
  args: { text: '해당 박람회에 지원하시겠습니까?' },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {},
};
