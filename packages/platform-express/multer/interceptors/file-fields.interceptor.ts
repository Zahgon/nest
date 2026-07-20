import {
  CallHandler,
  ExecutionContext,
  Inject,
  mixin,
  NestInterceptor,
  Optional,
  Type,
} from '@nestjs/common';
import * as multer from 'multer';
import { Observable } from 'rxjs';
import { MULTER_MODULE_OPTIONS } from '../files.constants';
import { MulterModuleOptions } from '../interfaces';
import {
  MulterField,
  MulterOptions,
} from '../interfaces/multer-options.interface';
import { transformException } from '../multer/multer.utils';

type MulterInstance = any;

/**
 * @param uploadFields
 * @param localOptions
 * @publicApi
 */
export function FileFieldsInterceptor(
  uploadFields: MulterField[],
  localOptions?: MulterOptions,
): Type<NestInterceptor> {
    throw new Error("STUB");
}
