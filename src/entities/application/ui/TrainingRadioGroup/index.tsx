'use client';
import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';

interface ExpoData {
  id: number;
  title: string;
  startedAt: string;
  endedAt: string;
}

interface RadioGroupProps {
  label: string;
  name: string;
  error?: string;
  params: number;
  trainingId?: string;
  setSelectedValue: (value: number) => void;
  selectedValue: number | null;
}

const TrainingRadioGroup = ({
  label,
  name,
  error,
  params,
  setSelectedValue,
  selectedValue,
}: RadioGroupProps) => {
  const [otherInput] = useState('');
  const [expoData, setExpoData] = useState<ExpoData[]>([]);
  const [navigation] = useState<string>('training');

  const otherInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (otherInputRef.current) {
      otherInputRef.current.focus();
    }
  }, [otherInput]);

  useEffect(() => {
    const fetchExpoData = async () => {
      try {
        const endpoint =
          navigation === 'training'
            ? `/api/training/program/${params}`
            : `/api/standard/program/${params}`;

        const response = await axios.get(endpoint);
        setExpoData(response.data);
      } catch (error) {
        console.error('Error fetching expo data:', error);
      }
    };
    fetchExpoData();
  }, [navigation, params]);

  const handleRadioChange = (id: number) => {
    setSelectedValue(id);
  };

  return (
    <div>
      <div className="w-full rounded-sm border-1 border-solid border-gray-200 p-[18px]">
        <div className="mb-3 text-xl">{label}</div>
        <div className="flex flex-col space-y-2">
          {expoData.map((option) => {
            const optionId = `radio-${name}-${option.id}-${Math.random().toString(36).substr(2, 9)}`;
            return (
              <label
                key={option.id}
                htmlFor={optionId}
                className="flex items-center space-x-2"
              >
                <input
                  type="radio"
                  id={optionId}
                  name={name}
                  value={option.id}
                  checked={selectedValue === option.id}
                  onChange={() => handleRadioChange(option.id)}
                  className="form-radio text-gray-500"
                />
                <span className="text-gray-800">{option.title}</span>
              </label>
            );
          })}
        </div>
      </div>
      {error && (
        <div className="float-right mt-2 flex text-sm text-error">{error}</div>
      )}
    </div>
  );
};

TrainingRadioGroup.handleTrainingSubmit = async (
  selectedValue: number,
  trainingId: string,
) => {
  try {
    const response = await axios.post(
      `/api/training/application/${selectedValue}`,
      {
        trainingId,
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error submitting training:', error);
    throw error;
  }
};

export default TrainingRadioGroup;
