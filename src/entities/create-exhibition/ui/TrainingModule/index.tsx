'use client';

import React from 'react';
import { useTrainingInputs } from '../../model/useTrainingInputs';
import ExpoInput from '../ExpoInput';

const TrainingModule = () => {
  const { inputs, addInput, removeInput, onChangeInput } = useTrainingInputs();

  return (
    <div className="w-full rounded-sm border-1 border-solid border-gray-200 px-[30px] py-[26px]">
      <div className="w-full">
        <ExpoInput
          inputs={inputs}
          addInput={addInput}
          removeInput={removeInput}
          onChangeInput={onChangeInput}
        />
      </div>
    </div>
  );
};

export default TrainingModule;
