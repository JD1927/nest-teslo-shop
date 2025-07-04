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
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers/file-filter.helper';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('product/:imageName')
  @ApiOperation({ summary: 'Get a product image by filename' })
  @ApiParam({
    name: 'imageName',
    description: 'Name of the image file to retrieve',
    example: 'product-1.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the requested product image file',
    content: { 'image/*': { schema: { type: 'string', format: 'binary' } } },
  })
  findOne(@Param('imageName') imageName: string, @Res() res: Response) {
    const path = this.filesService.getStaticProductImage(imageName);
    res.sendFile(path);
  }

  @Post('product')
  @ApiOperation({ summary: 'Upload a product image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product image file',
    schema: {
      type: 'object',
      properties: {
        product: {
          type: 'string',
          format: 'binary',
          description: 'The product image file to upload',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Product image uploaded successfully',
    schema: {
      example: {
        secureUrl: 'http://localhost:3000/files/product/product-1.jpg',
      },
    },
  })
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
