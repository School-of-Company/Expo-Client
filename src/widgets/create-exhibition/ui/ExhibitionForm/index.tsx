import React from 'react';
import TrainingModule from '@/entities/create-exhibition/ui/TrainingModule';

const ExhibitionForm = () => {
  return (
    <div className="w-full">
      <div>
        <p className="text-h4 text-black">연수 종류</p>
        <TrainingModule />
      </div>
    </div>
  );
};

export default ExhibitionForm;
