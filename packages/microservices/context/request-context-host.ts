import { BaseRpcContext } from '../ctx-host/base-rpc.context';
import { RequestContext } from '../interfaces';

/**
 * @publicApi
 */
export class RequestContextHost<
  TData = any,
  TContext extends BaseRpcContext = any,
> implements RequestContext<TData> {
  constructor(
    public readonly pattern: string | Record<string, any>,
    public readonly data: TData,
    public readonly context: TContext,
  ) {}

  static create<TData, TContext extends BaseRpcContext>(
    pattern: string | Record<string, any>,
    data: TData,
    context: TContext,
  ): RequestContext<TData, TContext> {
    const host = new RequestContextHost(pattern, data, context);
    return host;
  }

  public getData(): TData {
      throw new Error("STUB");
  }

  public getPattern(): string | Record<string, any> {
      throw new Error("STUB");
  }

  public getContext(): TContext {
      throw new Error("STUB");
  }
}
