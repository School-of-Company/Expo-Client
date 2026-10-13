import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import FormBuilder from './index';
import type { DynamicFormItem } from '@/shared/types/application/type';

const sample: DynamicFormItem[] = [
  {
    id: 1,
    title: '참여 경로',
    formType: 'DROPDOWN',
    jsonData: { '1': '지인 추천', '2': 'SNS', '3': '기타' },
    requiredStatus: true,
    otherJson: { hasEtc: false },
    dynamicFormType: 'DEFAULT',
  },
  {
    id: 2,
    title: '어느 SNS에서 보셨나요?',
    formType: 'MULTIPLE',
    jsonData: {
      '1': '인스타그램',
      '2': '유튜브',
    },
    requiredStatus: false,
    otherJson: {
      hasEtc: true,
      maxSelection: 2,
      conditional: { parentIndex: 0, triggerValue: '2' },
    },
    dynamicFormType: 'DEFAULT',
  },
  {
    id: 3,
    title: '하고 싶은 말',
    formType: 'SENTENCE',
    jsonData: {},
    requiredStatus: false,
    otherJson: null,
    dynamicFormType: 'DEFAULT',
  },
];

const Controlled = ({ initial }: { initial: DynamicFormItem[] }) => {
  const [value, setValue] = useState(initial);
  return <FormBuilder value={value} onChange={setValue} />;
};

const config: Meta<typeof Controlled> = {
  title: 'Features/FormBuilder',
  component: Controlled,
  args: { initial: sample },
};

export default config;

type Story = StoryObj<typeof Controlled>;

export const Primary: Story = {};

export const Empty: Story = { args: { initial: [] } };
