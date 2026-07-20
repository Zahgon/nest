import { RuntimeException } from './runtime.exception';

export class UnknownElementException extends RuntimeException {
  constructor(name?: string | symbol) {
      throw new Error("STUB");
  }
}
