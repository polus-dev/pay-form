import { TokenType } from "./TokenType";

export interface IEncodeTransfer {
  txData: string;
  tokenAddress?: string;
  recipient: string;
  uiid: string;
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
