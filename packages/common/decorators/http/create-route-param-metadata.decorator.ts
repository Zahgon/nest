import { uid } from 'uid';
import { ROUTE_ARGS_METADATA } from '../../constants';
import { PipeTransform } from '../../index';
import { Type } from '../../interfaces';
import { CustomParamFactory } from '../../interfaces/features/custom-route-param-factory.interface';
import { assignCustomParameterMetadata } from '../../utils/assign-custom-metadata.util';
import { isFunction, isNil } from '../../utils/shared.utils';

export type ParamDecoratorEnhancer = ParameterDecorator;

/**
 * Defines HTTP route param decorator
 *
 * @param factory
 * @param enhancers
 *
 * @publicApi
 */
export function createParamDecorator<FactoryData = any, FactoryOutput = any>(
  factory: CustomParamFactory<FactoryData, FactoryOutput>,
  enhancers: ParamDecoratorEnhancer[] = [],
): (
  ...dataOrPipes: (Type<PipeTransform> | PipeTransform | FactoryData)[]
) => ParameterDecorator {
    throw new Error("STUB");
}
