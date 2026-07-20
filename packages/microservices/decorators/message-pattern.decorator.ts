import {
  isNil,
  isNumber,
  isObject,
  isSymbol,
} from '@nestjs/common/utils/shared.utils';

import {
  PATTERN_EXTRAS_METADATA,
  PATTERN_HANDLER_METADATA,
  PATTERN_METADATA,
  TRANSPORT_METADATA,
} from '../constants';
import { Transport } from '../enums';
import { PatternHandler } from '../enums/pattern-handler.enum';
import {
  InvalidGrpcDecoratorException,
  RpcDecoratorMetadata,
} from '../errors/invalid-grpc-message-decorator.exception';
import { PatternMetadata } from '../interfaces/pattern-metadata.interface';

export enum GrpcMethodStreamingType {
  NO_STREAMING = 'no_stream',
  RX_STREAMING = 'rx_stream',
  PT_STREAMING = 'pt_stream',
}

/**
 * Subscribes to incoming messages which fulfils chosen pattern.
 *
 * @publicApi
 */
export const MessagePattern: {
  <T = PatternMetadata | string>(metadata?: T): MethodDecorator;
  <T = PatternMetadata | string>(
    metadata?: T,
    transport?: Transport | symbol,
  ): MethodDecorator;
  <T = PatternMetadata | string>(
    metadata?: T,
    extras?: Record<string, any>,
  ): MethodDecorator;
  <T = PatternMetadata | string>(
    metadata?: T,
    transport?: Transport | symbol,
    extras?: Record<string, any>,
  ): MethodDecorator;
} = <T = PatternMetadata | string>(
  metadata?: T,
  transportOrExtras?: Transport | symbol | Record<string, any>,
  maybeExtras?: Record<string, any>,
): MethodDecorator => {
    throw new Error("STUB");
};

/**
 * Registers gRPC method handler for specified service.
 */
export function GrpcMethod(service?: string): MethodDecorator;
export function GrpcMethod(service: string, method?: string): MethodDecorator;
export function GrpcMethod(
  service: string | undefined,
  method?: string,
): MethodDecorator {
    throw new Error("STUB");
}

/**
 * Registers gRPC call through RX handler for service and method
 *
 * @param service String parameter reflecting the name of service definition from proto file
 */
export function GrpcStreamMethod(service?: string): MethodDecorator;
/**
 * @param service String parameter reflecting the name of service definition from proto file
 * @param method Optional string parameter reflecting the name of method inside of a service definition coming after rpc keyword
 */
export function GrpcStreamMethod(
  service: string,
  method?: string,
): MethodDecorator;
export function GrpcStreamMethod(
  service: string | undefined,
  method?: string,
): MethodDecorator {
    throw new Error("STUB");
}

/**
 * Registers gRPC call pass through handler for service and method
 *
 * @param service String parameter reflecting the name of service definition from proto file
 */
export function GrpcStreamCall(service?: string): MethodDecorator;
/**
 * @param service String parameter reflecting the name of service definition from proto file
 * @param method Optional string parameter reflecting the name of method inside of a service definition coming after rpc keyword
 */
export function GrpcStreamCall(
  service: string,
  method?: string,
): MethodDecorator;
export function GrpcStreamCall(
  service: string | undefined,
  method?: string,
): MethodDecorator {
    throw new Error("STUB");
}

export function createGrpcMethodMetadata(
  target: object,
  key: string | symbol,
  service: string | undefined,
  method: string | undefined,
  streaming = GrpcMethodStreamingType.NO_STREAMING,
) {
    throw new Error("STUB");
}
