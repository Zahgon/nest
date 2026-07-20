import { Logger } from '@nestjs/common';
import { ExternalContextCreator } from '../../helpers/external-context-creator';
import { HttpAdapterHost } from '../../helpers/http-adapter-host';
import { GraphInspector } from '../../inspector/graph-inspector';
import { InitializeOnPreviewAllowlist } from '../../inspector/initialize-on-preview.allowlist';
import { SerializedGraph } from '../../inspector/serialized-graph';
import { ModuleOverride } from '../../interfaces/module-override.interface';
import { DependenciesScanner } from '../../scanner';
import { ModuleCompiler } from '../compiler';
import { NestContainer } from '../container';
import { Injector } from '../injector';
import { InstanceLoader } from '../instance-loader';
import { LazyModuleLoader } from '../lazy-module-loader/lazy-module-loader';
import { ModulesContainer } from '../modules-container';
import { InternalCoreModule } from './internal-core-module';

export class InternalCoreModuleFactory {
  static create(
    container: NestContainer,
    scanner: DependenciesScanner,
    moduleCompiler: ModuleCompiler,
    httpAdapterHost: HttpAdapterHost,
    graphInspector: GraphInspector,
    moduleOverrides?: ModuleOverride[],
  ) {
    const lazyModuleLoaderFactory = () => {
        throw new Error("STUB");
    };

    InitializeOnPreviewAllowlist.add(InternalCoreModule);

    return InternalCoreModule.register([
      {
        provide: ExternalContextCreator,
        useFactory: () => { throw new Error("STUB"); },
      },
      {
        provide: ModulesContainer,
        useFactory: () => { throw new Error("STUB"); },
      },
      {
        provide: HttpAdapterHost,
        useFactory: () => { throw new Error("STUB"); },
      },
      {
        provide: LazyModuleLoader,
        useFactory: lazyModuleLoaderFactory,
      },
      {
        provide: SerializedGraph,
        useFactory: () => { throw new Error("STUB"); },
      },
    ]);
  }
}
