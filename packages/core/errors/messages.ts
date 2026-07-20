import type { DynamicModule, ForwardReference, Type } from '@nestjs/common';
import { isNil, isSymbol } from '@nestjs/common/utils/shared.utils';
import {
  InjectorDependency,
  InjectorDependencyContext,
} from '../injector/injector';
import { Module } from '../injector/module';

/**
 * Returns the name of an instance or `undefined`
 * @param instance The instance which should get the name from
 */
const getInstanceName = (instance: unknown): string => {
  if ((instance as ForwardReference)?.forwardRef) {
    return (instance as ForwardReference).forwardRef()?.name;
  }

  if ((instance as DynamicModule)?.module) {
    return (instance as DynamicModule).module?.name;
  }

  return (instance as Type)?.name;
};

/**
 * Returns the name of the dependency.
 * Tries to get the class name, otherwise the string value
 * (= injection token). As fallback to any falsy value for `dependency`, it
 * returns `fallbackValue`
 * @param dependency The name of the dependency to be displayed
 * @param fallbackValue The fallback value if the dependency is falsy
 * @param disambiguated Whether dependency's name is disambiguated with double quotes
 */
const getDependencyName = (
  dependency: InjectorDependency | undefined,
  fallbackValue: string,
  disambiguated = true,
): string =>
  // use class name
  getInstanceName(dependency) ||
  // use injection token (symbol)
  (isSymbol(dependency) && dependency.toString()) ||
  // use string directly
  (dependency
    ? disambiguated
      ? `"${dependency as string}"`
      : (dependency as string)
    : undefined) ||
  // otherwise
  fallbackValue;

/**
 * Returns the name of the module
 * Tries to get the class name. As fallback it returns 'current'.
 * @param module The module which should get displayed
 */
const getModuleName = (module: Module | undefined) =>
  (module && getInstanceName(module.metatype)) || 'current';

const stringifyScope = (scope: any[]): string =>
  (scope || []).map(getInstanceName).join(' -> ');

export const UNKNOWN_DEPENDENCIES_MESSAGE = (
  type: string | symbol,
  unknownDependencyContext: InjectorDependencyContext,
  moduleRef: Module | undefined,
) => {
    throw new Error("STUB");
};

export const INVALID_MIDDLEWARE_MESSAGE = (
  text: TemplateStringsArray,
  name: string,
) => { throw new Error("STUB"); };

export const UNDEFINED_FORWARDREF_MESSAGE = (
  scope: Type<any>[],
) => { throw new Error("STUB"); };

export const INVALID_MODULE_MESSAGE = (
  parentModule: any,
  index: number,
  scope: any[],
  receivedValue: unknown,
) => {
    throw new Error("STUB");
};

export const USING_INVALID_CLASS_AS_A_MODULE_MESSAGE = (
  metatypeUsedAsAModule: Type | ForwardReference,
  scope: any[],
  classKind: 'provider' | 'controller' | 'filter',
) => {
    throw new Error("STUB");
};

export const UNDEFINED_MODULE_MESSAGE = (
  parentModule: any,
  index: number,
  scope: any[],
) => {
    throw new Error("STUB");
};

export const UNKNOWN_EXPORT_MESSAGE = (
  token: string | symbol = 'item',
  module: string,
) => {
    throw new Error("STUB");
};

export const INVALID_CLASS_MESSAGE = (text: TemplateStringsArray, value: any) =>
  { throw new Error("STUB"); };

export const INVALID_CLASS_SCOPE_MESSAGE = (
  text: TemplateStringsArray,
  name: string | undefined,
) =>
  { throw new Error("STUB"); };

export const UNKNOWN_REQUEST_MAPPING = (metatype: Type) => {
    throw new Error("STUB");
};

export const INVALID_MIDDLEWARE_CONFIGURATION = `An invalid middleware configuration has been passed inside the module 'configure()' method.`;
export const UNHANDLED_RUNTIME_EXCEPTION = `Unhandled Runtime Exception.`;
export const INVALID_EXCEPTION_FILTER = `Invalid exception filters (@UseFilters()).`;
export const MICROSERVICES_PACKAGE_NOT_FOUND_EXCEPTION = `Unable to load @nestjs/microservices package. (Please make sure that it's already installed.)`;
