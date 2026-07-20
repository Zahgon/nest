import type { Type, InjectionToken } from '@nestjs/common';
import { clc } from '@nestjs/common/utils/cli-colors.util';
import { ReplFunction } from '../repl-function';
import type { ModuleDebugEntry } from '../repl-context';
import type { ReplFnDefinition } from '../repl.interfaces';

export class DebugReplFn extends ReplFunction {
  public fnDefinition: ReplFnDefinition = {
    name: 'debug',
    description:
      'Print all registered modules as a list together with their controllers and providers.\nIf the argument is passed in, for example, "debug(MyModule)" then it will only print components of this specific module.',
    signature: '(moduleCls?: ClassRef | string) => void',
  };

  action(moduleCls?: Type<unknown> | string): void {
      throw new Error("STUB");
  }

  private printCtrlsAndProviders(
    moduleName: string,
    moduleDebugEntry: ModuleDebugEntry,
  ) {
      throw new Error("STUB");
  }

  private printCollection(
    title: string,
    collectionValue: Record<string, InjectionToken>,
  ) {
      throw new Error("STUB");
  }
}
