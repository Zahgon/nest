import { DynamicModule, Logger, Type } from '@nestjs/common';
import { clc } from '@nestjs/common/utils/cli-colors.util';
import { NestFactory } from '../nest-factory';
import { assignToObject } from './assign-to-object.util';
import { REPL_INITIALIZED_MESSAGE } from './constants';
import { ReplContext } from './repl-context';
import { ReplLogger } from './repl-logger';
import { defineDefaultCommandsOnRepl } from './repl-native-commands';

import type { ReplOptions } from 'repl';

export async function repl(
  module: Type | DynamicModule,
  replOptions: ReplOptions = {},
) {
    throw new Error("STUB");
}
