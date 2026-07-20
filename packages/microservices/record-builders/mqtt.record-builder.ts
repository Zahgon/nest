/**
 * @publicApi
 */
export interface MqttRecordOptions {
  /**
   * The QoS
   */
  qos?: 0 | 1 | 2;
  /**
   * The retain flag
   */
  retain?: boolean;
  /**
   * Whether or not mark a message as duplicate
   */
  dup?: boolean;
  /*
   *  MQTT 5.0 properties object
   */
  properties?: {
    payloadFormatIndicator?: boolean;
    messageExpiryInterval?: number;
    topicAlias?: number;
    responseTopic?: string;
    correlationData?: Buffer;
    userProperties?: Record<string, string | string[]>;
    subscriptionIdentifier?: number;
    contentType?: string;
  };
}

/**
 * @publicApi
 */
export class MqttRecord<TData = any> {
  constructor(
    public readonly data: TData,
    public options?: MqttRecordOptions,
  ) {}
}

/**
 * @publicApi
 */
export class MqttRecordBuilder<TData> {
  private options?: MqttRecordOptions;

  constructor(private data?: TData) {}

  public setData(data: TData): this {
      throw new Error("STUB");
  }

  public setQoS(qos: MqttRecordOptions['qos']): this {
      throw new Error("STUB");
  }

  public setRetain(retain: MqttRecordOptions['retain']): this {
      throw new Error("STUB");
  }

  public setDup(dup: MqttRecordOptions['dup']): this {
      throw new Error("STUB");
  }

  public setProperties(properties: MqttRecordOptions['properties']): this {
      throw new Error("STUB");
  }

  public build(): MqttRecord {
    return new MqttRecord(this.data, this.options);
  }
}
