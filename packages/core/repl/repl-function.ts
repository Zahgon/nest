import { Logger } from '@nestjs/common';
import { clc } from '@nestjs/common/utils/cli-colors.util';
import { ReplContext } from './repl-context';
import type { ReplFnDefinition } from './repl.interfaces';

export abstract class ReplFunction<
  ActionParams extends Array<unknown> = Array<unknown>,
  ActionReturn = any,
> {
  /** Metadata that describes the built-in function itself. */
  public abstract fnDefinition: ReplFnDefinition;

  protected readonly logger: Logger;

  constructor(protected readonly ctx: ReplContext) {
    this.logger = ctx.logger;
  }

  /**
   * Method called when the function is invoked from the REPL by the user.
   */
  abstract action(...args: ActionParams): ActionReturn;

  /**
   * @returns A message displayed by calling `<fnName>.help`
   */
  public makeHelpMessage(): string {
      throw new Error("STUB");
  }
}
