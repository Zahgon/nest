import { Provider, Scope } from '@nestjs/common';
import { INQUIRER } from './inquirer-constants';

const noop = () => {
    throw new Error("STUB");
};
export const inquirerProvider: Provider = {
  provide: INQUIRER,
  scope: Scope.TRANSIENT,
  useFactory: noop,
};
