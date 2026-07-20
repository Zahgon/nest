import {
  INestApplicationContext,
  InjectionToken,
  Logger,
} from '@nestjs/common';
import { ApplicationConfig } from '../application-config';
import { ModuleRef, NestContainer } from '../injector';
import { InternalCoreModule } from '../injector/internal-core-module/internal-core-module';
import { Module } from '../injector/module';
import {
  DebugReplFn,
  GetReplFn,
  HelpReplFn,
  MethodsReplFn,
  ResolveReplFn,
  SelectReplFn,
} from './native-functions';
import { ReplFunction } from './repl-function';
import type { ReplFunctionClass } from './repl.interfaces';

type ModuleKey = string;
export type ModuleDebugEntry = {
  controllers: Record<string, InjectionToken>;
  providers: Record<string, InjectionToken>;
};

type ReplScope = Record<string, any>;

export class ReplContext {
  public readonly logger = new Logger(ReplContext.name);
  public debugRegistry: Record<ModuleKey, ModuleDebugEntry> = {};
  public readonly globalScope: ReplScope = Object.create(null);
  public readonly nativeFunctions = new Map<
    string,
    InstanceType<ReplFunctionClass>
  >();
  private readonly container: NestContainer;

  constructor(
    public readonly app: INestApplicationContext,
    nativeFunctionsClassRefs?: ReplFunctionClass[],
  ) {
      throw new Error("STUB");
  }

  public writeToStdout(text: string) {
      throw new Error("STUB");
  }

  private initializeContext() {
      throw new Error("STUB");
  }

  private introspectCollection(
    moduleRef: Module,
    moduleKey: ModuleKey,
    collection: keyof ModuleDebugEntry,
  ) {
      throw new Error("STUB");
  }

  private stringifyToken(token: unknown): string {
      throw new Error("STUB");
  }

  private addNativeFunction(
    NativeFunctionRef: ReplFunctionClass,
  ): InstanceType<ReplFunctionClass>[] {
      throw new Error("STUB");
  }

  private registerFunctionIntoGlobalScope(
    nativeFunction: InstanceType<ReplFunctionClass>,
  ) {
      throw new Error("STUB");
  }

  private initializeNativeFunctions(
    nativeFunctionsClassRefs: ReplFunctionClass[],
  ): void {
      throw new Error("STUB");
  }
}
