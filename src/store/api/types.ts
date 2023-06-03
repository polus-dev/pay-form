import { ResponseApiCode } from './responseApiCode';

export interface IPagination {
  offset?: number;
  limit?: number;
}

export interface IResponseApiDefault {
  code: ResponseApiCode;
  message: string;
  field?: string;
}
export type IResponseError = IResponseApiDefault;
