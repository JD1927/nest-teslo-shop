import {
  FileTypeValidator,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';

// ALTERNATIVE TO HAVE A FILE FILTER WITH FILE INTERCEPTOR
export const fileFilter = (
  req: Express.Request,
  file: {
    /** Field name specified in the form */
    fieldname: string;
    /** Name of the file on the user's computer */
    originalname: string;
    /** Encoding type of the file */
    encoding: string;
    /** Mime type of the file */
    mimetype: string;
    /** Size of the file in bytes */
    size: number;
    /** The folder to which the file has been saved (DiskStorage) */
    destination: string;
    /** The name of the file within the destination (DiskStorage) */
    filename: string;
    /** Location of the uploaded file (DiskStorage) */
    path: string;
    /** A Buffer of the entire file (MemoryStorage) */
    buffer: Buffer;
  },
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  console.log('🚀 ~ file:', file);

  if (!file) return callback(new Error(`File is empty.`), false);

  // More mimetype: https://gist.github.com/AshHeskes/6038140
  const extension: string = file.mimetype;

  const validExtensions = new RegExp('.(png|jpeg|jpg)', 'gm');

  if (!validExtensions.test(extension))
    return callback(new Error(`File does not have valid extension.`), false);

  callback(null, true);
};

export const FILE_FILTER_PIPE = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 5_000_000 }),
    new FileTypeValidator({
      fileType: /image\/(png|jpeg|jpg|gif)/,
    }),
  ],
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
});
