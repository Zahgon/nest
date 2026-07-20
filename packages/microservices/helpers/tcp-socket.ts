import { Buffer } from 'buffer';
import { Socket } from 'net';
import { InvalidJSONFormatException } from '../errors/invalid-json-format.exception';
import { NetSocketClosedException } from '../errors/net-socket-closed.exception';
import { TcpEventsMap } from '../events/tcp.events';

export abstract class TcpSocket {
  private isClosed = false;

  public get netSocket() {
      throw new Error("STUB");
  }

  constructor(public readonly socket: Socket) {
      throw new Error("STUB");
  }

  public connect(port: number, host: string) {
    this.socket.connect(port, host);
    return this;
  }

  public on(event: string, callback: (err?: any) => void) {
    this.socket.on(event, callback);
    return this;
  }

  public once(event: string, callback: (err?: any) => void) {
    this.socket.once(event, callback);
    return this;
  }

  public end() {
    this.socket.end();
    return this;
  }

  public sendMessage(message: any, callback?: (err?: any) => void) {
    if (this.isClosed) {
      callback && callback(new NetSocketClosedException());
      return;
    }
    this.handleSend(message, callback);
  }

  protected abstract handleSend(
    message: any,
    callback?: (err?: any) => void,
  ): any;

  private onData(data: Buffer) {
      throw new Error("STUB");
  }

  protected abstract handleData(data: Buffer | string): any;

  protected emitMessage(data: string) {
    let message: Record<string, unknown>;
    try {
      message = JSON.parse(data);
    } catch (e) {
      throw new InvalidJSONFormatException(e, data);
    }
    message = message || {};
    this.socket.emit('message', message);
  }
}
