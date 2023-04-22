import {
  AlphaRouter,
  ChainId,
  SwapOptionsSwapRouter02,
  SwapOptionsUniversalRouter,
  SwapRoute,
  SwapType,
} from "@uniswap/smart-order-router";
import { ethers, providers } from "ethers";
import { BaseProvider } from "@ethersproject/providers";
import {
  CurrencyAmount,
  Percent,
  SupportedChainId,
  Token,
  TradeType,
} from "@uniswap/sdk-core";

const rpcUrl =
  "https://wiser-convincing-road.matic.quiknode.pro/ad70b0d94c229f6344eaccbcc204d4706696de9a/";
const mainnetProvider = new ethers.providers.JsonRpcProvider(rpcUrl);

const test = new BaseProvider(mainnetProvider._network);

const USDC_TOKEN = new Token(
  SupportedChainId.POLYGON,
  "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  6,
  "USDC",
  "USD//C"
);
const DAI_TOKEN = new Token(
  SupportedChainId.POLYGON,
  "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  18,
  "DAI",
  "Dai Stablecoin"
);

// async function start () {
//     const router = new AlphaRouter({
//         chainId: ChainId.POLYGON,
//         provider: mainnetProvider
//     })
//     console.log(router)

//     const options: SwapOptionsUniversalRouter = {
//         recipient: '0x0F652b340596e702912eAAccD1093871aFDB49c7',
//         slippageTolerance: new Percent(5, 100),
//         type: SwapType.UNIVERSAL_ROUTER
//     }

//     const route = await router.route(
//         CurrencyAmount.fromRawAmount(
//             USDC_TOKEN,
//             10000
//         ),
//         DAI_TOKEN,
//         TradeType.EXACT_INPUT,
//         options
//     )
//     if (route) {
//         console.log(route.methodParameters?.calldata)
//     }
// }

// start()

// validate input email witch @gmail.com
