import { z } from 'zod';

export const FormFieldType = z.enum([
  'TEXT',
  'TEXTAREA',
  'SINGLE_SELECT',
  'MULTI_SELECT',
  'DROPDOWN',
  'PHONE',
]);

export type FormFieldType = z.infer<typeof FormFieldType>;

export const OptionSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1, 'Option label is required'),
  value: z.string(),
});

export type Option = z.infer<typeof OptionSchema>;

export const FieldConfigSchema = z.object({
  placeholder: z.string().optional(),
  description: z.string().optional(),
  maxSelection: z.number().min(1).optional(),
  minSelection: z.number().min(0).optional(),
  allowEtc: z.boolean().default(false),
  etcLabel: z.string().default('기타'),
});

export type FieldConfig = z.infer<typeof FieldConfigSchema>;

export const ConditionOperator = z.enum(['eq', 'neq', 'in', 'nin', 'gt', 'lt']);

export const ConditionSchema = z.object({
  fieldId: z.string().uuid(),
  op: ConditionOperator,
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
});

export const LogicSchema = z.object({
  visibility: z
    .object({
      op: z.enum(['AND', 'OR']).default('AND'),
      conditions: z.array(ConditionSchema),
    })
    .optional(),
});

export type FormLogic = z.infer<typeof LogicSchema>;

export const FormItemSchema = z.object({
  id: z.string().uuid(),
  type: FormFieldType,
  label: z.string().min(1, 'Question title is required'),
  required: z.boolean().default(false),

  options: z.array(OptionSchema).optional(),
  config: FieldConfigSchema.optional(),
  logic: LogicSchema.optional(),
});

export type FormItem = z.infer<typeof FormItemSchema>;

export const FormSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Form title is required'),
  description: z.string().optional(),
  items: z.array(FormItemSchema),

  version: z.number().default(1),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type FormSchema = z.infer<typeof FormSchema>;
