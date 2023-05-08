import { ethers } from "ethers";
import {
  ListToken,
  ListTokens,
  Payment
} from "../../../logic/payment";
import { PolusApi } from "../../../logic/api";
import { AllType } from "./AllType";

export interface ProcessType
  extends Pick<
    AllType, "asset_amount_decimals_without_fee" | "fee" | "chainId" | 'asset_amount_decimals' | 'feeRecipient'
  > {
  address: `0x${string}`;
  position: number;
  setPosition: Function;
  positionError: number;
  setPositionError: Function;
  uuid: string;
  consoleLog: Function;
  reRender: Function;
  setPayed: Function;
  setDataTr: Function;
  setTxValue?: Function;
  setTxTo?: Function;
  txValue?: string | null;
  txTo?: string | null;
  dataTr: string | undefined;
  feeData: ethers.providers.FeeData | undefined;
  payClass: Payment;
  tokenA: ListToken;
  tokenB: ListToken;
  fullListTokensUp: ListTokens;
  polusApi: PolusApi;
}

