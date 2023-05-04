import usdtLogo from "../img/usdt.svg"
import usdcLogo from "../img/usdc.svg"
import wethLogo from "../img/weth.svg"
import daiLogo from "../img/dai.svg"
import maticLogo from "../img/matic.svg"
import btcLogo from "../img/btc.svg"
import ethLogo from "../img/weth.svg"
import busdLogo from "../img/busd.svg"
import bnbLogo from "../img/bnb.svg"
import shibLogo from "../img/shib.svg"
import { TokenPolus } from "./types"
import { ListTokens } from "./payment"

interface Tokens {
    polygon: Array<TokenPolus>,
    mainnet: Array<TokenPolus>
}

export interface AddressType {
    1: string,
    56: string,
    137: string
}

export const fullListTokens: ListTokens = [
    {
        name: "usdt",
        address: {
            1: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            56: "0x55d398326f99059fF775485246999027B3197955",
            137: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"
        } as AddressType,
        decimals: {
            1: 6,
            56: 6,
            137: 6
        },
        icon: usdtLogo,
        price: 1,
        namePrice: "tether",
        amountIn: 0,
        category: 'stable'
    },
    {
        name: "usdc",
        address: {
            1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            56: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
            137: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
        } as AddressType,
        decimals: {
            1: 6,
            56: 6,
            137: 6
        },
        icon: usdcLogo,
        price: 1,
        namePrice: "usd-coin",
        amountIn: 0,
        category: 'stable'
    },
    {
        name: "dai",
        address: {
            1: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            56: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
            137: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"
        } as AddressType,
        decimals: {
            1: 18,
            56: 18,
            137: 18
        },
        icon: daiLogo,
        price: 1,
        namePrice: "dai",
        amountIn: 0,
        category: 'stable'
    },
    {
        name: "matic",
        address: {
            1: "0",
            56: "0",
            137: "1"
        } as AddressType,
        decimals: {
            1: 18,
            56: 18,
            137: 18
        },
        native: true,
        icon: maticLogo,
        price: 1,
        wrapAlt: 'wmatic',
        namePrice: "matic-network",
        amountIn: 0,
        category: 'native'
    },
    {
        name: "wbtc",
        address: {
            1: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            56: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
            137: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6"
        } as AddressType,
        decimals: {
            1: 18,
            56: 18,
            137: 8
        },
        native: false,
        icon: btcLogo,
        price: 1,
        namePrice: "wrapped-bitcoin",
        amountIn: 0,
        category: 'wrap'
    },
    {
        name: "eth",
        address: {
            1: "1",
            56: "0",
            137: "0"
        } as AddressType,
        decimals: {
            1: 18,
            56: 18,
            137: 18
        },
        native: true,
        icon: ethLogo,
        price: 2000,
        wrapAlt: 'weth',
        namePrice: "weth",
        amountIn: 0,
        category: 'native'
    },
    {
        name: "weth",
        address: {
            1: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            56: "0x4DB5a66E937A9F4473fA95b1cAF1d1E1D62E29EA",
            137: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"
        } as AddressType,
        decimals: {
            1: 18,
            56: 18,
            137: 18
        },
        native: false,
        icon: ethLogo,
        price: 2000,
        namePrice: "weth",
        amountIn: 0,
        category: 'wrap'
    },
    {
        name: "wmatic",
        address: {
            1: "0x7c9f4C87d911613Fe9ca58b579f737911AAD2D43",
            56: "0xc836d8dC361E44DbE64c4862D55BA041F88Ddd39",
            137: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270" //  WMATIC
        } as AddressType,
        decimals: {
            1: 18,
            56: 18,
            137: 18
        },
        native: false,
        icon: maticLogo,
        price: 1,
        namePrice: "matic-network",
        amountIn: 0,
        category: 'wrap'
    },
    {
        name: "busd",
        address: {
            1: "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
            56: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
            137: "0x9C9e5fD8bbc25984B178FdCE6117Defa39d2db39" //  WMATIC
        } as AddressType,
        decimals: {
            1: 18,
            56: 18,
            137: 18
        },
        native: false,
        icon: busdLogo,
        price: 1,
        namePrice: "binance-usd",
        amountIn: 0,
        category: 'stable'
    },
    {
        name: "bnb",
        address: {
            1: "0",
            56: "1",
            137: "0"
        } as AddressType,
        decimals: {
            1: 18,
            56: 18,
            137: 18
        },
        native: true,
        icon: bnbLogo,
        price: 300,
        wrapAlt: 'wbnb',
        namePrice: "bnb",
        amountIn: 0,
        category: 'native'
    },
    {
        name: "wbnb",
        address: {
            1: "0",
            56: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
            137: "0"
        } as AddressType,
        decimals: {
            1: 18,
            56: 18,
            137: 18
        },
        native: false,
        icon: bnbLogo,
        price: 300,
        namePrice: "bnb",
        amountIn: 0,
        category: 'wrap'
    },
    {
        name: "shib",
        address: {
            1: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
            56: "0x2859e4544C4bB03966803b044A93563Bd2D0DD4D",
            137: "0x6f8a06447Ff6FcF75d803135a7de15CE88C1d4ec"
        } as AddressType,
        decimals: {
            1: 18,
            56: 18,
            137: 18
        },
        native: false,
        icon: shibLogo,
        price: 0.00001,
        namePrice: "shiba-inu",
        amountIn: 0,
        category: 'other'
    }
]

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
export type { Tokens }
