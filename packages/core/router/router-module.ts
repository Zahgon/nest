import { DynamicModule, Inject, Module, Type } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import { normalizePath } from '@nestjs/common/utils/shared.utils';
import { Module as ModuleClass } from '../injector/module';
import { ModulesContainer } from '../injector/modules-container';
import { Routes, RouteTree } from './interfaces';
import { flattenRoutePaths } from './utils';

export const ROUTES = Symbol('ROUTES');

export const targetModulesByContainer = new WeakMap<
  ModulesContainer,
  WeakSet<ModuleClass>
>();

/**
 * @publicApi
 */
@Module({})
export class RouterModule {
  constructor(
    private readonly modulesContainer: ModulesContainer,
    @Inject(ROUTES) private readonly routes: Routes,
  ) {
      throw new Error("STUB");
  }

  static register(routes: Routes): DynamicModule {
    return {
      module: RouterModule,
      providers: [
        {
          provide: ROUTES,
          useValue: routes,
        },
      ],
    };
  }

  private deepCloneRoutes(
    routes: (RouteTree | Type<any>)[],
  ): (RouteTree | Type<any>)[] {
      throw new Error("STUB");
  }

  private initialize() {
    const flattenedRoutes = flattenRoutePaths(this.routes);
    flattenedRoutes.forEach(route => {
        throw new Error("STUB");
    });
  }

  private registerModulePathMetadata(
    moduleCtor: Type<unknown>,
    modulePath: string,
  ) {
    Reflect.defineMetadata(
      MODULE_PATH + this.modulesContainer.applicationId,
      modulePath,
      moduleCtor,
    );
  }

  private updateTargetModulesCache(moduleCtor: Type<unknown>) {
    let moduleClassSet: WeakSet<ModuleClass>;
    if (targetModulesByContainer.has(this.modulesContainer)) {
      moduleClassSet = targetModulesByContainer.get(this.modulesContainer)!;
    } else {
      moduleClassSet = new WeakSet<ModuleClass>();
      targetModulesByContainer.set(this.modulesContainer, moduleClassSet);
    }
    const moduleRef = Array.from(this.modulesContainer.values()).find(
      item => { throw new Error("STUB"); },
    );
    if (!moduleRef) {
      return;
    }
    moduleClassSet.add(moduleRef);
  }
}
