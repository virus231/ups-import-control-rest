export enum NodeEnv {
  Development = 'development',
  Production = 'production',
}

export interface IEnv {
  NODE_ENV: NodeEnv;
  APP_PORT: number;

  DATA_BANK_DK_HOST: string;
  DATA_BANK_DK_PORT: number;
  DATA_BANK_DK_USER: string;
  DATA_BANK_DK_PASSWORD: string;
  DATA_BANK_DK_NAME: string;

  DATA_BANK_SE_HOST: string;
  DATA_BANK_SE_PORT: number;
  DATA_BANK_SE_USER: string;
  DATA_BANK_SE_PASSWORD: string;
  DATA_BANK_SE_NAME: string;

  DATA_BANK_NO_HOST: string;
  DATA_BANK_NO_PORT: number;
  DATA_BANK_NO_USER: string;
  DATA_BANK_NO_PASSWORD: string;
  DATA_BANK_NO_NAME: string;

  DATA_BANK_US_HOST: string;
  DATA_BANK_US_PORT: number;
  DATA_BANK_US_USER: string;
  DATA_BANK_US_PASSWORD: string;
  DATA_BANK_US_NAME: string;
}

export enum DATABASE {
  DATABANK_DK = 'databank_dk',
  DATABANK_SE = 'databank_se',
  DATABANK_NO = 'databank_no',
  DATABANK_US = 'databank_us',
}
