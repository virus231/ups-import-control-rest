import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createReadStream, readFileSync } from 'fs';
import { In, Repository } from 'typeorm';
import { parse } from 'papaparse';
import axios from 'axios';
import { Databank } from './entities/databank.entity';
import { DATABASE } from 'src/app.types';
import { DEPARTMENT_CODE } from './types';

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

  async findInDB(department: DEPARTMENT_CODE, uniqueAccountNumbers: string[]) {
    const isNotApprovedAccountNumbers = [];

    switch (department) {
      case DEPARTMENT_CODE.DK:
        const isExistDK = await this.databankDKRepository.find({
          where: {
            account_nr: In(uniqueAccountNumbers),
          },
        });

        for (const accountNumber of uniqueAccountNumbers) {
          const isAccountNumber = isExistDK.find(
            (item) => item.account_nr === accountNumber,
          );
          if (!isAccountNumber) {
            isNotApprovedAccountNumbers.push(accountNumber);
          }
        }
        return { isExist: isExistDK, isNotApprovedAccountNumbers };
        break;
      case DEPARTMENT_CODE.SE:
        const isExistSE = await this.databankSERepository.find({
          where: {
            account_nr: In(uniqueAccountNumbers),
          },
        });

        for (const accountNumber of uniqueAccountNumbers) {
          const isAccountNumber = isExistSE.find(
            (item) => item.account_nr === accountNumber,
          );
          if (!isAccountNumber) {
            isNotApprovedAccountNumbers.push(accountNumber);
          }
        }
        return { isExist: isExistSE, isNotApprovedAccountNumbers };
        break;
      case DEPARTMENT_CODE.NO:
        const isExistNO = await this.databankNORepository.find({
          where: {
            account_nr: In(uniqueAccountNumbers),
          },
        });
        for (const accountNumber of uniqueAccountNumbers) {
          const isAccountNumber = isExistNO.find(
            (item) => item.account_nr === accountNumber,
          );
          if (!isAccountNumber) {
            isNotApprovedAccountNumbers.push(accountNumber);
          }
        }
        return { isExist: isExistNO, isNotApprovedAccountNumbers };
        break;
      case DEPARTMENT_CODE.US:
        const isExistUS = await this.databankUSRepository.find({
          where: {
            account_nr: In(uniqueAccountNumbers),
          },
        });
        for (const accountNumber of uniqueAccountNumbers) {
          const isAccountNumber = isExistUS.find(
            (item) => item.account_nr === accountNumber,
          );
          if (!isAccountNumber) {
            isNotApprovedAccountNumbers.push(accountNumber);
          }
        }
        return { isExist: isExistUS, isNotApprovedAccountNumbers };
      case DEPARTMENT_CODE.SE_BF:
        const isExistSEBF = await this.databankSEBFRepository.find({
          where: {
            account_nr: In(uniqueAccountNumbers),
          },
        });
        for (const accountNumber of uniqueAccountNumbers) {
          const isAccountNumber = isExistSEBF.find(
            (item) => item.account_nr === accountNumber,
          );
          if (!isAccountNumber) {
            isNotApprovedAccountNumbers.push(accountNumber);
          }
        }
        return { isExist: isExistSEBF, isNotApprovedAccountNumbers };

        break;
    }
  }

  async uploadFileToDropBox(
    department: DEPARTMENT_CODE,
    file: Express.Multer.File,
  ) {
    const dataFile = await this.readCSVFile(file);
    const uniqueAccountNumbers = await this.getUniqueAccountNumbersInFile(
      dataFile,
    );
    const result = await this.findInDB(department, uniqueAccountNumbers);
    return await this.isCheckApproved(result, file, uniqueAccountNumbers);
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

    return parsedCsv.data;
  }

  async getUniqueAccountNumbersInFile(dataFile: any[][]) {
    const uniqueAccountNumbers = [];

    for (const row of dataFile) {
      const isDuplicate = uniqueAccountNumbers.includes(row[1]);

      if (!isDuplicate) {
        uniqueAccountNumbers.push(row[1]);
      }
    }

    return uniqueAccountNumbers.map((accountNumber: string) =>
      accountNumber.slice(4),
    );
  }

  async isCheckApproved(
    result: { isExist: Databank[]; isNotApprovedAccountNumbers: string[] },
    file: Express.Multer.File,
    uniqueAccountNumbers: string[],
  ) {
    const { isExist, isNotApprovedAccountNumbers } = result;

    if (isNotApprovedAccountNumbers.length > 0) {
      return {
        status: `error`,
        message: `Account numbers ${isNotApprovedAccountNumbers} is not approved`,
      };
    }

    for (const objDatabank of isExist) {
      await this.toDropBox(file, objDatabank);
    }

    return {
      status: `success`,
      message: `Account numbers ${uniqueAccountNumbers} is approved.`,
    };
  }
}
