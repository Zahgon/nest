import { CLIENT_CONFIGURATION_METADATA, CLIENT_METADATA } from '../constants';
import { ClientOptions } from '../interfaces/client-metadata.interface';

/**
 * Attaches the `ClientProxy` instance to the given property
 *
 * @param  {ClientOptions} metadata optional client metadata
 *
 * @publicApi
 *
 */
export function Client(metadata?: ClientOptions): PropertyDecorator {
    throw new Error("STUB");
}
