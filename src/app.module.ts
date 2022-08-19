import { Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DATABASE, IEnv, NodeEnv } from './app.types';
import { DatabankModule } from './databank/databank.module';
import * as Joi from 'joi';
import { Databank } from './databank/entities/databank.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object<IEnv>({
        NODE_ENV: Joi.string()
          .valid(...Object.values(NodeEnv))
          .default(NodeEnv.Development),
        APP_PORT: Joi.number().required(),

        DATA_BANK_DK_PORT: Joi.number().required(),
        DATA_BANK_DK_HOST: Joi.string().required(),
        DATA_BANK_DK_NAME: Joi.string().required(),
        DATA_BANK_DK_USER: Joi.string().required(),
        DATA_BANK_DK_PASSWORD: Joi.string().required(),

        DATA_BANK_SE_PORT: Joi.number().required(),
        DATA_BANK_SE_HOST: Joi.string().required(),
        DATA_BANK_SE_NAME: Joi.string().required(),
        DATA_BANK_SE_USER: Joi.string().required(),
        DATA_BANK_SE_PASSWORD: Joi.string().required(),

        DATA_BANK_NO_PORT: Joi.number().required(),
        DATA_BANK_NO_HOST: Joi.string().required(),
        DATA_BANK_NO_NAME: Joi.string().required(),
        DATA_BANK_NO_USER: Joi.string().required(),
        DATA_BANK_NO_PASSWORD: Joi.string().required(),

        DATA_BANK_US_PORT: Joi.number().required(),
        DATA_BANK_US_HOST: Joi.string().required(),
        DATA_BANK_US_NAME: Joi.string().required(),
        DATA_BANK_US_USER: Joi.string().required(),
        DATA_BANK_US_PASSWORD: Joi.string().required(),

        DATA_BANK_SE_BF_PORT: Joi.number().required(),
        DATA_BANK_SE_BF_HOST: Joi.string().required(),
        DATA_BANK_SE_BF_NAME: Joi.string().required(),
        DATA_BANK_SE_BF_USER: Joi.string().required(),
        DATA_BANK_SE_BF_PASSWORD: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: DATABASE.DATABANK_DK,
      inject: [ConfigService],
      useFactory: (config: ConfigService<IEnv>) => {
        return {
          name: DATABASE.DATABANK_DK,
          type: 'mariadb',
          host: config.get('DATA_BANK_DK_HOST'),
          port: config.get('DATA_BANK_DK_PORT'),
          username: config.get('DATA_BANK_DK_USER'),
          password: config.get('DATA_BANK_DK_PASSWORD'),
          database: config.get('DATA_BANK_DK_NAME'),
          logging: 'all',
          // migrations: [path.resolve(process.cwd(), 'dist/migrations/*.js')],
          migrationsRun: false,
          synchronize: false,
          entities: [Databank],
          autoLoadEntities: true,
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: DATABASE.DATABANK_SE,
      inject: [ConfigService],
      useFactory: (config: ConfigService<IEnv>) => {
        return {
          name: DATABASE.DATABANK_SE,
          type: 'mariadb',
          host: config.get('DATA_BANK_SE_HOST'),
          port: config.get('DATA_BANK_SE_PORT'),
          username: config.get('DATA_BANK_SE_USER'),
          password: config.get('DATA_BANK_SE_PASSWORD'),
          database: config.get('DATA_BANK_SE_NAME'),
          logging: 'all',
          // migrations: [path.resolve(process.cwd(), 'dist/migrations/*.js')],
          migrationsRun: false,
          synchronize: false,
          entities: [Databank],
          autoLoadEntities: true,
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: DATABASE.DATABANK_US,
      inject: [ConfigService],
      useFactory: (config: ConfigService<IEnv>) => {
        return {
          name: DATABASE.DATABANK_US,
          type: 'mariadb',
          host: config.get('DATA_BANK_US_HOST'),
          port: config.get('DATA_BANK_US_PORT'),
          username: config.get('DATA_BANK_US_USER'),
          password: config.get('DATA_BANK_US_PASSWORD'),
          database: config.get('DATA_BANK_US_NAME'),
          logging: 'all',
          // migrations: [path.resolve(process.cwd(), 'dist/migrations/*.js')],
          migrationsRun: false,
          synchronize: false,
          entities: [Databank],
          autoLoadEntities: true,
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: DATABASE.DATABANK_NO,
      inject: [ConfigService],
      useFactory: (config: ConfigService<IEnv>) => {
        return {
          name: DATABASE.DATABANK_NO,
          type: 'mariadb',
          host: config.get('DATA_BANK_NO_HOST'),
          port: config.get('DATA_BANK_NO_PORT'),
          username: config.get('DATA_BANK_NO_USER'),
          password: config.get('DATA_BANK_NO_PASSWORD'),
          database: config.get('DATA_BANK_NO_NAME'),
          logging: 'all',
          // migrations: [path.resolve(process.cwd(), 'dist/migrations/*.js')],
          migrationsRun: false,
          synchronize: false,
          entities: [Databank],
          autoLoadEntities: true,
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: DATABASE.DATABANK_SE_BF,
      inject: [ConfigService],
      useFactory: (config: ConfigService<IEnv>) => {
        return {
          name: DATABASE.DATABANK_SE_BF,
          type: 'mariadb',
          host: config.get('DATA_BANK_SE_BF_HOST'),
          port: config.get('DATA_BANK_SE_BF_PORT'),
          username: config.get('DATA_BANK_SE_BF_USER'),
          password: config.get('DATA_BANK_SE_BF_PASSWORD'),
          database: config.get('DATA_BANK_SE_BF_NAME'),
          logging: 'all',
          // migrations: [path.resolve(process.cwd(), 'dist/migrations/*.js')],
          migrationsRun: false,
          synchronize: false,
          entities: [Databank],
          autoLoadEntities: true,
        };
      },
    }),
    DatabankModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
