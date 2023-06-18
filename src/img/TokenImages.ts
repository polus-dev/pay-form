import bnb from "./bnb.svg";
import btc from "./btc.svg";
import dai from "./dai.svg";
import busd from "./busd.svg";
import matic from "./matic.svg";
import usdc from "./usdc.svg";
import usdt from "./usdt.svg";
import weth from "./weth.svg";
import ltc from "./litecoin.svg";
import doge from "./Dogecoin.svg";
import { Asset_t } from "../store/api/endpoints/types";

export type TokenImagesType = {
  [key in Asset_t]: string;
};

export const TokenImages: Readonly<TokenImagesType> = {
  bnb,
  busd,
  dai,
  matic,
  usdc,
  usdt,
  btc,
  eth: weth,
  trx: "",
  wbtc: btc,
  weth,
  wmatic: matic,
  ltc,
  doge
};
