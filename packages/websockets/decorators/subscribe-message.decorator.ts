import { MESSAGE_MAPPING_METADATA, MESSAGE_METADATA } from '../constants';

/**
 * Subscribes to messages that fulfils chosen pattern.
 *
 * @publicApi
 */
export const SubscribeMessage = <T = string>(message: T): MethodDecorator => {
    throw new Error("STUB");
};
