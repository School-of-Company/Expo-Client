import {
  regionModel,
  type FieldDefinition,
  type RegionValue,
} from '@/entities/form';
import RegionInput from './ui/RegionInput';

export { RegionInput };

export const regionField: FieldDefinition<RegionValue> = {
  ...regionModel,
  Renderer: RegionInput,
};
