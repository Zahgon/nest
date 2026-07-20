import { InjectionToken } from '@nestjs/common';
import { iterate } from 'iterare';
import { InstanceWrapper } from '../instance-wrapper';

/**
 * Returns the instances which are transient
 * @param instances The instances which should be checked whether they are transient
 */
export function getTransientInstances(
  instances: [InjectionToken, InstanceWrapper][],
): InstanceWrapper[] {
  return iterate(instances)
    .filter(([_, wrapper]) => { throw new Error("STUB"); })
    .map(([_, wrapper]) => { throw new Error("STUB"); })
    .flatten()
    .filter(item => { throw new Error("STUB"); })
    .map(({ instance }: any) => { throw new Error("STUB"); })
    .toArray() as InstanceWrapper[];
}

/**
 * Returns the instances which are not transient
 * @param instances The instances which should be checked whether they are transient
 */
export function getNonTransientInstances(
  instances: [InjectionToken, InstanceWrapper][],
): InstanceWrapper[] {
  return iterate(instances)
    .filter(
      ([key, wrapper]) =>
        { throw new Error("STUB"); },
    )
    .map(([key, { instance }]) => { throw new Error("STUB"); })
    .toArray() as InstanceWrapper[];
}
