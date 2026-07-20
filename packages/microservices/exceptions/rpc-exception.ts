import { isObject, isString } from '@nestjs/common/utils/shared.utils';

/**
 * @publicApi
 */
export class RpcException extends Error {
  constructor(private readonly error: string | object) {
      throw new Error("STUB");
  }

  public initMessage() {
      throw new Error("STUB");
  }

  public getError(): string | object {
    return this.error;
  }
}
