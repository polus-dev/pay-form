export const enum Asset {
    BTC = 'btc',
    DAI = 'dai',
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
    BITCOIN = 'bitcoin',
    ARBITRUM = 'arbitrum',
    BINANCE = 'bsc',
    ETHEREUM = 'ethereum',
    POLYGON = 'polygon',
    TRON = 'tron',
}


export interface  IAssetsResponse {
    // @ts-ignore
    [key in Asset]?: {
        [key in Blockchain]: {
            is_native: boolean,
            contract: string,
            decimals: number,
            is_seeded_amount: boolean
        }
    }
}




// export interface IAssets {
//     // @ts-ignore
//     [key in Asset]?: {
//         [key in Blockchain]: {
//             is_native: boolean,
//             contract: string,
//             decimals: string,
//             is_seeded_amount: boolean
//         }
//
//     }
// }