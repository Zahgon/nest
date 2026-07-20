import { PipeTransform, Type } from '@nestjs/common';
import { assignMetadata } from '@nestjs/common/decorators/http/route-params.decorator';
import { isNil, isString } from '@nestjs/common/utils/shared.utils';
import 'reflect-metadata';
import { PARAM_ARGS_METADATA } from '../constants';
import { RpcParamtype } from '../enums/rpc-paramtype.enum';

export function createRpcParamDecorator(
  paramtype: RpcParamtype,
): (...pipes: (Type<PipeTransform> | PipeTransform)[]) => ParameterDecorator {
  return (...pipes: (Type<PipeTransform> | PipeTransform)[]) =>
    { throw new Error("STUB"); };
}

export const createPipesRpcParamDecorator =
  (paramtype: RpcParamtype) =>
  { throw new Error("STUB"); };
