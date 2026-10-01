/**
 * The save action behind the Settings form.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { settingsSchema } from '@/lib/validation';

export type SettingsState = {
  saved?: boolean;
  /** The handle that was submitted, so a "taken" error clears once it's edited. */
  handle?: string;
  errors?: { handle?: string; displayName?: string; form?: string };
};

const UNIQUE_VIOLATION = '23505';

/**
 * Saves your display name, handle and privacy setting.
 *
 * It checks everything first and only touches your own profile. If someone
 * grabs the handle a moment before you save, the database refuses the duplicate
 * and you see "That handle is taken" under the field.
 */
export async function updateSettings(
  _previous: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const { user, supabase } = await requireUser();
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fields = z.flattenError(parsed.error).fieldErrors;
    return {
      handle: String(formData.get('handle')),
      errors: {
        handle: fields.handle?.[0],
        displayName: fields.displayName?.[0],
        form: fields.isPrivate && 'Something went wrong. Try again.',
      },
    };
  }

  const { handle, displayName, isPrivate } = parsed.data;
  const { error } = await supabase
    .from('profiles')
    .update({ handle, display_name: displayName, is_private: isPrivate })
    .eq('id', user.id);

  // The unique constraint is the real guard: two people racing for a handle can't both get it.
  if (error?.code === UNIQUE_VIOLATION) {
    return { handle, errors: { handle: 'That handle is taken.' } };
  }
  if (error) return { errors: { form: 'Couldn’t save. Try again.' } };

  revalidatePath('/', 'layout');
  return { saved: true };
}
