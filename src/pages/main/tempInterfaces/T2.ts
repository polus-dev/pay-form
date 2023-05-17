import { ListToken, ListTokens, PolusChainId } from "../../../logic/payment";
import { PolusApi } from "../../../logic/api";



export interface T2 {
  id: string;
  address: `0x${string}`;
  uuid: string;
  consoleLog: Function;
  setPayed: Function;
  setProgress: Function;
  tokenA: ListToken;
  tokenB: ListToken;
  fullListTokensUp: ListTokens;

  feeRecipient: `0x${string}`;
  chainId: PolusChainId;
  addressMerchant: string;
  amountOut: string;
  asset_amount_decimals_without_fee: string;
  asset_amount_decimals: string;
  fee: string;
  polusApi: PolusApi;
}

