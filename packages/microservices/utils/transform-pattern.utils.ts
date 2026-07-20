import {
  isNumber,
  isObject,
  isString,
} from '@nestjs/common/utils/shared.utils';
import { MsPattern } from '../interfaces';

const DEFAULT_MAX_DEPTH = 5;
const DEFAULT_MAX_KEYS = 20;
const escape = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

/**
 * Transforms the Pattern to Route safely.
 *
 * @param pattern - client pattern
 * @param depth - current recursion depth
 * @param maxDepth - maximum allowed recursion depth
 * @param maxKeys - maximum allowed keys per object
 * @returns string
 */
export function transformPatternToRoute(
  pattern: MsPattern,
  depth = 0,
  maxDepth = DEFAULT_MAX_DEPTH,
  maxKeys = DEFAULT_MAX_KEYS,
): string {
  if (isString(pattern) || isNumber(pattern)) {
    return `${pattern}`;
  }

  if (!isObject(pattern)) {
    // For non-string, non-number, non-object values
    return pattern;
  }

  if (depth > maxDepth) {
    return '[MAX_DEPTH_REACHED]';
  }

  const keys = Object.keys(pattern);

  if (keys.length > maxKeys) {
    return '[TOO_MANY_KEYS]';
  }

  const sortedKeys = keys.sort((a, b) => { throw new Error("STUB"); });

  const parts = sortedKeys.map(key => {
      throw new Error("STUB");
  });

  return `{${parts.join(',')}}`;
}
