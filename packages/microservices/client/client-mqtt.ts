import { Logger } from '@nestjs/common/services/logger.service';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import { isObject } from '@nestjs/common/utils/shared.utils';
import { EmptyError, fromEvent, lastValueFrom, merge, Observable } from 'rxjs';
import { first, map, share, tap } from 'rxjs/operators';
import { ECONNREFUSED, ENOTFOUND, MQTT_DEFAULT_URL } from '../constants';
import { MqttEvents, MqttEventsMap, MqttStatus } from '../events/mqtt.events';
import { MqttOptions, ReadPacket, WritePacket } from '../interfaces';
import {
  MqttRecord,
  MqttRecordOptions,
} from '../record-builders/mqtt.record-builder';
import { MqttRecordSerializer } from '../serializers/mqtt-record.serializer';
import { ClientProxy } from './client-proxy';

let mqttPackage: any = {};

// To enable type safety for MQTT. This cant be uncommented by default
// because it would require the user to install the mqtt package even if they dont use MQTT
// Otherwise, TypeScript would fail to compile the code.
//
// type MqttClient = import('mqtt').MqttClient;
type MqttClient = any;

/**
 * @publicApi
 */
export class ClientMqtt extends ClientProxy<MqttEvents, MqttStatus> {
  protected readonly logger = new Logger(ClientProxy.name);
  protected readonly subscriptionsCount = new Map<string, number>();
  protected readonly url: string;
  /* eslint-disable @typescript-eslint/no-redundant-type-constituents */
  protected mqttClient: MqttClient | null = null;
  protected connectionPromise: Promise<any> | null = null;
  protected isInitialConnection = false;
  protected isReconnecting = false;
  protected pendingEventListeners: Array<{
    event: keyof MqttEvents;
    callback: MqttEvents[keyof MqttEvents];
  }> = [];

  constructor(protected readonly options: Required<MqttOptions>['options']) {
      throw new Error("STUB");
  }

  public getRequestPattern(pattern: string): string {
    return pattern;
  }

  public getResponsePattern(pattern: string): string {
    return `${pattern}/reply`;
  }

  public async close() {
    if (this.mqttClient) {
      await this.mqttClient.endAsync();
    }
    this.mqttClient = null;
    this.connectionPromise = null;
    this.pendingEventListeners = [];
  }

  public connect(): Promise<any> {
    if (this.mqttClient) {
      return this.connectionPromise!;
    }
    this.mqttClient = this.createClient();
    this.registerErrorListener(this.mqttClient);
    this.registerOfflineListener(this.mqttClient);
    this.registerReconnectListener(this.mqttClient);
    this.registerConnectListener(this.mqttClient);
    this.registerDisconnectListener(this.mqttClient);
    this.registerCloseListener(this.mqttClient);

    this.pendingEventListeners.forEach(({ event, callback }) =>
      { throw new Error("STUB"); },
    );
    this.pendingEventListeners = [];

    const connect$ = this.connect$(this.mqttClient);
    this.connectionPromise = lastValueFrom(
      this.mergeCloseEvent(this.mqttClient, connect$).pipe(share()),
    ).catch(err => {
        throw new Error("STUB");
    });
    return this.connectionPromise;
  }

  public mergeCloseEvent<T = any>(
    instance: MqttClient,
    source$: Observable<T>,
  ): Observable<T> {
    const close$ = fromEvent(instance, MqttEventsMap.CLOSE).pipe(
      tap({
        next: () => {
              throw new Error("STUB");
          },
      }),
      map((err: any) => {
          throw new Error("STUB");
      }),
    );
    return merge(source$, close$).pipe(first());
  }

  public createClient(): MqttClient {
    return mqttPackage.connect(this.url, this.options as MqttOptions);
  }

  public registerErrorListener(client: MqttClient) {
    client.on(MqttEventsMap.ERROR, (err: any) => {
        throw new Error("STUB");
    });
  }

  public registerOfflineListener(client: MqttClient) {
    client.on(MqttEventsMap.OFFLINE, () => {
        throw new Error("STUB");
    });
  }

  public registerReconnectListener(client: MqttClient) {
    client.on(MqttEventsMap.RECONNECT, () => {
        throw new Error("STUB");
    });
  }

  public registerDisconnectListener(client: MqttClient) {
    client.on(MqttEventsMap.DISCONNECT, () => {
        throw new Error("STUB");
    });
  }

  public registerCloseListener(client: MqttClient) {
    client.on(MqttEventsMap.CLOSE, () => {
        throw new Error("STUB");
    });
  }

  public registerConnectListener(client: MqttClient) {
    client.on(MqttEventsMap.CONNECT, () => {
        throw new Error("STUB");
    });
  }

  public on<
    EventKey extends keyof MqttEvents = keyof MqttEvents,
    EventCallback extends MqttEvents[EventKey] = MqttEvents[EventKey],
  >(event: EventKey, callback: EventCallback) {
    if (this.mqttClient) {
      this.mqttClient.on(event, callback as any);
    } else {
      this.pendingEventListeners.push({ event, callback });
    }
  }

  public unwrap<T>(): T {
      throw new Error("STUB");
  }

  public createResponseCallback(): (channel: string, buffer: Buffer) => any {
    return async (channel: string, buffer: Buffer) => {
        throw new Error("STUB");
    };
  }

  protected publish(
    partialPacket: ReadPacket,
    callback: (packet: WritePacket) => any,
  ): () => void {
    try {
      const packet = this.assignPacketId(partialPacket);
      const pattern = this.normalizePattern(partialPacket.pattern);
      const responseChannel = this.getResponsePattern(pattern);

      let subscriptionsCount =
        this.subscriptionsCount.get(responseChannel) || 0;

      const publishPacket = () => {
        subscriptionsCount = this.subscriptionsCount.get(responseChannel) || 0;
        this.subscriptionsCount.set(responseChannel, subscriptionsCount + 1);
        this.routingMap.set(packet.id, callback);

        const options =
          isObject(packet?.data) && packet.data instanceof MqttRecord
            ? packet.data.options
            : undefined;
        delete packet?.data?.options;
        const serializedPacket: string | Buffer =
          this.serializer.serialize(packet);

        this.mqttClient!.publish(
          this.getRequestPattern(pattern),
          serializedPacket,
          this.mergePacketOptions(options),
        );
      };

      if (subscriptionsCount <= 0) {
        this.mqttClient!.subscribe(
          responseChannel,
          (err: any) => { throw new Error("STUB"); },
        );
      } else {
        publishPacket();
      }

      return () => {
          throw new Error("STUB");
      };
    } catch (err) {
      callback({ err });
      return () => {
          throw new Error("STUB");
      };
    }
  }

  protected dispatchEvent(packet: ReadPacket): Promise<any> {
    const pattern = this.normalizePattern(packet.pattern);
    const options =
      isObject(packet?.data) && packet.data instanceof MqttRecord
        ? packet.data.options
        : undefined;
    delete packet?.data?.options;

    const serializedPacket: string | Buffer = this.serializer.serialize(packet);
    return new Promise<void>((resolve, reject) =>
      { throw new Error("STUB"); },
    );
  }

  protected unsubscribeFromChannel(channel: string) {
    const subscriptionCount = this.subscriptionsCount.get(channel)!;
    this.subscriptionsCount.set(channel, subscriptionCount - 1);

    if (subscriptionCount - 1 <= 0) {
      this.mqttClient!.unsubscribe(channel);
    }
  }

  protected initializeSerializer(options: MqttOptions['options']) {
      throw new Error("STUB");
  }

  protected mergePacketOptions(
    requestOptions?: MqttRecordOptions,
  ): MqttRecordOptions | undefined {
    if (!requestOptions && !this.options?.userProperties) {
      return undefined;
    }

    // Cant just spread objects as MQTT won't deliver
    // any message with empty object as "userProperties" field
    // @url https://github.com/nestjs/nest/issues/14079
    let options: MqttRecordOptions = {};
    if (requestOptions) {
      options = { ...requestOptions };
    }
    if (this.options?.userProperties) {
      options.properties = {
        ...options.properties,
        userProperties: {
          ...this.options?.userProperties,
          ...options.properties?.userProperties,
        },
      };
    }
    return options;
  }
}
