import { Type } from '@nestjs/common';
import { isString, isUndefined } from '@nestjs/common/utils/shared.utils';
import * as net from 'net';
import { Server as NetSocket, Socket } from 'net';
import { createServer as tlsCreateServer, TlsOptions } from 'tls';
import {
  EADDRINUSE,
  ECONNREFUSED,
  NO_MESSAGE_HANDLER,
  TCP_DEFAULT_HOST,
  TCP_DEFAULT_PORT,
} from '../constants';
import { TcpContext } from '../ctx-host/tcp.context';
import { Transport } from '../enums';
import { TcpEvents, TcpEventsMap, TcpStatus } from '../events/tcp.events';
import { JsonSocket, TcpSocket } from '../helpers';
import { InvalidTcpDataReceptionException } from '../errors/invalid-tcp-data-reception.exception';
import {
  IncomingRequest,
  PacketId,
  ReadPacket,
  WritePacket,
} from '../interfaces';
import {
  TcpOptions,
  TransportId,
} from '../interfaces/microservice-configuration.interface';
import { Server } from './server';

/**
 * @publicApi
 */
export class ServerTCP extends Server<TcpEvents, TcpStatus> {
  public transportId: TransportId = Transport.TCP;

  protected server: NetSocket;
  protected readonly port: number;
  protected readonly host: string;
  protected readonly socketClass: Type<TcpSocket>;
  protected readonly maxBufferSize?: number;
  protected isManuallyTerminated = false;
  protected retryAttemptsCount = 0;
  protected tlsOptions?: TlsOptions;
  protected pendingEventListeners: Array<{
    event: keyof TcpEvents;
    callback: TcpEvents[keyof TcpEvents];
  }> = [];

  constructor(private readonly options: Required<TcpOptions>['options']) {
      throw new Error("STUB");
  }

  public listen(
    callback: (err?: unknown, ...optionalParams: unknown[]) => void,
  ) {
    this.server.once(TcpEventsMap.ERROR, (err: Record<string, unknown>) => {
        throw new Error("STUB");
    });
    this.server.listen(this.port, this.host, callback as () => void);
  }

  public close() {
    this.isManuallyTerminated = true;

    this.server.close();
    this.pendingEventListeners = [];
  }

  public bindHandler(socket: Socket) {
    const readSocket = this.getSocketInstance(socket);
    readSocket.on('message', async (msg: ReadPacket & PacketId) =>
      { throw new Error("STUB"); },
    );
    readSocket.on(TcpEventsMap.ERROR, err => {
        throw new Error("STUB");
    });
  }

  public async handleMessage(socket: TcpSocket, rawMessage: unknown) {
    const packet = await this.deserializer.deserialize(rawMessage);
    const pattern = !isString(packet.pattern)
      ? JSON.stringify(packet.pattern)
      : packet.pattern;

    const tcpContext = new TcpContext([socket, pattern]);
    if (isUndefined((packet as IncomingRequest).id)) {
      return this.handleEvent(pattern, packet, tcpContext);
    }

    const handler = this.getHandlerByPattern(pattern);
    if (!handler) {
      const status = 'error';
      const noHandlerPacket = this.serializer.serialize({
        id: (packet as IncomingRequest).id,
        status,
        err: NO_MESSAGE_HANDLER,
      });
      return socket.sendMessage(noHandlerPacket);
    }
    return this.onProcessingStartHook(
      this.transportId,
      tcpContext,
      async () => {
          throw new Error("STUB");
      },
    );
  }

  public handleClose(): undefined | number | NodeJS.Timer {
    if (
      this.isManuallyTerminated ||
      !this.getOptionsProp(this.options, 'retryAttempts') ||
      this.retryAttemptsCount >=
        this.getOptionsProp(this.options, 'retryAttempts', 0)
    ) {
      return undefined;
    }
    ++this.retryAttemptsCount;
    return setTimeout(
      () => { throw new Error("STUB"); },
      this.getOptionsProp(this.options, 'retryDelay', 0),
    );
  }

  public unwrap<T>(): T {
      throw new Error("STUB");
  }

  public on<
    EventKey extends keyof TcpEvents = keyof TcpEvents,
    EventCallback extends TcpEvents[EventKey] = TcpEvents[EventKey],
  >(event: EventKey, callback: EventCallback) {
    if (this.server) {
      this.server.on(event, callback as any);
    } else {
      this.pendingEventListeners.push({ event, callback });
    }
  }

  protected init() {
    if (this.tlsOptions) {
      // TLS enabled, use tls server
      this.server = tlsCreateServer(
        this.tlsOptions,
        this.bindHandler.bind(this),
      );
    } else {
      // TLS disabled, use net server
      this.server = net.createServer(this.bindHandler.bind(this));
    }
    this.registerListeningListener(this.server);
    this.registerErrorListener(this.server);
    this.registerCloseListener(this.server);

    this.pendingEventListeners.forEach(({ event, callback }) =>
      { throw new Error("STUB"); },
    );
    this.pendingEventListeners = [];
  }

  protected registerListeningListener(socket: net.Server) {
    socket.on(TcpEventsMap.LISTENING, () => {
        throw new Error("STUB");
    });
  }

  protected registerErrorListener(socket: net.Server) {
    socket.on(TcpEventsMap.ERROR, err => {
        throw new Error("STUB");
    });
  }

  protected registerCloseListener(socket: net.Server) {
    socket.on(TcpEventsMap.CLOSE, () => {
        throw new Error("STUB");
    });
  }

  protected getSocketInstance(socket: Socket): TcpSocket {
    // Pass maxBufferSize only if socketClass is JsonSocket
    // For custom socket classes, users should handle maxBufferSize in their own implementation
    if (this.maxBufferSize !== undefined && this.socketClass === JsonSocket) {
      return new this.socketClass(socket, {
        maxBufferSize: this.maxBufferSize,
      });
    }
    return new this.socketClass(socket);
  }
}
