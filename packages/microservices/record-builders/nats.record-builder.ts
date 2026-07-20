/**
 * @publicApi
 */
export class NatsRecord<TData = any, THeaders = any> {
  constructor(
    public readonly data: TData,
    public readonly headers?: THeaders,
  ) {}
}

/**
 * @publicApi
 */
export class NatsRecordBuilder<TData> {
  private headers?: any;

  constructor(private data?: TData) {}

  public setHeaders<THeaders = any>(headers: THeaders): this {
    this.headers = headers;
    return this;
  }

  public setData(data: TData): this {
      throw new Error("STUB");
  }

  public build(): NatsRecord {
    return new NatsRecord(this.data, this.headers);
  }
}
