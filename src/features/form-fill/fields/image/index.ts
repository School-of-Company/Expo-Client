import { imageModel, type FieldDefinition } from '@/entities/form';
import ImageRenderer from './ui/ImageRenderer';

export { uploadFormImage } from './api/uploadFormImage';

export const imageField: FieldDefinition<string> = {
  ...imageModel,
  Renderer: ImageRenderer,
};
