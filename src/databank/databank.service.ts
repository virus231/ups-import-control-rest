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
    const isMarkupObj = await this.getMarkupObj(dataFile);
    return await this.isCheckApproved(
      result,
      file,
      uniqueAccountNumbers,
      isMarkupObj,
    );
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

  async getMarkupObj(dataFile: any[][]) {
    const obj: { [p: string]: boolean } = {};
    let netAmount = 0;
    const uniqueAccountNumbersWithInvoiceAmount = await this.getInvoiceTotal(
      dataFile,
    );

    for (let i = 0; i < dataFile.length; i++) {
      netAmount += Number(dataFile[i][52]);
    }

    for (const item in uniqueAccountNumbersWithInvoiceAmount) {
      const withoutZeros = item.replace(/^0+/, '');
      if (uniqueAccountNumbersWithInvoiceAmount[item] == netAmount) {
        obj[withoutZeros] = true;
      } else {
        obj[withoutZeros] = false;
      }
    }
    return obj;
  }

  async isCheckApproved(
    result: { isExist: Databank[]; isNotApprovedAccountNumbers: string[] },
    file: Express.Multer.File,
    uniqueAccountNumbers: string[],
    isMarkupObj: { [p: string]: boolean },
  ) {
    const { isExist, isNotApprovedAccountNumbers } = result;
    const differentNumbers = [];
    const missingNumbers = [];

    if (isNotApprovedAccountNumbers.length > 0) {
      return {
        status: `error`,
        message: `Account numbers ${isNotApprovedAccountNumbers} is not approved`,
      };
    }

    for (const objDatabank of isExist) {
      const isSuccess =
        (objDatabank.check_markup == 1 &&
          !isMarkupObj[objDatabank.account_nr]) ||
        (objDatabank.check_markup == 0 && isMarkupObj[objDatabank.account_nr]);
      if (
        objDatabank.check_markup == 0 &&
        !isMarkupObj[objDatabank.account_nr]
      ) {
        differentNumbers.push(objDatabank.account_nr);
      } else if (
        objDatabank.check_markup == 1 &&
        isMarkupObj[objDatabank.account_nr]
      ) {
        missingNumbers.push(objDatabank.account_nr);
      } else if (isSuccess) {
        await this.toDropBox(file, objDatabank);
      }
    }

    return differentNumbers.length > 0 && missingNumbers.length > 0
      ? {
          status: `error`,
          message: `Account numbers ${uniqueAccountNumbers} is not approved. Invoice amount and net amount are different in ${differentNumbers.toString()} and Markup is missing in ${missingNumbers.toString()}`,
        }
      : differentNumbers.length > 0
      ? {
          status: `error`,
          message: `Account numbers ${uniqueAccountNumbers} is not approved. Invoice amount and net amount are different in ${differentNumbers.toString()}`,
        }
      : missingNumbers.length > 0
      ? {
          status: `error`,
          message: `Account numbers ${uniqueAccountNumbers} is not approved. Markup is missing in ${missingNumbers.toString()}`,
        }
      : {
          status: `success`,
          message: `Account numbers ${uniqueAccountNumbers} is approved.`,
        };
  }

  async getInvoiceTotal(dataFile: any[][]) {
    const uniqueAccountNumbersWithInvoiceAmount = {};

    for (const row of dataFile) {
      const isDuplicate = uniqueAccountNumbersWithInvoiceAmount.hasOwnProperty(
        row[1],
      );

      if (!isDuplicate) {
        uniqueAccountNumbersWithInvoiceAmount[row[1]] = row[10];
      }
    }

    return uniqueAccountNumbersWithInvoiceAmount;
  }
}
