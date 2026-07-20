import { AbstractHttpAdapter } from '../adapters';
import { HttpAdapterHost } from '../helpers/http-adapter-host';

export class InternalProvidersStorage {
  private readonly _httpAdapterHost = new HttpAdapterHost();
  private _httpAdapter: AbstractHttpAdapter;

  get httpAdapterHost(): HttpAdapterHost {
      throw new Error("STUB");
  }

  get httpAdapter(): AbstractHttpAdapter {
      throw new Error("STUB");
  }

  set httpAdapter(httpAdapter: AbstractHttpAdapter) {
      throw new Error("STUB");
  }
}
