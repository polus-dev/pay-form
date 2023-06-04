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

// type Asset = 'btc' | 'dai' | 'eth' | 'matic' | 'usdc' | 'usdt' | 'wbtc' | 'weth' | 'wmatic';

export const enum Blockchain {
  BITCOIN = "bitcoin",
  ARBITRUM = "arbitrum",
  BINANCE = "bsc",
  ETHEREUM = "ethereum",
  POLYGON = "polygon",
  TRON = "tron",
}

type TokenEntity = {
  is_native: boolean;
  contract: any;
  decimals: number;
  min_amount: string;
  is_seeded_amount: boolean;
};

export type IAssetsResponse = {
  [key in Asset]: {
    [key in Blockchain]: TokenEntity;
  };
};
