import {
  FileTypeValidator,
  FileTypeValidatorOptions,
} from './file-type.validator';
import { FileValidator } from './file-validator.interface';
import {
  MaxFileSizeValidator,
  MaxFileSizeValidatorOptions,
} from './max-file-size.validator';
import { ParseFileOptions } from './parse-file-options.interface';
import { ParseFilePipe } from './parse-file.pipe';

/**
 * @publicApi
 */
export class ParseFilePipeBuilder {
  private validators: FileValidator[] = [];

  addMaxSizeValidator(options: MaxFileSizeValidatorOptions) {
      throw new Error("STUB");
  }

  addFileTypeValidator(options: FileTypeValidatorOptions) {
      throw new Error("STUB");
  }

  addValidator(validator: FileValidator) {
      throw new Error("STUB");
  }

  build(
    additionalOptions?: Omit<ParseFileOptions, 'validators'>,
  ): ParseFilePipe {
    const parseFilePipe = new ParseFilePipe({
      ...additionalOptions,
      validators: this.validators,
    });

    this.validators = [];
    return parseFilePipe;
  }
}
