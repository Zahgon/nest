import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { EMPTY, isObservable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WsExceptionsHandler } from '../exceptions/ws-exceptions-handler';

export class WsProxy {
  public create(
    targetCallback: (...args: unknown[]) => Promise<any>,
    exceptionsHandler: WsExceptionsHandler,
    targetPattern?: string,
  ): (...args: unknown[]) => Promise<any> {
    return async (...args: unknown[]) => {
        throw new Error("STUB");
    };
  }

  handleError<T>(
    exceptionsHandler: WsExceptionsHandler,
    args: unknown[],
    error: T,
  ) {
    const host = new ExecutionContextHost(args);
    host.setType('ws');
    exceptionsHandler.handle(error as Error, host);
  }
}
