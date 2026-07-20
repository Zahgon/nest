import { METHOD_METADATA, PATH_METADATA, SSE_METADATA } from '../../constants';
import { RequestMethod } from '../../enums/request-method.enum';

/**
 * Declares this route as a Server-Sent-Events endpoint
 *
 * @publicApi
 */
export function Sse(
  path?: string,
  options: { [METHOD_METADATA]?: RequestMethod } = {
    [METHOD_METADATA]: RequestMethod.GET,
  },
): MethodDecorator {
    throw new Error("STUB");
}
