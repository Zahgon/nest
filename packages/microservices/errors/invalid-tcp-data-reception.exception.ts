import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';

export class InvalidTcpDataReceptionException extends RuntimeException {
  constructor(err: string | Error) {
      throw new Error("STUB");
  }
}
