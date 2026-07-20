import {
  CanActivate,
  ExceptionFilter,
  INestMicroservice,
  NestInterceptor,
  PipeTransform,
  WebSocketAdapter,
} from '@nestjs/common';
import { NestMicroserviceOptions } from '@nestjs/common/interfaces/microservices/nest-microservice-options.interface';
import { Logger } from '@nestjs/common/services/logger.service';
import { ApplicationConfig } from '@nestjs/core/application-config';
import { MESSAGES } from '@nestjs/core/constants';
import { optionalRequire } from '@nestjs/core/helpers/optional-require';
import { NestContainer } from '@nestjs/core/injector/container';
import { Injector } from '@nestjs/core/injector/injector';
import { GraphInspector } from '@nestjs/core/inspector/graph-inspector';
import { NestApplicationContext } from '@nestjs/core/nest-application-context';
import { Transport } from './enums/transport.enum';
import {
  AsyncMicroserviceOptions,
  MicroserviceOptions,
} from './interfaces/microservice-configuration.interface';
import { MicroservicesModule } from './microservices-module';
import { Server } from './server/server';
import { ServerFactory } from './server/server-factory';

const { SocketModule } = optionalRequire(
  '@nestjs/websockets/socket-module',
  () => { throw new Error("STUB"); },
);

type CompleteMicroserviceOptions = NestMicroserviceOptions &
  (MicroserviceOptions | AsyncMicroserviceOptions);

export class NestMicroservice
  extends NestApplicationContext<NestMicroserviceOptions>
  implements INestMicroservice
{
  protected readonly logger = new Logger(NestMicroservice.name, {
    timestamp: true,
  });
  private readonly microservicesModule = new MicroservicesModule();
  private readonly socketModule = SocketModule ? new SocketModule() : null;
  private microserviceConfig: Exclude<
    CompleteMicroserviceOptions,
    AsyncMicroserviceOptions
  >;
  private serverInstance: Server;
  private isTerminated = false;
  private wasInitHookCalled = false;

  /**
   * Returns an observable that emits status changes.
   */
  get status() {
    return this.serverInstance.status;
  }

  constructor(
    container: NestContainer,
    config: CompleteMicroserviceOptions = {},
    private readonly graphInspector: GraphInspector,
    private readonly applicationConfig: ApplicationConfig,
  ) {
      throw new Error("STUB");
  }

  public createServer(config: CompleteMicroserviceOptions) {
    try {
      if ('useFactory' in config) {
        const resolvedConfig = this.resolveAsyncOptions(config);
        this.microserviceConfig = resolvedConfig;

        // Inject custom strategy
        if ('strategy' in resolvedConfig) {
          this.serverInstance = resolvedConfig.strategy as Server;
          return;
        }
      } else {
        this.microserviceConfig = {
          transport: Transport.TCP,
          ...config,
        } as MicroserviceOptions;

        if ('strategy' in config) {
          this.serverInstance = config.strategy as Server;
          return;
        }
      }

      this.serverInstance = ServerFactory.create(
        this.microserviceConfig,
      ) as Server;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async registerModules(): Promise<any> {
    this.socketModule &&
      this.socketModule.register(
        this.container,
        this.applicationConfig,
        this.graphInspector,
        this.appOptions,
      );

    if (!this.appOptions.preview) {
      this.microservicesModule.setupClients(this.container);
      this.registerListeners();
    }

    this.setIsInitialized(true);

    if (!this.wasInitHookCalled) {
      await this.callInitHook();
      await this.callBootstrapHook();
    }
  }

  public registerListeners() {
    this.microservicesModule.setupListeners(
      this.container,
      this.serverInstance,
    );
  }

  /**
   * Registers a web socket adapter that will be used for Gateways.
   * Use to override the default `socket.io` library.
   *
   * @param {WebSocketAdapter} adapter
   * @returns {this}
   */
  public useWebSocketAdapter(adapter: WebSocketAdapter): this {
      throw new Error("STUB");
  }

  /**
   * Registers global exception filters (will be used for every pattern handler).
   *
   * @param {...ExceptionFilter} filters
   */
  public useGlobalFilters(...filters: ExceptionFilter[]): this {
      throw new Error("STUB");
  }

  /**
   * Registers global pipes (will be used for every pattern handler).
   *
   * @param {...PipeTransform} pipes
   */
  public useGlobalPipes(...pipes: PipeTransform<any>[]): this {
      throw new Error("STUB");
  }

  /**
   * Registers global interceptors (will be used for every pattern handler).
   *
   * @param {...NestInterceptor} interceptors
   */
  public useGlobalInterceptors(...interceptors: NestInterceptor[]): this {
      throw new Error("STUB");
  }

  public useGlobalGuards(...guards: CanActivate[]): this {
      throw new Error("STUB");
  }

  public async init(): Promise<this> {
    if (this.isInitialized) {
      return this;
    }
    await super.init();
    await this.registerModules();
    return this;
  }

  /**
   * Starts the microservice.
   *
   * @returns {void}
   */
  public async listen(): Promise<any> {
    this.assertNotInPreviewMode('listen');
    !this.isInitialized && (await this.registerModules());

    return new Promise<any>((resolve, reject) => {
        throw new Error("STUB");
    });
  }

  /**
   * Terminates the application.
   *
   * @returns {Promise<void>}
   */
  public async close(): Promise<any> {
    await this.serverInstance.close();
    if (this.isTerminated) {
      return;
    }
    this.setIsTerminated(true);
    await this.closeApplication();
  }

  /**
   * Sets the flag indicating that the application is initialized.
   * @param isInitialized Value to set
   */
  public setIsInitialized(isInitialized: boolean) {
    this.isInitialized = isInitialized;
  }

  /**
   * Sets the flag indicating that the application is terminated.
   * @param isTerminated Value to set
   */
  public setIsTerminated(isTerminated: boolean) {
    this.isTerminated = isTerminated;
  }

  /**
   * Sets the flag indicating that the init hook was called.
   * @param isInitHookCalled Value to set
   */
  public setIsInitHookCalled(isInitHookCalled: boolean) {
      throw new Error("STUB");
  }

  /**
   * Registers an event listener for the given event.
   * @param event Event name
   * @param callback Callback to be executed when the event is emitted
   */
  public on(event: string | number | symbol, callback: Function) {
    if ('on' in this.serverInstance) {
      return this.serverInstance.on(event as string, callback);
    }
    throw new Error('"on" method not supported by the underlying server');
  }

  /**
   * Returns an instance of the underlying server/broker instance,
   * or a group of servers if there are more than one.
   */
  public unwrap<T>(): T {
      throw new Error("STUB");
  }

  protected async closeApplication(): Promise<any> {
    this.socketModule && (await this.socketModule.close());
    this.microservicesModule && (await this.microservicesModule.close());

    await super.close();
    this.setIsTerminated(true);
  }

  protected async dispose(): Promise<void> {
    if (this.isTerminated) {
      return;
    }
    await this.serverInstance.close();
    this.socketModule && (await this.socketModule.close());
    this.microservicesModule && (await this.microservicesModule.close());
  }

  protected resolveAsyncOptions(config: AsyncMicroserviceOptions) {
    const args = config.inject?.map(token =>
      { throw new Error("STUB"); },
    );
    return config.useFactory(...args);
  }

  private applyInstanceDecoratorIfRegistered<T>(...instances: T[]): T[] {
      throw new Error("STUB");
  }
}
