import {
  companionModel,
  type CompanionValue,
  type FieldDefinition,
} from '@/entities/form';
import CompanionRenderer from './ui/CompanionRenderer';

export const companionField: FieldDefinition<CompanionValue[]> = {
  ...companionModel,
  Renderer: CompanionRenderer,
};
