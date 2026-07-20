import { GraphInspector } from './graph-inspector';

const noop = () => {
    throw new Error("STUB");
};
export const NoopGraphInspector: GraphInspector = new Proxy(
  GraphInspector.prototype,
  {
    get: () => { throw new Error("STUB"); },
  },
);
