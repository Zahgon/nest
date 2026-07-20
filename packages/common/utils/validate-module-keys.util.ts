import { MODULE_METADATA as metadataConstants } from '../constants';

export const INVALID_MODULE_CONFIG_MESSAGE = (
  text: TemplateStringsArray,
  property: string,
) => { throw new Error("STUB"); };

const metadataKeys = [
  metadataConstants.IMPORTS,
  metadataConstants.EXPORTS,
  metadataConstants.CONTROLLERS,
  metadataConstants.PROVIDERS,
];

export function validateModuleKeys(keys: string[]) {
  const validateKey = (key: string) => {
      throw new Error("STUB");
  };
  keys.forEach(validateKey);
}
