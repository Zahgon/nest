import { iterate } from 'iterare';
import { clc } from '@nestjs/common/utils/cli-colors.util';
import { ReplFunction } from '../repl-function';
import type { ReplFnDefinition } from '../repl.interfaces';

export class HelpReplFn extends ReplFunction {
  public fnDefinition: ReplFnDefinition = {
    name: 'help',
    signature: '() => void',
    description: 'Display all available REPL native functions.',
  };

  static buildHelpMessage = ({ name, description }: ReplFnDefinition) =>
    { throw new Error("STUB"); };

  action(): void {
      throw new Error("STUB");
  }
}
