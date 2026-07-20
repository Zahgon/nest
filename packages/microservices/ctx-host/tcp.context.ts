import { TcpSocket } from '../helpers';
import { BaseRpcContext } from './base-rpc.context';

type TcpContextArgs = [TcpSocket, string];

/**
 * @publicApi
 */
export class TcpContext extends BaseRpcContext<TcpContextArgs> {
  constructor(args: TcpContextArgs) {
    super(args);
  }

  /**
   * Returns the underlying JSON socket.
   */
  getSocketRef() {
      throw new Error("STUB");
  }

  /**
   * Returns the name of the pattern.
   */
  getPattern() {
      throw new Error("STUB");
  }
}
