import {
  isObject,
  isString,
  isUndefined,
} from '@nestjs/common/utils/shared.utils';
import {
  EMPTY,
  Observable,
  ReplaySubject,
  Subject,
  Subscription,
  defaultIfEmpty,
  fromEvent,
  lastValueFrom,
} from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { GRPC_DEFAULT_PROTO_LOADER, GRPC_DEFAULT_URL } from '../constants';
import { GrpcMethodStreamingType } from '../decorators';
import { Transport } from '../enums';
import { InvalidGrpcPackageException } from '../errors/invalid-grpc-package.exception';
import { InvalidProtoDefinitionException } from '../errors/invalid-proto-definition.exception';
import { ChannelOptions } from '../external/grpc-options.interface';
import { getGrpcPackageDefinition } from '../helpers';
import { MessageHandler } from '../interfaces';
import {
  GrpcOptions,
  TransportId,
} from '../interfaces/microservice-configuration.interface';
import { Server } from './server';

const CANCELLED_EVENT = 'cancelled';

// To enable type safety for gRPC. This cant be uncommented by default
// because it would require the user to install the @grpc/grpc-js package even if they dont use gRPC
// Otherwise, TypeScript would fail to compile the code.
//
// type GrpcServer = import('@grpc/grpc-js').Server;
// let grpcPackage = {} as typeof import('@grpc/grpc-js');
// let grpcProtoLoaderPackage = {} as typeof import('@grpc/proto-loader');

type GrpcServer = any;
let grpcPackage = {} as any;
let grpcProtoLoaderPackage = {} as any;

interface GrpcCall<TRequest = any, TMetadata = any> {
  request: TRequest;
  metadata: TMetadata;
  sendMetadata: Function;
  end: Function;
  write: Function;
  on: Function;
  off: Function;
  emit: Function;
}

/**
 * @publicApi
 */
export class ServerGrpc extends Server<never, never> {
  public transportId: TransportId = Transport.GRPC;
  protected readonly url: string;
  protected grpcClient: GrpcServer;

  get status(): never {
    throw new Error(
      'The "status" attribute is not supported by the gRPC transport',
    );
  }

  constructor(private readonly options: Readonly<GrpcOptions>['options']) {
      throw new Error("STUB");
  }

  public async listen(
    callback: (err?: unknown, ...optionalParams: unknown[]) => void,
  ) {
    try {
      this.grpcClient = await this.createClient();
      await this.start(callback);
    } catch (err) {
      callback(err);
    }
  }

  public async start(callback?: () => void) {
    await this.bindEvents();
    callback?.();
  }

  public async bindEvents() {
    const grpcContext = this.loadProto();
    const packageOption = this.getOptionsProp(this.options, 'package');
    const packageNames = Array.isArray(packageOption)
      ? packageOption
      : [packageOption];

    for (const packageName of packageNames) {
      const grpcPkg = this.lookupPackage(grpcContext, packageName);
      await this.createServices(grpcPkg, packageName);
    }
  }

  /**
   * Will return all of the services along with their fully namespaced
   * names as an array of objects.
   * This method initiates recursive scan of grpcPkg object
   */
  public getServiceNames(grpcPkg: any): { name: string; service: any }[] {
    // Define accumulator to collect all of the services available to load
    const services: { name: string; service: any }[] = [];
    // Initiate recursive services collector starting with empty name
    this.collectDeepServices('', grpcPkg, services);
    return services;
  }

  public getKeepaliveOptions() {
    if (!isObject(this.options.keepalive)) {
      return {};
    }
    const keepaliveKeys: Record<string, string> = {
      keepaliveTimeMs: 'grpc.keepalive_time_ms',
      keepaliveTimeoutMs: 'grpc.keepalive_timeout_ms',
      keepalivePermitWithoutCalls: 'grpc.keepalive_permit_without_calls',
      http2MaxPingsWithoutData: 'grpc.http2.max_pings_without_data',
      http2MinTimeBetweenPingsMs: 'grpc.http2.min_time_between_pings_ms',
      http2MinPingIntervalWithoutDataMs:
        'grpc.http2.min_ping_interval_without_data_ms',
      http2MaxPingStrikes: 'grpc.http2.max_ping_strikes',
    };

    const keepaliveOptions = {};
    for (const [optionKey, optionValue] of Object.entries(
      this.options.keepalive,
    )) {
      const key = keepaliveKeys[optionKey];
      if (key === undefined) {
        continue;
      }
      keepaliveOptions[key] = optionValue;
    }
    return keepaliveOptions;
  }

  /**
   * Will create service mapping from gRPC generated Object to handlers
   * defined with @GrpcMethod or @GrpcStreamMethod annotations
   *
   * @param grpcService
   * @param name
   */
  public async createService(grpcService: any, name: string) {
    const service = {};

    for (const methodName in grpcService.prototype) {
      let methodHandler: MessageHandler | null = null;
      let streamingType = GrpcMethodStreamingType.NO_STREAMING;

      const methodFunction = grpcService.prototype[methodName];
      const methodReqStreaming = methodFunction.requestStream;

      if (!isUndefined(methodReqStreaming) && methodReqStreaming) {
        // Try first pattern to be presented, RX streaming pattern would be
        // a preferable pattern to select among a few defined
        methodHandler = this.getMessageHandler(
          name,
          methodName,
          GrpcMethodStreamingType.RX_STREAMING,
          methodFunction,
        );
        streamingType = GrpcMethodStreamingType.RX_STREAMING;
        // If first pattern didn't match to any of handlers then try
        // pass-through handler to be presented
        if (!methodHandler) {
          methodHandler = this.getMessageHandler(
            name,
            methodName,
            GrpcMethodStreamingType.PT_STREAMING,
            methodFunction,
          );
          streamingType = GrpcMethodStreamingType.PT_STREAMING;
        }
      } else {
        // Select handler if any presented for No-Streaming pattern
        methodHandler = this.getMessageHandler(
          name,
          methodName,
          GrpcMethodStreamingType.NO_STREAMING,
          methodFunction,
        );
        streamingType = GrpcMethodStreamingType.NO_STREAMING;
      }
      if (!methodHandler) {
        continue;
      }

      Object.defineProperty(methodHandler, 'name', {
        value: methodName,
        writable: false,
      });
      service[methodName] = this.createServiceMethod(
        methodHandler,
        grpcService.prototype[methodName],
        streamingType,
      );
    }
    return service;
  }

  public getMessageHandler(
    serviceName: string,
    methodName: string,
    streaming: GrpcMethodStreamingType,
    grpcMethod: { path?: string },
  ): MessageHandler {
    let pattern = this.createPattern(serviceName, methodName, streaming);
    let methodHandler = this.messageHandlers.get(pattern)!;
    if (!methodHandler) {
      const packageServiceName = grpcMethod.path?.split?.('/')[1];
      pattern = this.createPattern(packageServiceName!, methodName, streaming);
      methodHandler = this.messageHandlers.get(pattern)!;
    }
    return methodHandler;
  }

  /**
   * Will create a string of a JSON serialized format
   *
   * @param service name of the service which should be a match to gRPC service definition name
   * @param methodName name of the method which is coming after rpc keyword
   * @param streaming GrpcMethodStreamingType parameter which should correspond to
   * stream keyword in gRPC service request part
   */
  public createPattern(
    service: string,
    methodName: string,
    streaming: GrpcMethodStreamingType,
  ): string {
    return JSON.stringify({
      service,
      rpc: methodName,
      streaming,
    });
  }

  /**
   * Will return async function which will handle gRPC call
   * with Rx streams or as a direct call passthrough
   *
   * @param methodHandler
   * @param protoNativeHandler
   * @param streamType
   */
  public createServiceMethod(
    methodHandler: Function,
    protoNativeHandler: any,
    streamType: GrpcMethodStreamingType,
  ): Function {
    // If proto handler has request stream as "true" then we expect it to have
    // streaming from the side of requester
    if (protoNativeHandler.requestStream) {
      // If any handlers were defined with GrpcStreamMethod annotation use RX
      if (streamType === GrpcMethodStreamingType.RX_STREAMING) {
        return this.createRequestStreamMethod(
          methodHandler,
          protoNativeHandler.responseStream,
        );
      }
      // If any handlers were defined with GrpcStreamCall annotation
      else if (streamType === GrpcMethodStreamingType.PT_STREAMING) {
        return this.createStreamCallMethod(
          methodHandler,
          protoNativeHandler.responseStream,
        );
      }
    }
    return protoNativeHandler.responseStream
      ? this.createStreamServiceMethod(methodHandler)
      : this.createUnaryServiceMethod(methodHandler);
  }

  public createUnaryServiceMethod(methodHandler: Function): Function {
    return async (call: GrpcCall, callback: Function) => {
        throw new Error("STUB");
    };
  }

  public createStreamServiceMethod(methodHandler: Function): Function {
    return async (call: GrpcCall, callback: Function) => {
        throw new Error("STUB");
    };
  }

  public unwrap<T>(): T {
      throw new Error("STUB");
  }

  public on<
    EventKey extends string | number | symbol = string | number | symbol,
    EventCallback = any,
  >(event: EventKey, callback: EventCallback) {
    throw new Error('Method is not supported in gRPC mode.');
  }

  /**
   * Writes an observable to a GRPC call.
   *
   * This function will ensure that backpressure is managed while writing values
   * that come from an observable to a GRPC call.
   *
   * @param source The observable we want to write out to the GRPC call.
   * @param call The GRPC call we want to write to.
   * @returns A promise that resolves when we're done writing to the call.
   */
  private writeObservableToGrpc<T>(
    source: Observable<T>,
    call: GrpcCall<T>,
  ): Promise<void> {
    // This promise should **not** reject, as we're handling errors in the observable for the Call
    // the promise is only needed to signal when writing/draining has been completed
    return new Promise((resolve, _doNotUse) => {
        throw new Error("STUB");
    });
  }

  public createRequestStreamMethod(
    methodHandler: Function,
    isResponseStream: boolean,
  ) {
    return async (
      call: GrpcCall,
      callback: (err: unknown, value: unknown) => void,
    ) => {
        throw new Error("STUB");
    };
  }

  public createStreamCallMethod(
    methodHandler: Function,
    isResponseStream: boolean,
  ) {
    return async (
      call: GrpcCall,
      callback: (err: unknown, value: unknown) => void,
    ) => {
        throw new Error("STUB");
    };
  }

  public async close(): Promise<void> {
    if (this.grpcClient) {
      const graceful = this.getOptionsProp(this.options, 'gracefulShutdown');
      if (graceful) {
        await new Promise<void>((resolve, reject) => {
            throw new Error("STUB");
        });
      } else {
        this.grpcClient.forceShutdown();
      }
    }
    this.grpcClient = null;
  }

  public deserialize(obj: any): any {
    try {
      return JSON.parse(obj);
    } catch (e) {
      return obj;
    }
  }

  public addHandler(
    pattern: unknown,
    callback: MessageHandler,
    isEventHandler = false,
  ) {
    const route = isString(pattern) ? pattern : JSON.stringify(pattern);
    callback.isEventHandler = isEventHandler;
    this.messageHandlers.set(route, callback);
  }

  public async createClient() {
    const channelOptions: ChannelOptions =
      this.options && this.options.channelOptions
        ? this.options.channelOptions
        : {};
    if (this.options && this.options.maxSendMessageLength) {
      channelOptions['grpc.max_send_message_length'] =
        this.options.maxSendMessageLength;
    }
    if (this.options && this.options.maxReceiveMessageLength) {
      channelOptions['grpc.max_receive_message_length'] =
        this.options.maxReceiveMessageLength;
    }
    if (this.options && this.options.maxMetadataSize) {
      channelOptions['grpc.max_metadata_size'] = this.options.maxMetadataSize;
    }

    const keepaliveOptions = this.getKeepaliveOptions();
    const options: Record<string, string | number> = {
      ...channelOptions,
      ...keepaliveOptions,
    };

    // Use merged options instead of just channelOptions
    const server = new grpcPackage.Server(options);
    const credentials = this.getOptionsProp(this.options, 'credentials');

    await new Promise((resolve, reject) => {
        throw new Error("STUB");
    });

    return server;
  }

  public lookupPackage(root: any, packageName: string) {
    /** Reference: https://github.com/kondi/rxjs-grpc */
    let pkg = root;
    for (const name of packageName.split(/\./)) {
      pkg = pkg[name];
    }
    return pkg;
  }

  public loadProto(): any {
    try {
      const packageDefinition = getGrpcPackageDefinition(
        this.options,
        grpcProtoLoaderPackage,
      );

      if (this.options.onLoadPackageDefinition) {
        this.options.onLoadPackageDefinition(
          packageDefinition,
          this.grpcClient,
        );
      }

      return grpcPackage.loadPackageDefinition(packageDefinition);
    } catch (err) {
      const invalidProtoError = new InvalidProtoDefinitionException(err.path);
      const message =
        err && err.message ? err.message : invalidProtoError.message;

      this.logger.error(message, invalidProtoError.stack);
      throw invalidProtoError;
    }
  }

  /**
   * Recursively fetch all of the service methods available on loaded
   * protobuf descriptor object, and collect those as an objects with
   * dot-syntax full-path names.
   *
   * Example:
   *  for proto package Bundle.FirstService with service Events { rpc...
   *  will be resolved to object of (while loaded for Bundle package):
   *    {
   *      name: "FirstService.Events",
   *      service: {Object}
   *    }
   */
  private collectDeepServices(
    name: string,
    grpcDefinition: any,
    accumulator: { name: string; service: any }[],
  ) {
    if (!isObject(grpcDefinition)) {
      return;
    }
    const keysToTraverse = Object.keys(grpcDefinition);
    // Traverse definitions or namespace extensions
    for (const key of keysToTraverse) {
      const nameExtended = this.parseDeepServiceName(name, key);
      const deepDefinition = grpcDefinition[key];

      const isServiceDefined =
        deepDefinition && !isUndefined(deepDefinition.service);
      const isServiceBoolean = isServiceDefined
        ? deepDefinition.service !== false
        : false;

      // grpc namespace object does not have 'format' or 'service' properties defined
      const isFormatDefined =
        deepDefinition && !isUndefined(deepDefinition.format);

      if (isServiceDefined && isServiceBoolean) {
        accumulator.push({
          name: nameExtended,
          service: deepDefinition,
        });
      } else if (isFormatDefined) {
        // Do nothing
      } else {
        // Continue recursion for namespace object until objects end or service definition found
        this.collectDeepServices(nameExtended, deepDefinition, accumulator);
      }
    }
  }

  private parseDeepServiceName(name: string, key: string): string {
    // If depth is zero then just return key
    if (name.length === 0) {
      return key;
    }
    // Otherwise add next through dot syntax
    return name + '.' + key;
  }

  private async createServices(grpcPkg: any, packageName: string) {
    if (!grpcPkg) {
      const invalidPackageError = new InvalidGrpcPackageException(packageName);
      this.logger.error(invalidPackageError);
      throw invalidPackageError;
    }

    // Take all of the services defined in grpcPkg and assign them to
    // method handlers defined in Controllers
    for (const definition of this.getServiceNames(grpcPkg)) {
      this.grpcClient.addService(
        // First parameter requires exact service definition from proto
        definition.service.service,
        // Here full proto definition required along with namespaced pattern name
        await this.createService(definition.service, definition.name),
      );
    }
  }

  private bufferUntilDrained<T>() {
    type DrainableSubject<T> = Subject<T> & { drainBuffer: () => void };

    const subject = new Subject<T>();
    let replayBuffer: ReplaySubject<T> | null = new ReplaySubject<T>();
    let hasDrained = false;

    function drainBuffer(this: DrainableSubject<T>) {
        throw new Error("STUB");
    }

    return {
      subject: new Proxy<DrainableSubject<T>>(subject as DrainableSubject<T>, {
        get(target, prop, receiver) {
          if (prop === 'asObservable') {
            return () => {
                throw new Error("STUB");
            };
          }
          if (hasDrained) {
            return Reflect.get(target, prop, receiver);
          }
          return Reflect.get(replayBuffer!, prop, receiver);
        },
      }),
      next: (value: T) => {
          throw new Error("STUB");
      },
      error: (err: any) => {
          throw new Error("STUB");
      },
      complete: () => {
          throw new Error("STUB");
      },
      cleanup: () => {
          throw new Error("STUB");
      },
    };
  }
}
