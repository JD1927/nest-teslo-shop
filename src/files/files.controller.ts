/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { FILE_FILTER_PIPE } from './helpers/file-filter.helper';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @UseInterceptors(FileInterceptor('product'))
  uploadProductFile(
    @UploadedFile(FILE_FILTER_PIPE) productFile: Express.Multer.File,
  ) {
    if (!productFile || typeof productFile.originalname !== 'string')
      throw new BadRequestException('Invalid file.');

    return {
      filename: productFile.originalname,
    };
  }
}
