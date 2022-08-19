import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabankController } from './databank.controller';
import { DatabankService } from './databank.service';
import { MulterModule } from '@nestjs/platform-express';
import { DATABASE } from '../app.types';
import { Databank } from './entities/databank.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Databank], DATABASE.DATABANK_DK),
    TypeOrmModule.forFeature([Databank], DATABASE.DATABANK_SE),
    TypeOrmModule.forFeature([Databank], DATABASE.DATABANK_NO),
    TypeOrmModule.forFeature([Databank], DATABASE.DATABANK_US),
    TypeOrmModule.forFeature([Databank], DATABASE.DATABANK_SE_BF),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [DatabankController],
  providers: [DatabankService],
  exports: [DatabankService],
})
export class DatabankModule {}
