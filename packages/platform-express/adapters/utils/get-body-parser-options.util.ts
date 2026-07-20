import type { RawBodyRequest } from '@nestjs/common';
import type { IncomingMessage, ServerResponse } from 'http';
import type { NestExpressBodyParserOptions } from '../../interfaces';

const rawBodyParser = (
  req: RawBodyRequest<IncomingMessage>,
  _res: ServerResponse,
  buffer: Buffer,
) => {
    throw new Error("STUB");
};

export function getBodyParserOptions<Options = NestExpressBodyParserOptions>(
  rawBody: boolean,
  options?: Omit<Options, 'verify'>,
): Options {
  let parserOptions: Options = (options || {}) as Options;

  if (rawBody === true) {
    parserOptions = {
      ...parserOptions,
      verify: rawBodyParser,
    };
  }

  return parserOptions;
}
