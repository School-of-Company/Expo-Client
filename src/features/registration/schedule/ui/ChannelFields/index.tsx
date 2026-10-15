'use client';

import { Trash } from '@/shared/assets/icons';
import { AddItemButton, Input } from '@/shared/ui';
import { AdminOccupation } from '../../../common/api/ledgerApi';
import { OCCUPATION_LABEL } from '../../../common/model/ledger';
import { ChannelForm, EMPTY_CHANNEL_FORM } from '../../model/policyForm';
import { toCount } from '../../model/sessionForm';

interface ChannelFieldsProps {
  value: ChannelForm[];
  onChange: (channels: ChannelForm[]) => void;
}

const OCCUPATIONS = Object.keys(OCCUPATION_LABEL) as AdminOccupation[];

/** 회차 신청 채널(신청 구분)별 정원. 한 직업은 한 채널에만 넣을 수 있다 */
const ChannelFields = ({ value, onChange }: ChannelFieldsProps) => {
  const update = (index: number, patch: Partial<ChannelForm>) =>
    onChange(
      value.map((channel, i) =>
        i === index ? { ...channel, ...patch } : channel,
      ),
    );

  // 다른 채널이 이미 가진 직업은 고를 수 없게 한다
  const takenBy = (index: number) =>
    new Set(
      value
        .filter((_, i) => i !== index)
        .flatMap(({ allowedOccupations }) => allowedOccupations),
    );

  return (
    <div className="space-y-12">
      {value.map((channel, index) => {
        const taken = takenBy(index);
        return (
          <div
            // 채널 이름은 편집 중에 겹칠 수 있어 순서를 키로 쓴다
            key={index}
            className="space-y-12 rounded-sm border-1 border-solid border-gray-200 px-16 py-12"
          >
            <div className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-12 mobile:grid-cols-1">
              <Input
                size="small"
                aria-label="채널 이름"
                placeholder="채널 이름 (예: 교원)"
                maxLength={50}
                value={channel.name}
                onChange={(e) => update(index, { name: e.target.value })}
              />
              <Input
                size="small"
                type="number"
                min={1}
                aria-label="채널 정원"
                value={channel.capacity}
                onChange={(e) =>
                  update(index, { capacity: toCount(e.target.value) })
                }
              />
              <Input
                size="small"
                type="number"
                min={0}
                aria-label="채널 대기 정원"
                value={channel.waitingCapacity}
                onChange={(e) =>
                  update(index, { waitingCapacity: toCount(e.target.value) })
                }
              />
              <button
                type="button"
                aria-label="채널 삭제"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
              >
                <Trash />
              </button>
            </div>
            <div className="flex flex-wrap gap-8">
              {OCCUPATIONS.map((occupation) => {
                const isSelected =
                  channel.allowedOccupations.includes(occupation);
                return (
                  <button
                    key={occupation}
                    type="button"
                    aria-pressed={isSelected}
                    disabled={!isSelected && taken.has(occupation)}
                    onClick={() =>
                      update(index, {
                        allowedOccupations: isSelected
                          ? channel.allowedOccupations.filter(
                              (item) => item !== occupation,
                            )
                          : [...channel.allowedOccupations, occupation],
                      })
                    }
                    className={`rounded-sm border-1 border-solid px-12 py-6 text-caption1r disabled:opacity-40 ${
                      isSelected
                        ? 'border-main-600 text-main-600'
                        : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    {OCCUPATION_LABEL[occupation]}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <AddItemButton onClick={() => onChange([...value, EMPTY_CHANNEL_FORM])} />
    </div>
  );
};

export default ChannelFields;
