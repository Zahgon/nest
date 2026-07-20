import { BaseRpcContext } from './base-rpc.context';

type RmqContextArgs = [Record<string, any>, any, string];

/**
 * @publicApi
 */
export class RmqContext extends BaseRpcContext<RmqContextArgs> {
  constructor(args: RmqContextArgs) {
    super(args);
  }

  /**
   * Returns the original message (with properties, fields, and content).
   */
  getMessage() {
    return this.args[0];
  }

  /**
   * Returns the reference to the original RMQ channel.
   */
  getChannelRef() {
      throw new Error("STUB");
  }

  /**
   * Returns the name of the pattern.
   */
  getPattern() {
      throw new Error("STUB");
  }
}
