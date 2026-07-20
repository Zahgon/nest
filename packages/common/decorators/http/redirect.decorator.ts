import { REDIRECT_METADATA } from '../../constants';

/**
 * Redirects request to the specified URL.
 *
 * @publicApi
 */
export function Redirect(url = '', statusCode?: number): MethodDecorator {
    throw new Error("STUB");
}
