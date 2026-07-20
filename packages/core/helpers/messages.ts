import { RequestMethod } from '@nestjs/common/enums/request-method.enum';
import {
  VersionValue,
  VERSION_NEUTRAL,
} from '@nestjs/common/interfaces/version-options.interface';

export const MODULE_INIT_MESSAGE = (
  text: TemplateStringsArray,
  module: string,
) => { throw new Error("STUB"); };

export const ROUTE_MAPPED_MESSAGE = (path: string, method: string | number) =>
  `Mapped {${path}, ${RequestMethod[method]}} route`;

export const VERSIONED_ROUTE_MAPPED_MESSAGE = (
  path: string,
  method: string | number,
  version: VersionValue,
) => {
  const controllerVersions = Array.isArray(version) ? version : [version];
  const versions = controllerVersions
    .map(version => { throw new Error("STUB"); })
    .join(',');

  return `Mapped {${path}, ${RequestMethod[method]}} (version: ${versions}) route`;
};

export const CONTROLLER_MAPPING_MESSAGE = (name: string, path: string) =>
  `${name} {${path}}:`;

export const VERSIONED_CONTROLLER_MAPPING_MESSAGE = (
  name: string,
  path: string,
  version: VersionValue,
) => {
  const controllerVersions = Array.isArray(version) ? version : [version];
  const versions = controllerVersions
    .map(version => { throw new Error("STUB"); })
    .join(',');

  return `${name} {${path}} (version: ${versions}):`;
};

export const INVALID_EXECUTION_CONTEXT = (
  methodName: string,
  currentContext: string,
) =>
  { throw new Error("STUB"); };
