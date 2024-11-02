import { useState } from 'react';

export const useTrainingInputs = () => {
  const [inputs, setInputs] = useState<string[]>([]);

  const addInput = (): void => {
    setInputs([...inputs, '']);
  };

  const removeInput = (index: number): void => {
    const newInput = [...inputs];
    newInput.splice(index, 1);
    setInputs(newInput);
  };

  const onChangeInput = (index: number, value: string): void => {
    const newInput = [...inputs];
    newInput[index] = value;
    setInputs(newInput);
  };

  return { inputs, addInput, removeInput, onChangeInput };
};
