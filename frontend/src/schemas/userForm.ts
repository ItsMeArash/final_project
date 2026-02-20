import { z } from 'zod'

type TranslateFn = (key: string) => string

function createUsernameSchema(t: TranslateFn) {
  return z
    .string()
    .min(3, t('validation.usernameMin'))
    .max(50, t('validation.usernameMax'))
    .regex(/^[a-zA-Z0-9_-]+$/, t('validation.usernamePattern'))
}

function createPasswordSchema(t: TranslateFn) {
  return z
    .string()
    .min(8, t('validation.passwordMin'))
    .regex(/[A-Z]/, t('validation.passwordUppercase'))
    .regex(/[a-z]/, t('validation.passwordLowercase'))
    .regex(/[0-9]/, t('validation.passwordNumber'))
}

export function createUserSchema(t: TranslateFn) {
  return z.object({
    full_name: z
      .string()
      .min(1, t('validation.fullNameRequired'))
      .max(100, t('validation.fullNameMax')),
    username: createUsernameSchema(t),
    password: createPasswordSchema(t),
    role_id: z.string().min(1, t('validation.roleRequired')),
    is_active: z.boolean(),
  })
}

export function getUpdateUserSchema(t: TranslateFn) {
  return z.object({
    full_name: z
      .string()
      .min(1, t('validation.fullNameRequired'))
      .max(100, t('validation.fullNameMax')),
    username: createUsernameSchema(t),
    password: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val ||
          (val.length >= 8 &&
            /[A-Z]/.test(val) &&
            /[a-z]/.test(val) &&
            /[0-9]/.test(val)),
        t('validation.passwordOptional')
      ),
    role_id: z.string().min(1, t('validation.roleRequired')),
    is_active: z.boolean(),
  })
}

export type CreateUserFormData = z.infer<ReturnType<typeof createUserSchema>>
export type UpdateUserFormData = z.infer<ReturnType<typeof getUpdateUserSchema>>
