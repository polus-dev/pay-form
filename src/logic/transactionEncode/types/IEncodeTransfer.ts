import { TokenType } from "./TokenType";

export interface IEncodeTransfer {
  txData: string;
  tokenAddress?: string;
  merchant: string;
  uuid: string;
  merchantAmount: string;
  fee: string;
  feeRecipient: string,
  universalRouterAddress: string,
  asset_amount_decimals?: string;
  context: {
    from: TokenType;
    to: TokenType;
  };
}
