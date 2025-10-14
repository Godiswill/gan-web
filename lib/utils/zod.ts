import { z } from 'zod';
import { IMAGE_MAX_SIZE, MAX_FILES } from '@/lib/utils/const';

export const NanoBananaSchema = z.object({
  prompt: z.string().trim().min(8, {
    message: 'This field is required',
  }),
  files: z
    .array(
      z.object({
        file: z.instanceof(File),
        width: z.number().positive('Width must be positive'),
        height: z.number().positive('Height must be positive'),
      })
    )
    .max(MAX_FILES, `You can upload up to ${MAX_FILES} files`)
    .refine(
      (files) => files.every((f) => f.file.size <= IMAGE_MAX_SIZE),
      `Each file must be less than ${IMAGE_MAX_SIZE / (1024 * 1024)}MB`
    )
    .refine(
      (files) => files.every((f) => /^image\//.test(f.file.type)),
      'Only images are allowed'
    )
    .optional(),
  output_format: z.enum(['jpeg', 'png']).optional(),
  num_images: z.number().optional(),
});

export const NanoBananaSchemaEdit = z.object({
  prompt: z.string().trim().min(8, {
    message: 'This field is required',
  }),
  files: z
    .array(
      z.object({
        file: z.instanceof(File),
        width: z.number().positive('Width must be positive'),
        height: z.number().positive('Height must be positive'),
      })
    )
    .min(1, 'At least one file is required')
    .max(10, 'You can upload up to 10 files')
    .refine(
      (files) => files.every((f) => f.file.size <= 5 * 1024 * 1024),
      'Each file must be less than 5MB'
    )
    .refine(
      (files) => files.every((f) => /^image\//.test(f.file.type)),
      'Only images are allowed'
    )
    .optional(),
  // image_size: z.string().optional(),
  seed: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const num = Number(val);
      return Number.isInteger(num) && num >= 1 && num <= 4294967295;
    }, 'Seed must be an integer between 1 and 4294967295'),
  // seed: z.number().min(2).max(4294967295).optional(),
  output_format: z.enum(['jpeg', 'png']).optional(),
  num_images: z.number().optional(),
});
