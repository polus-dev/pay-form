export type Blockchain_t =
  | "arbitrum"
  | "bsc"
  | "ethereum"
  | "polygon"
  | "tron"
  | "bitcoin"
  | "dogecoin"
  | "litecoin";
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
  | "btc"
  | "ltc"
  | "doge";

type ChainIdEnumUnion = 1 | 56 | 137 | 42161 | -1 | -2;

export const ChainId: { [key in Blockchain_t]: number } = {
  ethereum: 1,
  bsc: 56,
  polygon: 137,
  arbitrum: 42161,
  tron: -2,
  bitcoin: -1,
  litecoin: -1,
  dogecoin: -1,
};

export const ChainIdToName: { [key in ChainIdEnumUnion]: Blockchain_t } = {
  1: "ethereum",
  56: "bsc",
  137: "polygon",
  42161: "arbitrum",
  "-2": "tron",
  "-1": "bitcoin",
};
