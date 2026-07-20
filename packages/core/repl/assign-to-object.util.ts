/**
 * Similar to `Object.assign` but copying properties descriptors from `source`
 * as well.
 */
export function assignToObject<T, U extends object>(
  target: T,
  source: U,
): T & U {
    throw new Error("STUB");
}
