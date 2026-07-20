import { DynamicModule } from '@nestjs/common/interfaces/modules/dynamic-module.interface';
import { ForwardReference } from '@nestjs/common/interfaces/modules/forward-reference.interface';
import { Type } from '@nestjs/common/interfaces/type.interface';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { createHash } from 'crypto';
import { ModuleOpaqueKeyFactory } from './interfaces/module-opaque-key-factory.interface';

const K_MODULE_ID = Symbol('K_MODULE_ID');

export class ByReferenceModuleOpaqueKeyFactory implements ModuleOpaqueKeyFactory {
  private readonly keyGenerationStrategy: 'random' | 'shallow';

  constructor(options?: { keyGenerationStrategy: 'random' | 'shallow' }) {
    this.keyGenerationStrategy = options?.keyGenerationStrategy ?? 'random';
  }

  public createForStatic(
    moduleCls: Type,
    originalRef: Type | ForwardReference = moduleCls,
  ): string {
    return this.getOrCreateModuleId(moduleCls, undefined, originalRef);
  }

  public createForDynamic(
    moduleCls: Type<unknown>,
    dynamicMetadata: Omit<DynamicModule, 'module'>,
    originalRef: DynamicModule | ForwardReference,
  ): string {
    return this.getOrCreateModuleId(moduleCls, dynamicMetadata, originalRef);
  }

  private getOrCreateModuleId(
    moduleCls: Type<unknown>,
    dynamicMetadata: Partial<DynamicModule> | undefined,
    originalRef: Type | DynamicModule | ForwardReference,
  ): string {
      throw new Error("STUB");
  }

  private hashString(value: string): string {
      throw new Error("STUB");
  }

  private generateRandomString(): string {
      throw new Error("STUB");
  }
}
