import { TokenType } from "./TokenType";

export interface IEncodeTransfer {
  txData: string;
  tokenAddress?: string;
  recipient: string;
  amount: string;
  uiid: string;
  context: {
    from: TokenType;
    to: TokenType;
  };
}

