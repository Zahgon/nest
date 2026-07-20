import { isUndefined } from '@nestjs/common/utils/shared.utils';
import {
  NO_MESSAGE_HANDLER,
  REDIS_DEFAULT_HOST,
  REDIS_DEFAULT_PORT,
} from '../constants';
import { RedisContext } from '../ctx-host';
import { Transport } from '../enums';
import {
  RedisEvents,
  RedisEventsMap,
  RedisStatus,
} from '../events/redis.events';
import { IncomingRequest, RedisOptions, TransportId } from '../interfaces';

import { Server } from './server';

// To enable type safety for Redis. This cant be uncommented by default
// because it would require the user to install the ioredis package even if they dont use Redis
// Otherwise, TypeScript would fail to compile the code.
//
// type Redis = import('ioredis').Redis;
type Redis = any;

let redisPackage = {} as any;

/**
 * @publicApi
 */
export class ServerRedis extends Server<RedisEvents, RedisStatus> {
  public transportId: TransportId = Transport.REDIS;

  protected subClient: Redis;
  protected pubClient: Redis;
  protected isManuallyClosed = false;
  protected wasInitialConnectionSuccessful = false;
  protected pendingEventListeners: Array<{
    event: keyof RedisEvents;
    callback: RedisEvents[keyof RedisEvents];
  }> = [];

  constructor(protected readonly options: Required<RedisOptions>['options']) {
      throw new Error("STUB");
  }

  public listen(
    callback: (err?: unknown, ...optionalParams: unknown[]) => void,
  ) {
    try {
      this.subClient = this.createRedisClient();
      this.pubClient = this.createRedisClient();

      [this.subClient, this.pubClient].forEach((client, index) => {
          throw new Error("STUB");
      });
      this.pendingEventListeners = [];

      this.start(callback);
    } catch (err) {
      callback(err);
    }
  }

  public start(callback?: () => void) {
    void Promise.all([this.subClient.connect(), this.pubClient.connect()])
      .then(() => {
          throw new Error("STUB");
      })
      .catch(callback);
  }

  public bindEvents(subClient: Redis, pubClient: Redis) {
    subClient.on(
      this.options?.wildcards ? 'pmessage' : 'message',
      this.getMessageHandler(pubClient).bind(this),
    );
    const subscribePatterns = [...this.messageHandlers.keys()];
    subscribePatterns.forEach(pattern => {
        throw new Error("STUB");
    });
  }

  public async close() {
    this.isManuallyClosed = true;
    this.pubClient && (await this.pubClient.quit());
    this.subClient && (await this.subClient.quit());
    this.pendingEventListeners = [];
  }

  public createRedisClient(): Redis {
    const clientInfoTag = this.getOptionsProp(this.options, 'clientInfoTag');
    return new redisPackage({
      port: REDIS_DEFAULT_PORT,
      host: REDIS_DEFAULT_HOST,
      ...this.getClientOptions(),
      ...(clientInfoTag && { clientInfoTag }),
      lazyConnect: true,
    });
  }

  public getMessageHandler(pub: Redis) {
    return this.options?.wildcards
      ? (channel: string, pattern: string, buffer: string) =>
          { throw new Error("STUB"); }
      : (channel: string, buffer: string) =>
          { throw new Error("STUB"); };
  }

  public async handleMessage(
    channel: string,
    buffer: string,
    pub: Redis,
    pattern: string,
  ) {
    const rawMessage = this.parseMessage(buffer);
    const packet = await this.deserializer.deserialize(rawMessage, { channel });
    const redisCtx = new RedisContext([pattern]);

    if (isUndefined((packet as IncomingRequest).id)) {
      return this.handleEvent(channel, packet, redisCtx);
    }
    const publish = this.getPublisher(
      pub,
      channel,
      (packet as IncomingRequest).id,
      redisCtx,
    );
    const handler = this.getHandlerByPattern(channel);

    if (!handler) {
      const status = 'error';
      const noHandlerPacket = {
        id: (packet as IncomingRequest).id,
        status,
        err: NO_MESSAGE_HANDLER,
      };
      return publish(noHandlerPacket);
    }
    return this.onProcessingStartHook?.(
      this.transportId,
      redisCtx,
      async () => {
          throw new Error("STUB");
      },
    );
  }

  public getPublisher(pub: Redis, pattern: any, id: string, ctx: RedisContext) {
    return (response: any) => {
        throw new Error("STUB");
    };
  }

  public parseMessage(content: any): Record<string, any> {
    try {
      return JSON.parse(content);
    } catch (e) {
      return content;
    }
  }

  public getRequestPattern(pattern: string): string {
    return pattern;
  }

  public getReplyPattern(pattern: string): string {
    return `${pattern}.reply`;
  }

  public registerErrorListener(client: any) {
    client.on(RedisEventsMap.ERROR, (err: any) => { throw new Error("STUB"); });
  }

  public registerReconnectListener(client: {
    on: (event: string, fn: () => void) => void;
  }) {
    client.on(RedisEventsMap.RECONNECTING, () => {
        throw new Error("STUB");
    });
  }

  public registerReadyListener(client: {
    on: (event: string, fn: () => void) => void;
  }) {
    client.on(RedisEventsMap.READY, () => {
        throw new Error("STUB");
    });
  }

  public registerEndListener(client: {
    on: (event: string, fn: () => void) => void;
  }) {
    client.on('end', () => {
        throw new Error("STUB");
    });
  }

  public getClientOptions(): Partial<RedisOptions['options']> {
    const retryStrategy = (times: number) => { throw new Error("STUB"); };

    return {
      ...(this.options || {}),
      retryStrategy,
    };
  }

  public createRetryStrategy(times: number): undefined | number | void {
    if (this.isManuallyClosed) {
      return undefined;
    }
    if (!this.getOptionsProp(this.options, 'retryAttempts')) {
      this.logger.error(
        'Redis connection closed and retry attempts not specified',
      );
      return;
    }
    if (times > this.getOptionsProp(this.options, 'retryAttempts', 0)) {
      this.logger.error(`Retry time exhausted`);
      return;
    }
    return this.getOptionsProp(this.options, 'retryDelay', 5000);
  }

  public unwrap<T>(): T {
      throw new Error("STUB");
  }

  public on<
    EventKey extends keyof RedisEvents = keyof RedisEvents,
    EventCallback extends RedisEvents[EventKey] = RedisEvents[EventKey],
  >(event: EventKey, callback: EventCallback) {
    if (this.subClient && this.pubClient) {
      this.subClient.on(event, (...args: [any]) => { throw new Error("STUB"); });
      this.pubClient.on(event, (...args: [any]) => { throw new Error("STUB"); });
    } else {
      this.pendingEventListeners.push({ event, callback });
    }
  }
}
