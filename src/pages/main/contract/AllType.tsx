import { PolusApi } from "../../../logic/api";

export interface AllType {
  id: string;
  tokenAddress: string;
  addressPolus: string;
  address: `0x${string}`;
  amount: string;
  addressMerchant: string;

  currentAddressToken: string;
  uuid: string;
  consoleLog: Function;
  setPayed: Function;
  setProgress: Function;
  isNativeToNative: boolean;
  asset_amount_decimals_without_fee: string;
  fee: string;
  feeRecipient: `0x${string}`;
  polusApi: PolusApi;
}

