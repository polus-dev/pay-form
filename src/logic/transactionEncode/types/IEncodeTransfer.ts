import { TokenType } from "./TokenType";

export interface IEncodeTransfer {
  txData: string;
  tokenAddress?: string;
  merchant: string;
  uuid: string;
  merchantAmount: string;
  fee: string;
  context: {
    from: TokenType;
    to: TokenType;
    throughPolusContract: {
      native: boolean;
      erc20: boolean;
    };
  };
}
