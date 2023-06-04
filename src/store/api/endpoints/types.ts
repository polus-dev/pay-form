export type Blockchain_t = "arbitrum" | "bsc" | "ethereum" | "polygon" | "tron";
export type Asset_t =
  | "usdt"
  | "usdc"
  | "dai"
  | "busd"
  | "matic"
  | "eth"
  | "bnb"
  | "trx"
  | "wbtc"
  | "weth"
  | "wmatic"
  | "btc";

export const ChainId: { [key in Blockchain_t]: number } = {
  ethereum: 1,
  bsc: 56,
  polygon: 137,
  arbitrum: 42161,
  tron: -1,
};
