import { ExecutionContext } from '@nestjs/common';
import { Type } from '@nestjs/common/interfaces';
import {
  ContextType,
  HttpArgumentsHost,
  RpcArgumentsHost,
  WsArgumentsHost,
} from '@nestjs/common/interfaces/features/arguments-host.interface';

export class ExecutionContextHost implements ExecutionContext {
  private contextType = 'http';

  constructor(
    private readonly args: any[],
    private readonly constructorRef: Type<any> | null = null,
    private readonly handler: Function | null = null,
  ) {}

  setType<TContext extends string = ContextType>(type: TContext) {
    type && (this.contextType = type);
  }

  getType<TContext extends string = ContextType>(): TContext {
      throw new Error("STUB");
  }

  getClass<T = any>(): Type<T> {
    return this.constructorRef!;
  }

  getHandler(): Function {
    return this.handler!;
  }

  getArgs<T extends Array<any> = any[]>(): T {
    return this.args as T;
  }

  getArgByIndex<T = any>(index: number): T {
    return this.args[index] as T;
  }

  switchToRpc(): RpcArgumentsHost {
      throw new Error("STUB");
  }

  switchToHttp(): HttpArgumentsHost {
    return Object.assign(this, {
      getRequest: () => { throw new Error("STUB"); },
      getResponse: () => { throw new Error("STUB"); },
      getNext: () => { throw new Error("STUB"); },
    });
  }

  switchToWs(): WsArgumentsHost {
    return Object.assign(this, {
      getClient: () => { throw new Error("STUB"); },
      getData: () => { throw new Error("STUB"); },
      getPattern: () => { throw new Error("STUB"); },
    });
  }
}
