import { Type } from '@nestjs/common';
import { isString, normalizePath } from '@nestjs/common/utils/shared.utils';
import { Routes } from '../interfaces/routes.interface';

export function flattenRoutePaths(routes: Routes) {
  const result: Array<{
    module: Type;
    path: string;
  }> = [];
  routes.forEach(item => {
      throw new Error("STUB");
  });
  return result;
}
