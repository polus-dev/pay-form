import { Asset_t, Blockchain_t } from "../types";

export const enum Asset {
  BTC = "btc",
  DAI = "dai",
  ETH = "eth",
  MATIC = "matic",
  USDC = "usdc",
  USDT = "usdt",
  WBTC = "wbtc",
  WETH = "weth",
  WMATIC = "wmatic",
}

export const enum Blockchain {
  BITCOIN = "bitcoin",
  ARBITRUM = "arbitrum",
  BINANCE = "bsc",
  ETHEREUM = "ethereum",
  POLYGON = "polygon",
  TRON = "tron",
}

export interface TokenEntity {
  is_native: boolean;
  contract: string;
  decimals: number;
  min_amount: string;
  is_seeded_amount: boolean;
}

export type IAssetsResponse = {
  [key in Asset_t]: {
    [key in Blockchain_t]: TokenEntity;
  };
};

export type IAssets = Required<IAssetsResponse>;
