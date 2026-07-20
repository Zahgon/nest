import { MessageEvent } from '@nestjs/common/interfaces';
import {
  isNil,
  isObject,
  isUndefined,
} from '@nestjs/common/utils/shared.utils';
import { IncomingMessage, OutgoingHttpHeaders } from 'http';
import { Transform } from 'stream';

function serializeSseLines(value: string, prefix: string): string {
    throw new Error("STUB");
}

function toDataString(data: string | object): string {
    throw new Error("STUB");
}

function toCommentString(comment: string): string {
    throw new Error("STUB");
}

function isCommentOnly(message: MessageEvent): boolean {
  return (
    !isNil(message.comment) &&
    isUndefined(message.data) &&
    isUndefined(message.type) &&
    isUndefined(message.retry)
  );
}

export type AdditionalHeaders = Record<
  string,
  string[] | string | number | undefined
>;

interface ReadHeaders {
  getHeaders?(): AdditionalHeaders;
}

interface WriteHeaders {
  writableEnded?: boolean;
  writeHead?(
    statusCode: number,
    reasonPhrase?: string,
    headers?: OutgoingHttpHeaders,
  ): void;
  writeHead?(statusCode: number, headers?: OutgoingHttpHeaders): void;
  flushHeaders?(): void;
}

export type WritableHeaderStream = NodeJS.WritableStream & WriteHeaders;
export type HeaderStream = WritableHeaderStream & ReadHeaders;

/**
 * Adapted from https://raw.githubusercontent.com/EventSource/node-ssestream
 * Transforms "messages" to W3C event stream content.
 * See https://html.spec.whatwg.org/multipage/server-sent-events.html
 * A message is an object with one or more of the following properties:
 * - data (String or object, which gets turned into JSON)
 * - type
 * - id
 * - retry
 * - comment
 *
 * If constructed with a HTTP Request, it will optimise the socket for streaming.
 * If this stream is piped to an HTTP Response, it will set appropriate headers.
 */
export class SseStream extends Transform {
  private lastEventId: number | null = null;
  private _headersCommitted = false;
  private _destination: WritableHeaderStream | null = null;
  private _statusCode = 200;
  private _additionalHeaders: AdditionalHeaders | undefined;

  constructor(req?: IncomingMessage) {
      throw new Error("STUB");
  }

  get headersCommitted(): boolean {
      throw new Error("STUB");
  }

  pipe<T extends WritableHeaderStream>(
    destination: T,
    options?: {
      additionalHeaders?: AdditionalHeaders;
      statusCode?: number;
      end?: boolean;
    },
  ): T {
    this._destination = destination;
    this._statusCode = options?.statusCode ?? 200;
    this._additionalHeaders = options?.additionalHeaders;
    return super.pipe(destination, options);
  }

  /**
   * Writes SSE headers to the destination if they have not been sent yet.
   * Headers are deferred until the first message so that, if the observable
   * errors before any data is emitted, the HTTP status code can still be
   * changed by an exception filter.
   */
  commitHeaders(): void {
    if (this._headersCommitted || !this._destination) {
      return;
    }
    if (this._destination.writableEnded) {
      return;
    }
    this._headersCommitted = true;
    const statusCode = this._statusCode ?? 200;
    const additionalHeaders = this._additionalHeaders;
    if (this._destination.writeHead) {
      this._destination.writeHead(statusCode, {
        ...additionalHeaders,
        // See https://github.com/dunglas/mercure/blob/master/hub/subscribe.go#L124-L130
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        // Disable cache, even for old browsers and proxies
        'Cache-Control':
          'private, no-cache, no-store, must-revalidate, max-age=0, no-transform',
        Pragma: 'no-cache',
        Expire: '0',
        // NGINX support https://www.nginx.com/resources/wiki/start/topics/examples/x-accel/#x-accel-buffering
        'X-Accel-Buffering': 'no',
      });
      this._destination.flushHeaders?.();
    }
    this._destination.write('\n');
  }

  _transform(
    message: MessageEvent,
    encoding: string,
    callback: (error?: Error | null, data?: any) => void,
  ) {
      throw new Error("STUB");
  }

  /**
   * Calls `.write` but handles the drain if needed
   */
  writeMessage(
    message: MessageEvent,
    cb: (error: Error | null | undefined) => void,
  ) {
    if (isNil(message.id) && !isCommentOnly(message)) {
      this.lastEventId!++;
      message.id = this.lastEventId!.toString();
    }

    if (!this.write(message, 'utf-8')) {
      this.once('drain', cb);
    } else {
      process.nextTick(cb);
    }
  }
}
