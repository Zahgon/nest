import {
  BadRequestException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import {
  HOST_METADATA,
  MODULE_PATH,
  VERSION_METADATA,
} from '@nestjs/common/constants';
import {
  Controller,
  HttpServer,
  Type,
  VersionValue,
} from '@nestjs/common/interfaces';
import { Logger } from '@nestjs/common/services/logger.service';
import { ApplicationConfig } from '../application-config';
import {
  CONTROLLER_MAPPING_MESSAGE,
  VERSIONED_CONTROLLER_MAPPING_MESSAGE,
} from '../helpers/messages';
import { NestContainer } from '../injector/container';
import { Injector } from '../injector/injector';
import { InstanceWrapper } from '../injector/instance-wrapper';
import { GraphInspector } from '../inspector/graph-inspector';
import { MetadataScanner } from '../metadata-scanner';
import { Resolver } from './interfaces/resolver.interface';
import { RoutePathMetadata } from './interfaces/route-path-metadata.interface';
import { RoutePathFactory } from './route-path-factory';
import { RouterExceptionFilters } from './router-exception-filters';
import { RouterExplorer } from './router-explorer';
import { RouterProxy } from './router-proxy';

export class RoutesResolver implements Resolver {
  private readonly logger = new Logger(RoutesResolver.name, {
    timestamp: true,
  });
  private readonly routerProxy = new RouterProxy();
  private readonly routePathFactory: RoutePathFactory;
  private readonly routerExceptionsFilter: RouterExceptionFilters;
  private readonly routerExplorer: RouterExplorer;

  constructor(
    private readonly container: NestContainer,
    private readonly applicationConfig: ApplicationConfig,
    private readonly injector: Injector,
    graphInspector: GraphInspector,
  ) {
      throw new Error("STUB");
  }

  public resolve<T extends HttpServer>(
    applicationRef: T,
    globalPrefix: string,
  ) {
    const modules = this.container.getModules();
    modules.forEach(({ controllers, metatype }, moduleName) => {
        throw new Error("STUB");
    });
  }

  public registerRouters(
    routes: Map<string | symbol | Function, InstanceWrapper<Controller>>,
    moduleName: string,
    globalPrefix: string,
    modulePath: string,
    applicationRef: HttpServer,
  ) {
    routes.forEach(instanceWrapper => {
        throw new Error("STUB");
    });
  }

  public registerNotFoundHandler() {
    const applicationRef = this.container.getHttpAdapterRef();
    const callback = <TRequest, TResponse>(req: TRequest, res: TResponse) => {
      const method = applicationRef.getRequestMethod(req);
      const url = applicationRef.getRequestUrl(req);
      throw new NotFoundException(`Cannot ${method} ${url}`);
    };
    const handler = this.routerExceptionsFilter.create({}, callback, undefined);
    const proxy = this.routerProxy.createProxy(callback, handler);
    applicationRef.setNotFoundHandler &&
      applicationRef.setNotFoundHandler(
        proxy,
        this.applicationConfig.getGlobalPrefix(),
      );
  }

  public registerExceptionHandler() {
    const callback = <TError, TRequest, TResponse>(
      err: TError,
      req: TRequest,
      res: TResponse,
      next: Function,
    ) => {
      throw this.mapExternalException(err);
    };
    const handler = this.routerExceptionsFilter.create(
      {},
      callback as any,
      undefined,
    );
    const proxy = this.routerProxy.createExceptionLayerProxy(callback, handler);
    const applicationRef = this.container.getHttpAdapterRef();
    applicationRef.setErrorHandler &&
      applicationRef.setErrorHandler(
        proxy,
        this.applicationConfig.getGlobalPrefix(),
      );
  }

  public mapExternalException(err: any) {
    switch (true) {
      // SyntaxError is thrown by Express body-parser when given invalid JSON (#422, #430)
      // URIError is thrown by Express when given a path parameter with an invalid percentage
      // encoding, e.g. '%FF' (#8915)
      case err instanceof SyntaxError || err instanceof URIError:
        return new BadRequestException(err.message);
      case this.isHttpFastifyError(err):
        return new HttpException(err.message, err.statusCode);
      default:
        return err;
    }
  }

  private isHttpFastifyError(
    error: any,
  ): error is Error & { statusCode: number } {
    // condition based on this code - https://github.com/fastify/fastify-error/blob/d669b150a82968322f9f7be992b2f6b463272de3/index.js#L22
    return (
      error.statusCode !== undefined &&
      error instanceof Error &&
      error.name === 'FastifyError'
    );
  }

  private getModulePathMetadata(metatype: Type<unknown>): string | undefined {
    const modulesContainer = this.container.getModules();
    const modulePath = Reflect.getMetadata(
      MODULE_PATH + modulesContainer.applicationId,
      metatype,
    );
    return modulePath ?? Reflect.getMetadata(MODULE_PATH, metatype);
  }

  private getHostMetadata(
    metatype: Type<unknown> | Function,
  ): string | string[] | undefined {
    return Reflect.getMetadata(HOST_METADATA, metatype);
  }

  private getVersionMetadata(
    metatype: Type<unknown> | Function,
  ): VersionValue | undefined {
    const versioningConfig = this.applicationConfig.getVersioning();
    if (versioningConfig) {
      return (
        Reflect.getMetadata(VERSION_METADATA, metatype) ??
        versioningConfig.defaultVersion
      );
    }
  }
}
