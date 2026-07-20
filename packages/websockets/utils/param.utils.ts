import { PipeTransform, Type } from '@nestjs/common';
import { assignMetadata } from '@nestjs/common/decorators/http/route-params.decorator';
import { isNil, isString } from '@nestjs/common/utils/shared.utils';
import 'reflect-metadata';
import { PARAM_ARGS_METADATA } from '../constants';
import { WsParamtype } from '../enums/ws-paramtype.enum';

export function createWsParamDecorator(
  paramtype: WsParamtype,
): (...pipes: (Type<PipeTransform> | PipeTransform)[]) => ParameterDecorator {
  return (...pipes: (Type<PipeTransform> | PipeTransform)[]) =>
    { throw new Error("STUB"); };
}

export const createPipesWsParamDecorator =
  (paramtype: WsParamtype) =>
  { throw new Error("STUB"); };
