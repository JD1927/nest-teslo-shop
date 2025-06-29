import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
// ANOTHER WAY
import { Response } from 'express';
import { diskStorage } from 'multer';
import { fileFilter, fileNamer } from './helpers/file-filter.helper';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('product/:imageName')
  findOne(@Param('imageName') imageName: string, @Res() res: Response) {
    const path = this.filesService.getStaticProductImage(imageName);
    // Send files directly
    res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(
    FileInterceptor('product', {
      fileFilter,
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  uploadProductFile(
    @UploadedFile()
    productFile: Express.Multer.File,
  ) {
    if (!productFile || typeof productFile.originalname !== 'string')
      throw new BadRequestException('Invalid file.');

    const HOST_API = this.configService.getOrThrow<string>('HOST_API');
    const secureUrl = `${HOST_API}/files/product/${productFile.filename}`;

    return {
      secureUrl,
    };
  }
}
