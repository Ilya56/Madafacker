/**
 * Check is object is empty
 * @param obj object to check
 * @private
 */
export function objectIsEmpty(obj: any): boolean {
  return obj && typeof obj === 'object' && Object.keys(obj).length === 0;
}
