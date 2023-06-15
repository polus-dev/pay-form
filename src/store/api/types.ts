import { TokenEntity } from "./endpoints/asset/Asset.interface";
import { Asset_t } from "./endpoints/types";
import { ResponseApiCode } from "./responseApiCode";

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

type TokenType = "Stable" | "Native" | "Wrapped" | "Other";

export interface Token extends TokenEntity {
  name: Asset_t;
  //   address: string;
  //   decimals: number;
  image: any;
  type: TokenType;
  wrapped?: Token;
}
