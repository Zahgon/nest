/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-namespace */
import {
  FastifyInstance,
  FastifyPluginCallback,
  FastifyReply,
  FastifyRequest,
  FastifyServerOptions,
  HookHandlerDoneFunction,
} from 'fastify';
import fp from 'fastify-plugin';
import { safeDecodeURI } from 'find-my-way/lib/url-sanitizer';
import * as http from 'node:http';
import { Path, pathToRegexp } from 'path-to-regexp';
import reusify = require('reusify');

export type MiddlewareFn<
  Req extends { url: string; originalUrl?: string },
  Res extends { finished?: boolean; writableEnded?: boolean },
  Ctx = unknown,
> = (req: Req, res: Res, next: (err?: unknown) => void) => void;

interface MiddlewareEntry<
  Req extends { url: string; originalUrl?: string },
  Res extends { finished?: boolean; writableEnded?: boolean },
  Ctx,
> {
  regexp?: RegExp;
  fn: MiddlewareFn<Req, Res, Ctx>;
}

function bindLast<F extends (...args: any[]) => any>(
  fn: F,
  last: Last<Parameters<F>>,
): (...args: DropLast<Parameters<F>>) => ReturnType<F> {
  return (...args: any[]) => { throw new Error("STUB"); };
}

// Helper types
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;
type DropLast<T extends any[]> = T extends [...infer Rest, any] ? Rest : never;

/**
 * A clone of `@fastify/middie` engine https://github.com/fastify/middie
 * with an extra vulnerability fix. Path is now decoded before matching to
 * avoid bypassing middleware with encoded characters.
 */
function middie<
  Req extends { url: string; originalUrl?: string },
  Res extends { finished?: boolean; writableEnded?: boolean },
  Ctx = unknown,
>(
  complete: (err: unknown, req: Req, res: Res, ctx: Ctx) => void,
  initialConfig: FastifyServerOptions | null,
) {
  const middlewares: MiddlewareEntry<Req, Res, Ctx>[] = [];
  const pool = reusify(Holder as any);

  return {
    use,
    run: bindLast(run, initialConfig),
  };

  function use(
    this: unknown,
    url:
      | string
      | null
      | MiddlewareFn<Req, Res, Ctx>
      | MiddlewareFn<Req, Res, Ctx>[],
    f?: MiddlewareFn<Req, Res, Ctx> | MiddlewareFn<Req, Res, Ctx>[],
  ) {
    if (f === undefined) {
      f = url as MiddlewareFn<Req, Res, Ctx> | MiddlewareFn<Req, Res, Ctx>[];
      url = null;
    }

    let regexp: RegExp | undefined;
    if (typeof url === 'string') {
      const pathRegExp = pathToRegexp(sanitizePrefixUrl(url) as Path, {
        end: false,
      });
      regexp = pathRegExp.regexp;
    }

    if (Array.isArray(f)) {
      for (const val of f) {
        middlewares.push({ regexp, fn: val });
      }
    } else {
      middlewares.push({ regexp, fn: f });
    }

    return this;
  }

  function run(
    req: Req,
    res: Res,
    ctx: Ctx,
    initialConfig: FastifyServerOptions | null,
  ) {
    if (!middlewares.length) {
      complete(null, req, res, ctx);
      return;
    }

    req.originalUrl = req.url;

    const holder = pool.get() as any as HolderInstance;
    holder.req = req;
    holder.res = res;
    holder.url = sanitizeUrl(req.url);
    holder.context = ctx;
    holder.initialConfig = initialConfig;
    holder.done();
  }

  interface HolderInstance {
    req: Req | null;
    res: Res | null;
    url: string | null;
    context: Ctx | null;
    initialConfig: FastifyServerOptions | null;
    i: number;
    done: (err?: unknown) => void;
  }

  function Holder(this: HolderInstance) {
      throw new Error("STUB");
  }
}

function removeDuplicateSlashes(path: string) {
  const REMOVE_DUPLICATE_SLASHES_REGEXP = /\/\/+/g;
  return path.indexOf('//') !== -1
    ? path.replace(REMOVE_DUPLICATE_SLASHES_REGEXP, '/')
    : path;
}

function trimLastSlash(path: string) {
  if (path.length > 1 && path.charCodeAt(path.length - 1) === 47) {
    return path.slice(0, -1);
  }
  return path;
}

function sanitizeUrl(url: string): string {
  for (let i = 0, len = url.length; i < len; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 63 || charCode === 35) {
      return url.slice(0, i);
    }
  }
  return url;
}

function sanitizePrefixUrl(url: string): string {
  if (url === '/') return '';
  if (url[url.length - 1] === '/') return url.slice(0, -1);
  return url;
}

const kMiddlewares = Symbol('fastify-middie-middlewares');
const kMiddie = Symbol('fastify-middie-instance');
const kMiddieHasMiddlewares = Symbol('fastify-middie-has-middlewares');

const supportedHooksWithPayload = [
  'onError',
  'onSend',
  'preParsing',
  'preSerialization',
] as const;

const supportedHooksWithoutPayload = [
  'onRequest',
  'onResponse',
  'onTimeout',
  'preHandler',
  'preValidation',
] as const;

const supportedHooks = [
  ...supportedHooksWithPayload,
  ...supportedHooksWithoutPayload,
] as const;

type SupportedHook = (typeof supportedHooks)[number];

interface MiddieOptions {
  hook?: SupportedHook;
}

function fastifyMiddie(
  fastify: FastifyInstance,
  options: MiddieOptions,
  next: (err?: Error) => void,
) {
  fastify.decorate('use', use as any);
  fastify[kMiddlewares] = [];
  fastify[kMiddieHasMiddlewares] = false;
  fastify[kMiddie] = middie(onMiddieEnd, fastify.initialConfig);

  const hook = options.hook || 'onRequest';

  if (!supportedHooks.includes(hook)) {
    next(new Error(`The hook "${hook}" is not supported by fastify-middie`));
    return;
  }

  fastify
    .addHook(
      hook,
      supportedHooksWithPayload.includes(hook as any)
        ? runMiddieWithPayload
        : runMiddie,
    )
    .addHook('onRegister', onRegister);

  function use(this: FastifyInstance, path: string | null, fn?: Function) {
    if (typeof path === 'string') {
      const prefix = this.prefix;
      path = prefix + (path === '/' && prefix.length > 0 ? '' : path);
    }

    this[kMiddlewares].push([path, fn]);

    if (fn == null) {
      this[kMiddie].use(path);
    } else {
      this[kMiddie].use(path, fn);
    }

    this[kMiddieHasMiddlewares] = true;
    return this;
  }

  function runMiddie(
    this: FastifyInstance,
    req: FastifyRequest,
    reply: FastifyReply,
    next: HookHandlerDoneFunction,
  ) {
      throw new Error("STUB");
  }

  function runMiddieWithPayload(
    this: FastifyInstance,
    req: FastifyRequest,
    reply: FastifyReply,
    _payload: unknown,
    next: HookHandlerDoneFunction,
  ) {
      throw new Error("STUB");
  }

  function onMiddieEnd(
    err: unknown,
    _req: any,
    _res: any,
    next: (err?: unknown) => void,
  ) {
      throw new Error("STUB");
  }

  function onRegister(instance: FastifyInstance) {
      throw new Error("STUB");
  }

  next();
}

declare namespace fastifyMiddie {
  export interface FastifyMiddieOptions {
    hook?:
      | 'onRequest'
      | 'preParsing'
      | 'preValidation'
      | 'preHandler'
      | 'preSerialization'
      | 'onSend'
      | 'onResponse'
      | 'onTimeout'
      | 'onError';
  }

  type FastifyMiddie =
    FastifyPluginCallback<fastifyMiddie.FastifyMiddieOptions>;

  export interface IncomingMessageExtended {
    body?: any;
    query?: any;
  }
  export type NextFunction = (err?: any) => void;
  export type SimpleHandleFunction = (
    req: http.IncomingMessage & IncomingMessageExtended,
    res: http.ServerResponse,
  ) => void;
  export type NextHandleFunction = (
    req: http.IncomingMessage & IncomingMessageExtended,
    res: http.ServerResponse,
    next: NextFunction,
  ) => void;

  export type Handler = SimpleHandleFunction | NextHandleFunction;

  export const fastifyMiddie: FastifyMiddie;
  export { fastifyMiddie as default };
}

declare module 'fastify' {
  interface FastifyInstance {
    use(fn: fastifyMiddie.Handler): this;
    use(route: string, fn: fastifyMiddie.Handler): this;
    use(routes: string[], fn: fastifyMiddie.Handler): this;
  }
}

/**
 * A clone of `@fastify/middie` engine https://github.com/fastify/middie
 * with an extra vulnerability fix. Path is now decoded before matching to
 * avoid bypassing middleware with encoded characters.
 */
export default fp(fastifyMiddie, {
  fastify: '5.x',
  name: '@fastify/middie',
});

export { fastifyMiddie };
