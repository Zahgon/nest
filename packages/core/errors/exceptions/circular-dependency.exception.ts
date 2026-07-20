import { RuntimeException } from './runtime.exception';

export class CircularDependencyException extends RuntimeException {
  constructor(context?: string) {
      throw new Error("STUB");
  }
}
