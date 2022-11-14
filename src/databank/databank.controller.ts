import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DatabankService } from './databank.service';
import { diskStorage } from 'multer';

@Controller('databank')
export class DatabankController {
  constructor(private readonly databankService: DatabankService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, callback) => {
          const filename = `${file.originalname}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async uploadFile(@Req() db, @UploadedFile() file: Express.Multer.File) {
    return await this.databankService.uploadFileToDropBox(
      db.body.department,
      file,
    );
  }
}
