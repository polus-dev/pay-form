import { PolusApi } from "../../../logic/api";

export interface ProcessType {
  address: `0x${string}`;
  tokenAddress: string;
  addressPolus: string;
  position: number;
  setPosition: Function;
  positionError: number;
  setPositionError: Function;
  amount: string;
  addressMerchant: string;
  uuid: string;
  currentAddressToken: string;
  consoleLog: Function;
  reRender: Function;
  setPayed: Function;
  isNativeToNative: boolean;
  asset_amount_decimals_without_fee: string;
  fee: string;
  feeRecipient: string;
  polusApi: PolusApi;
}

