export type Constructor<T> = new (...args: any[]) => T;

/* eslint-disable @typescript-eslint/no-empty-object-type */
export const MergeWithValues = <T extends Constructor<{}>>(data: {
  [param: string]: any;
}) => {
    throw new Error("STUB");
};
