import { Injectable } from '@nestjs/common';
import {
  InjectRepository,
} from '@nestjs/typeorm';
import { createReadStream, readFileSync } from 'fs';
import { In, Repository } from 'typeorm';
import { parse } from 'papaparse';
import axios from 'axios';
import { Databank } from './entities/databank.entity';
import { DATABASE } from 'src/app.types';

@Injectable()
export class DatabankService {
  constructor(
    @InjectRepository(Databank, DATABASE.DATABANK_DK)
    private readonly databankDKRepository: Repository<Databank>,
    @InjectRepository(Databank, DATABASE.DATABANK_SE)
    private readonly databankSERepository: Repository<Databank>,
    @InjectRepository(Databank, DATABASE.DATABANK_NO)
    private readonly databankNORepository: Repository<Databank>,
    @InjectRepository(Databank, DATABASE.DATABANK_US)
    private readonly databankUSRepository: Repository<Databank>,
    @InjectRepository(Databank, DATABASE.DATABANK_SE_BF)
    private readonly databankSEBFRepository: Repository<Databank>,
  ) {}

  // async findAll() {
  //   return this.databankSERepository.findAndCount();
  // }

  async findInDB(department: string, uniqueAccountNumbers: string[]) {
    const isNotApproved = [];

    switch (department) {
      case 'DK':
        for (const uniqueAccountNumber of uniqueAccountNumbers) {
          // eslint-disable-next-line no-var
          var isExist = await this.databankDKRepository.findOne({
            where: { account_nr: uniqueAccountNumber },
          });

          // if not exist in database
          if (!isExist) {
            isNotApproved.push(uniqueAccountNumber);
          }
        }
        return {
          isNotApproved,
          isExist,
        };
        break;
      case 'SE':
        for (const uniqueAccountNumber of uniqueAccountNumbers) {
          // eslint-disable-next-line no-var
          var isExist = await this.databankSERepository.findOne({
            where: { account_nr: uniqueAccountNumber },
          });

          // if not exist in database
          if (!isExist) {
            isNotApproved.push(uniqueAccountNumber);
          }
        }
        return {
          isNotApproved,
          isExist,
        };
        break;
      case 'NO':
        for (const uniqueAccountNumber of uniqueAccountNumbers) {
          // eslint-disable-next-line no-var
          var isExist = await this.databankNORepository.findOne({
            where: { account_nr: uniqueAccountNumber },
          });

          // if not exist in database
          if (!isExist) {
            isNotApproved.push(uniqueAccountNumber);
          }
        }
        return {
          isNotApproved,
          isExist,
        };
        break;
      case 'US':
        for (const uniqueAccountNumber of uniqueAccountNumbers) {
          // eslint-disable-next-line no-var
          var isExist = await this.databankUSRepository.findOne({
            where: { account_nr: uniqueAccountNumber },
          });

          // if not exist in database
          if (!isExist) {
            isNotApproved.push(uniqueAccountNumber);
          }
        }
        return {
          isNotApproved,
          isExist,
        };
      case 'SE_BF':
        for (const uniqueAccountNumber of uniqueAccountNumbers) {
          // eslint-disable-next-line no-var
          var isExist = await this.databankSEBFRepository.findOne({
            where: { account_nr: uniqueAccountNumber },
          });

          // if not exist in database
          if (!isExist) {
            isNotApproved.push(uniqueAccountNumber);
          }
        }
        return {
          isNotApproved,
          isExist,
        };
        break;
    }
  }

  async uploadFileToDropBox(department: string, file: Express.Multer.File) {
    const accountNumbers = await this.readCSVFile(file);
    const uniqueAccountNumbers = await this.checkUniqueAccountNumbers(
      accountNumbers,
    );
    const result = await this.findInDB(department, uniqueAccountNumbers);

    // if not exist in database
    if (result.isNotApproved.length > 0) {
      return {
        status: `error`,
        message: `Account numbers ${result.isNotApproved} is not approved`,
      };
    } else {
      await this.toDropBox(file, result.isExist);
      return {
        status: `success`,
        message: `Account numbers ${uniqueAccountNumbers} is approved`,
      };
    }
  }

  async toDropBox(file: Express.Multer.File, options: Databank) {
    try {
      await axios({
        method: `POST`,
        url: `https://content.dropboxapi.com/2/files/upload`,
        headers: {
          Authorization: `Bearer ${process.env.DROPBOX_TOKEN}`,
          'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': JSON.stringify({
            path: `${options.dropbox_folder}/` + file.originalname,
            mode: 'overwrite',
            autorename: true,
            mute: false,
            strict_conflict: false,
          }), //file path of dropbox
        },
        data: createReadStream('uploads/' + file.originalname), //local path to uploading file
      });
      return {
        status: `success`,
        message: `File ${file.originalname} is uploaded to dropbox`,
      };
    } catch (err) {
      console.log('err', err);
      return {
        status: `error`,
        message: `${err}`,
      };
    }
  }

  async readCSVFile(file: Express.Multer.File) {
    const csvFile = readFileSync('uploads/' + file.originalname, 'utf8');

    const csvData = csvFile.toString();

    const parsedCsv = await parse(csvData, {
      header: false,
      skipEmptyLines: true,
      fastMode: true,
      transformHeader: (header) => header,
      complete: (results) => results.data,
    });

    const accountNumbers = parsedCsv.data;

    return accountNumbers;
  }

  async checkUniqueAccountNumbers(accountNumbers: string[]): Promise<string[]> {
    const uniqueAccountNumbers = [];
    for (const accountNumber of accountNumbers) {
      const isDuplicate = uniqueAccountNumbers.includes(accountNumber[1]);

      if (!isDuplicate) {
        uniqueAccountNumbers.push(accountNumber[1]);
      }
    }
    return uniqueAccountNumbers.map((accountNumber: string) =>
      accountNumber.slice(4),
    );
  }
}
