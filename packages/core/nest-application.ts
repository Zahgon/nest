import {
  CanActivate,
  ExceptionFilter,
  HttpServer,
  INestApplication,
  INestMicroservice,
  NestHybridApplicationOptions,
  NestInterceptor,
  PipeTransform,
  VersioningOptions,
  VersioningType,
  WebSocketAdapter,
} from '@nestjs/common';
import {
  GlobalPrefixOptions,
  NestApplicationOptions,
} from '@nestjs/common/interfaces';
import { Logger } from '@nestjs/common/services/logger.service';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import {
  addLeadingSlash,
  isFunction,
  isObject,
  isString,
} from '@nestjs/common/utils/shared.utils';
import { iterate } from 'iterare';
import { platform } from 'os';
import { AbstractHttpAdapter } from './adapters';
import { ApplicationConfig } from './application-config';
import { MESSAGES } from './constants';
import { optionalRequire } from './helpers/optional-require';
import { NestContainer } from './injector/container';
import { Injector } from './injector/injector';
import { GraphInspector } from './inspector/graph-inspector';
import { MiddlewareContainer } from './middleware/container';
import { MiddlewareModule } from './middleware/middleware-module';
import { mapToExcludeRoute } from './middleware/utils';
import { NestApplicationContext } from './nest-application-context';
import { Resolver } from './router/interfaces/resolver.interface';
import { RoutesResolver } from './router/routes-resolver';

const { SocketModule } = optionalRequire(
  '@nestjs/websockets/socket-module',
  () => { throw new Error("STUB"); },
);
const { MicroservicesModule } = optionalRequire(
  '@nestjs/microservices/microservices-module',
  () => { throw new Error("STUB"); },
);

/**
 * @publicApi
 */
export class NestApplication
  extends NestApplicationContext<NestApplicationOptions>
  implements INestApplication
{
  protected readonly logger = new Logger(NestApplication.name, {
    timestamp: true,
  });
  private readonly middlewareModule: MiddlewareModule;
  private readonly middlewareContainer = new MiddlewareContainer(
    this.container,
  );
  private readonly microservicesModule =
    MicroservicesModule && new MicroservicesModule();
  private readonly socketModule = SocketModule && new SocketModule();
  private readonly routesResolver: Resolver;
  private readonly microservices: any[] = [];
  private httpServer: any;
  private isListening = false;
  private isWsModuleRegistered = false;

  constructor(
    container: NestContainer,
    private readonly httpAdapter: HttpServer,
    private readonly config: ApplicationConfig,
    private readonly graphInspector: GraphInspector,
    appOptions: NestApplicationOptions = {},
  ) {
      throw new Error("STUB");
  }

  protected async dispose(): Promise<void> {
    this.socketModule && (await this.socketModule.close());
    this.microservicesModule && (await this.microservicesModule.close());
    this.httpAdapter && (await this.httpAdapter.close());

    await Promise.all(
      iterate(this.microservices).map(async microservice => {
          throw new Error("STUB");
      }),
    );
  }

  public getHttpAdapter(): AbstractHttpAdapter {
    return this.httpAdapter as AbstractHttpAdapter;
  }

  public registerHttpServer() {
      throw new Error("STUB");
  }

  public getUnderlyingHttpServer<T>(): T {
      throw new Error("STUB");
  }

  public applyOptions() {
    if (!this.appOptions || !this.appOptions.cors) {
      return undefined;
    }
    const passCustomOptions =
      isObject(this.appOptions.cors) || isFunction(this.appOptions.cors);
    if (!passCustomOptions) {
      return this.enableCors();
    }
    return this.enableCors(this.appOptions.cors);
  }

  public createServer<T = any>(): T {
    this.httpAdapter.initHttpServer(this.appOptions);
    return this.httpAdapter.getHttpServer() as T;
  }

  public async registerModules() {
    this.registerWsModule();

    if (this.microservicesModule) {
      this.microservicesModule.register(
        this.container,
        this.graphInspector,
        this.config,
        this.appOptions,
      );
      this.microservicesModule.setupClients(this.container);
    }

    await this.middlewareModule.register(
      this.middlewareContainer,
      this.container,
      this.config,
      this.injector,
      this.httpAdapter,
      this.graphInspector,
      this.appOptions,
    );
  }

  public registerWsModule() {
    if (!this.socketModule) {
      return;
    }
    this.socketModule.register(
      this.container,
      this.config,
      this.graphInspector,
      this.appOptions,
      this.httpServer,
    );
    this.isWsModuleRegistered = true;
  }

  public async init(): Promise<this> {
    if (this.isInitialized) {
      return this;
    }

    this.applyOptions();
    await this.httpAdapter?.init?.();

    const useBodyParser =
      this.appOptions && this.appOptions.bodyParser !== false;
    useBodyParser && this.registerParserMiddleware();

    await this.registerModules();
    await this.registerRouter();
    await this.callInitHook();
    await this.registerRouterHooks();
    await this.callBootstrapHook();

    this.isInitialized = true;
    this.logger.log(MESSAGES.APPLICATION_READY);
    return this;
  }

  public registerParserMiddleware() {
    const prefix = this.config.getGlobalPrefix();
    const rawBody = !!this.appOptions?.rawBody;
    this.httpAdapter.registerParserMiddleware(prefix, rawBody);
  }

  public async registerRouter() {
    await this.registerMiddleware(this.httpAdapter);

    const prefix = this.config.getGlobalPrefix();
    const basePath = addLeadingSlash(prefix);
    this.routesResolver.resolve(this.httpAdapter, basePath);
  }

  public async registerRouterHooks() {
    this.routesResolver.registerNotFoundHandler();
    this.routesResolver.registerExceptionHandler();
  }

  public connectMicroservice<T extends object>(
    microserviceOptions: T,
    hybridAppOptions: NestHybridApplicationOptions = {},
  ): INestMicroservice {
      throw new Error("STUB");
  }

  public getMicroservices(): INestMicroservice[] {
      throw new Error("STUB");
  }

  public getHttpServer() {
    return this.httpServer;
  }

  public async startAllMicroservices(): Promise<this> {
      throw new Error("STUB");
  }

  public use(...args: [any, any?]): this {
    this.httpAdapter.use(...args);
    return this;
  }

  public useBodyParser(...args: [any, any?]): this {
    if (!('useBodyParser' in this.httpAdapter)) {
      this.logger.warn('Your HTTP Adapter does not support `.useBodyParser`.');
      return this;
    }

    const [parserType, ...otherArgs] = args;
    const rawBody = !!this.appOptions.rawBody;

    this.httpAdapter.useBodyParser?.(...[parserType, rawBody, ...otherArgs]);

    return this;
  }

  public enableCors(options?: any): void {
    this.httpAdapter.enableCors(options);
  }

  public enableVersioning(
    options: VersioningOptions = { type: VersioningType.URI },
  ): this {
      throw new Error("STUB");
  }

  public async listen(port: number | string): Promise<any>;
  public async listen(port: number | string, hostname: string): Promise<any>;
  public async listen(port: number | string, ...args: any[]): Promise<any> {
    this.assertNotInPreviewMode('listen');

    if (!this.isInitialized) {
      await this.init();
    }

    const httpAdapterHost = this.container.getHttpAdapterHostRef();
    return new Promise((resolve, reject) => {
        throw new Error("STUB");
    });
  }

  public async getUrl(): Promise<string> {
      throw new Error("STUB");
  }

  private formatAddress(address: any): string {
      throw new Error("STUB");
  }

  public setGlobalPrefix(prefix: string, options?: GlobalPrefixOptions): this {
      throw new Error("STUB");
  }

  public useWebSocketAdapter(adapter: WebSocketAdapter): this {
      throw new Error("STUB");
  }

  public useGlobalFilters(...filters: ExceptionFilter[]): this {
      throw new Error("STUB");
  }

  public useGlobalPipes(...pipes: PipeTransform<any>[]): this {
      throw new Error("STUB");
  }

  public useGlobalInterceptors(...interceptors: NestInterceptor[]): this {
      throw new Error("STUB");
  }

  public useGlobalGuards(...guards: CanActivate[]): this {
      throw new Error("STUB");
  }

  public useStaticAssets(options: any): this;
  public useStaticAssets(path: string, options?: any): this;
  public useStaticAssets(pathOrOptions: any, options?: any): this {
      throw new Error("STUB");
  }

  public setBaseViewsDir(path: string | string[]): this {
      throw new Error("STUB");
  }

  public setViewEngine(engineOrOptions: any): this {
      throw new Error("STUB");
  }

  private host(): string | undefined {
      throw new Error("STUB");
  }

  private getProtocol(): 'http' | 'https' {
      throw new Error("STUB");
  }

  private async registerMiddleware(instance: any) {
    await this.middlewareModule.registerMiddleware(
      this.middlewareContainer,
      instance,
    );
  }

  private applyInstanceDecoratorIfRegistered<T>(...instances: T[]): T[] {
      throw new Error("STUB");
  }
}
