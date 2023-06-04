import bnb from "./bnb.svg";
import btc from "./btc.svg";
import dai from "./dai.svg";
import busd from "./busd.svg";
import matic from "./matic.svg";
import usdc from "./usdc.svg";
import usdt from "./usdt.svg";
import weth from "./weth.svg";
import { Asset_t } from "../store/api/endpoints/types";

type TokenImagesType = {
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
  eth: "",
  trx: "",
  wbtc: "",
  weth: "",
  wmatic: "",
};
