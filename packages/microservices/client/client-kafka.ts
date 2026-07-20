import { Logger } from '@nestjs/common/services/logger.service';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import { isNil, isUndefined } from '@nestjs/common/utils/shared.utils';
import {
  throwError as _throw,
  connectable,
  defer,
  Observable,
  Subject,
} from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import {
  KAFKA_DEFAULT_BROKER,
  KAFKA_DEFAULT_CLIENT,
  KAFKA_DEFAULT_GROUP,
} from '../constants';
import { KafkaResponseDeserializer } from '../deserializers/kafka-response.deserializer';
import { KafkaHeaders } from '../enums';
import { InvalidKafkaClientTopicException } from '../errors/invalid-kafka-client-topic.exception';
import { InvalidMessageException } from '../errors/invalid-message.exception';
import { KafkaStatus } from '../events';
import {
  BrokersFunction,
  Consumer,
  ConsumerConfig,
  ConsumerGroupJoinEvent,
  EachMessagePayload,
  Kafka,
  KafkaConfig,
  KafkaMessage,
  Producer,
  TopicPartitionOffsetAndMetadata,
} from '../external/kafka.interface';
import {
  KafkaLogger,
  KafkaParser,
  KafkaReplyPartitionAssigner,
} from '../helpers';
import {
  ClientKafkaProxy,
  KafkaOptions,
  MsPattern,
  OutgoingEvent,
  ReadPacket,
  WritePacket,
} from '../interfaces';
import {
  KafkaRequest,
  KafkaRequestSerializer,
} from '../serializers/kafka-request.serializer';
import { ClientProxy } from './client-proxy';

let kafkaPackage: any = {};

/**
 * @publicApi
 */
export class ClientKafka
  extends ClientProxy<never, KafkaStatus>
  implements ClientKafkaProxy
{
  protected logger = new Logger(ClientKafka.name);
  protected client: Kafka | null = null;
  protected parser: KafkaParser | null = null;
  protected initialized: Promise<void> | null = null;
  protected responsePatterns: string[] = [];
  protected consumerAssignments: { [key: string]: number } = {};
  protected brokers: string[] | BrokersFunction;
  protected clientId: string;
  protected groupId: string;
  protected producerOnlyMode: boolean;
  protected _consumer: Consumer | null = null;
  protected _producer: Producer | null = null;

  get consumer(): Consumer {
      throw new Error("STUB");
  }

  get producer(): Producer {
      throw new Error("STUB");
  }

  constructor(protected readonly options: Required<KafkaOptions>['options']) {
      throw new Error("STUB");
  }

  public subscribeToResponseOf(pattern: unknown): void {
      throw new Error("STUB");
  }

  public async close(): Promise<void> {
    this._producer && (await this._producer.disconnect());
    this._consumer && (await this._consumer.disconnect());
    this._producer = null;
    this._consumer = null;
    this.initialized = null;
    this.client = null;
  }

  public async connect(): Promise<Producer> {
    if (this.initialized) {
      return this.initialized.then(() => { throw new Error("STUB"); });
    }
    /* eslint-disable-next-line no-async-promise-executor */
    this.initialized = new Promise(async (resolve, reject) => {
        throw new Error("STUB");
    });
    return this.initialized.then(() => { throw new Error("STUB"); });
  }

  public async bindTopics(): Promise<void> {
    if (!this._consumer) {
      throw Error('No consumer initialized');
    }

    const consumerSubscribeOptions = this.options.subscribe || {};

    if (this.responsePatterns.length > 0) {
      await this._consumer.subscribe({
        ...consumerSubscribeOptions,
        topics: this.responsePatterns,
      });
    }

    await this._consumer.run(
      Object.assign(this.options.run || {}, {
        eachMessage: this.createResponseCallback(),
      }),
    );
  }

  public createClient<T = any>(): T {
    const kafkaConfig: KafkaConfig = Object.assign(
      { logCreator: KafkaLogger.bind(null, this.logger) },
      this.options.client,
      { brokers: this.brokers, clientId: this.clientId },
    );

    return new kafkaPackage.Kafka(kafkaConfig);
  }

  public createResponseCallback(): (payload: EachMessagePayload) => any {
    return async (payload: EachMessagePayload) => {
        throw new Error("STUB");
    };
  }

  public getConsumerAssignments() {
      throw new Error("STUB");
  }

  public emitBatch<TResult = any, TInput = any>(
    pattern: any,
    data: { messages: TInput[] },
  ): Observable<TResult> {
      throw new Error("STUB");
  }

  public commitOffsets(
    topicPartitions: TopicPartitionOffsetAndMetadata[],
  ): Promise<void> {
      throw new Error("STUB");
  }

  public unwrap<T>(): T {
      throw new Error("STUB");
  }

  public on<
    EventKey extends string | number | symbol = string | number | symbol,
    EventCallback = any,
  >(event: EventKey, callback: EventCallback) {
    throw new Error('Method is not supported for Kafka client');
  }

  protected registerConsumerEventListeners() {
    if (!this._consumer) {
      return;
    }
    this._consumer.on(this._consumer.events.CONNECT, () =>
      { throw new Error("STUB"); },
    );
    this._consumer.on(this._consumer.events.DISCONNECT, () =>
      { throw new Error("STUB"); },
    );
    this._consumer.on(this._consumer.events.REBALANCING, () =>
      { throw new Error("STUB"); },
    );
    this._consumer.on(this._consumer.events.STOP, () =>
      { throw new Error("STUB"); },
    );
    this._consumer.on(this._consumer.events.CRASH, () =>
      { throw new Error("STUB"); },
    );
  }

  protected registerProducerEventListeners() {
    if (!this._producer) {
      return;
    }
    this._producer.on(this._producer.events.CONNECT, () =>
      { throw new Error("STUB"); },
    );
    this._producer.on(this._producer.events.DISCONNECT, () =>
      { throw new Error("STUB"); },
    );
  }

  protected async dispatchBatchEvent<TInput = any>(
    packets: ReadPacket<{ messages: TInput[] }>,
  ): Promise<any> {
      throw new Error("STUB");
  }

  protected async dispatchEvent(packet: OutgoingEvent): Promise<any> {
    const pattern = this.normalizePattern(packet.pattern);
    const outgoingEvent = await this.serializer.serialize(packet.data, {
      pattern,
    });
    const message = Object.assign(
      {
        topic: pattern,
        messages: [outgoingEvent],
      },
      this.options.send || {},
    );

    return this._producer!.send(message);
  }

  protected getReplyTopicPartition(topic: string): string {
    const minimumPartition = this.consumerAssignments[topic];
    if (isUndefined(minimumPartition)) {
      throw new InvalidKafkaClientTopicException(topic);
    }

    // Get the minimum partition
    return minimumPartition.toString();
  }

  protected publish(
    partialPacket: ReadPacket,
    callback: (packet: WritePacket) => any,
  ): () => void {
    const packet = this.assignPacketId(partialPacket);
    this.routingMap.set(packet.id, callback);

    const cleanup = () => this.routingMap.delete(packet.id);
    const errorCallback = (err: unknown) => {
      cleanup();
      callback({ err });
    };

    try {
      const pattern = this.normalizePattern(partialPacket.pattern);
      const replyTopic = this.getResponsePatternName(pattern);
      const replyPartition = this.getReplyTopicPartition(replyTopic);

      Promise.resolve(this.serializer.serialize(packet.data, { pattern }))
        .then((serializedPacket: KafkaRequest) => {
            throw new Error("STUB");
        })
        .catch(err => { throw new Error("STUB"); });

      return cleanup;
    } catch (err) {
      errorCallback(err);
      return () => { throw new Error("STUB"); };
    }
  }

  protected getResponsePatternName(pattern: string): string {
    return `${pattern}.reply`;
  }

  protected setConsumerAssignments(data: ConsumerGroupJoinEvent): void {
      throw new Error("STUB");
  }

  protected initializeSerializer(options: KafkaOptions['options']) {
      throw new Error("STUB");
  }

  protected initializeDeserializer(options: KafkaOptions['options']) {
      throw new Error("STUB");
  }
}
