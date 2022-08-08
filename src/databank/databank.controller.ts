import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DatabankService } from './databank.service';
// import { DepartmentDto } from './dto/create-databank.dto';
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
    console.log(db.body.department);
    return await this.databankService.uploadFileToDropBox(
      db.body.department,
      file,
    );
  }
}
