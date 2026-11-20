import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from './apiClient';

/**
 * Maps server validation errors (`error.details = { field: message }`) onto form fields.
 * Returns true if at least one field error was applied.
 */
export function applyServerErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  fields: readonly string[],
): boolean {
  if (!(err instanceof ApiError) || !err.details) return false;
  let applied = false;
  for (const [field, message] of Object.entries(err.details)) {
    if (fields.includes(field)) {
      setError(field as Path<T>, { type: 'server', message }, { shouldFocus: !applied });
      applied = true;
    }
  }
  return applied;
}
