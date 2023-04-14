
import usdtLogo from '../img/usdt.svg'
import usdcLogo from '../img/usdc.svg'
import wethLogo from '../img/weth.svg'
import { TokenPolus } from './types'

interface Tokens {
    polygon: Array<TokenPolus>,
    mainnet: Array<TokenPolus>
}

const listTokens: Array<TokenPolus> = [
    {
        name: 'usdt',
        address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        nano: 6,
        icon: usdtLogo
    },
    {
        name: 'usdc',
        address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        nano: 6,
        icon: usdcLogo
    },
    {
        name: 'weth',
        address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        nano: 18,
        icon: wethLogo
    }
]

// TODO: rename nano to decimals

const listTokenEth: Array<TokenPolus> = [
    {
        name: 'usdt',
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        nano: 6,
        icon: usdtLogo
    },
    {
        name: 'usdc',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        nano: 6,
        icon: usdcLogo
    },
    {
        name: 'weth',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        nano: 18,
        icon: wethLogo
    }
]

const tokens: Tokens = {
    polygon: listTokens,
    mainnet: listTokenEth
}

export { tokens }
export type { Tokens }
