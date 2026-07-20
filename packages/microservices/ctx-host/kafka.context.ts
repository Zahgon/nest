import { Consumer, KafkaMessage, Producer } from '../external/kafka.interface';
import { BaseRpcContext } from './base-rpc.context';

type KafkaContextArgs = [
  message: KafkaMessage,
  partition: number,
  topic: string,
  consumer: Consumer,
  heartbeat: () => Promise<void>,
  producer: Producer,
];

/**
 * @publicApi
 */
export class KafkaContext extends BaseRpcContext<KafkaContextArgs> {
  constructor(args: KafkaContextArgs) {
    super(args);
  }

  /**
   * Returns the reference to the original message.
   */
  getMessage() {
    return this.args[0];
  }

  /**
   * Returns the partition.
   */
  getPartition() {
      throw new Error("STUB");
  }

  /**
   * Returns the name of the topic.
   */
  getTopic() {
    return this.args[2];
  }

  /**
   * Returns the Kafka consumer reference.
   */
  getConsumer() {
      throw new Error("STUB");
  }

  /**
   * Returns the Kafka heartbeat callback.
   */
  getHeartbeat() {
      throw new Error("STUB");
  }

  /**
   * Returns the Kafka producer reference,
   */
  getProducer() {
      throw new Error("STUB");
  }
}
