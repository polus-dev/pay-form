import usdtLogo from "../img/usdt.svg";
import usdcLogo from "../img/usdc.svg";
import wethLogo from "../img/weth.svg";
import daiLogo from "../img/dai.svg";
import maticLogo from "../img/matic.svg";
import { TokenPolus } from "./types";
import { ListTokens } from "./payment";

interface Tokens {
  polygon: Array<TokenPolus>;
  mainnet: Array<TokenPolus>;
}

export interface AddressType {
  1: string;
  56: string;
  137: string;
}

export const fullListTokens: ListTokens = [
  {
    name: "usdt",
    address: {
      1: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      56: "-",
      137: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    } as AddressType,
    decimals: 6,
    icon: usdtLogo,
    price: 1,
    namePrice: "tether",
    amountIn: 0,
  },
  {
    name: "usdc",
    address: {
      1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      56: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      137: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    } as AddressType,
    decimals: 6,
    icon: usdcLogo,
    price: 1,
    namePrice: "usd-coin",
    amountIn: 0,
  },
  {
    name: "dai",
    address: {
      1: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      56: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
      137: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    } as AddressType,
    decimals: 18,
    icon: daiLogo,
    price: 1,
    namePrice: "dai",
    amountIn: 0,
  },
  {
    name: "matic",
    address: {
      1: "NULL",
      56: "NULL",
      137: "NULL",
    } as AddressType,
    decimals: 18,
    icon: maticLogo,
    price: 1,
    namePrice: "dai",
    amountIn: 0,
  },
];

// const listTokens: Array<TokenPolus> = [
//     {
//         name: 'usdt',
//         address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
//         nano: 6,
//         icon: usdtLogo
//     },
//     {
//         name: 'usdc',
//         address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
//         nano: 6,
//         icon: usdcLogo
//     },
//     {
//         name: 'weth',
//         address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
//         nano: 18,
//         icon: wethLogo
//     }
// ]

// // TODO: rename nano to decimals

// const listTokenEth: Array<TokenPolus> = [
//     {
//         name: 'usdt',
//         address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
//         nano: 6,
//         icon: usdtLogo
//     },
//     {
//         name: 'usdc',
//         address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
//         nano: 6,
//         icon: usdcLogo
//     },
//     {
//         name: 'weth',
//         address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
//         nano: 18,
//         icon: wethLogo
//     }
// ]

// const tokens: Tokens = {
//     polygon: listTokens,
//     mainnet: listTokenEth
// }

// export { tokens }
export type { Tokens };
