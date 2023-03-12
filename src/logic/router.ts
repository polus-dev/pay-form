/* eslint-disable no-restricted-syntax */
import { BaseProvider, JsonRpcProvider as Provider } from '@ethersproject/providers'
import { CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import { AlphaRouter, SwapRoute } from '@uniswap/smart-order-router'
import { BigNumber, ethers } from 'ethers'
import JSBI from 'jsbi'
import { AbiType, Address, Bool, Byts, Uint } from './uwm/types'
import { Builder, Command } from './uwm/builder'

type PathArray = (string | number)[]

interface IPool {
    t0: string,
    t1: string,
    fee: number
}

export class CustomRouter {
    private _router: AlphaRouter

    private _provider: BaseProvider

    private _chainId: number

    private _abi_coder: ethers.utils.AbiCoder

    private _builder: Builder

    constructor (chainId: number = 1) {
        this._provider = new Provider(
            // 'https://side-dawn-sea.matic.quiknode.pro/ce9f1f0946472d034b646717ed6b29a175b85dba',
            'https://bitter-empty-energy.quiknode.pro/e49a9bbc66c87c52f9d677d0f96e667f0c2bc300/',
            chainId
        )
        this._router = new AlphaRouter({ chainId, provider: this._provider })
        this._chainId = chainId

        this._abi_coder = new ethers.utils.AbiCoder()

        this._builder = new Builder()
    }

    public packSignToWagmi (token: string, spender: string, signature: string): Builder {
        this._builder.put({
            cmd: Command.PERMIT2_PERMIT,
            input: {
                PermitSingle: {
                    details: {
                        token: new Address(token),
                        amount: new Uint(2n ** 160n - 1n),
                        expiration: new Uint(2n ** 48n - 1n),
                        nonce: new Uint(0n)
                    },
                    spender: new Address(spender), // universalRouter
                    sigDeadline: new Uint(
                        BigInt(~~(Date.now() / 1000) + 60 * 30)
                    )
                },
                signature: new Byts(Buffer.from(signature.replace('0x', ''), 'hex'))
            }
        })

        return this._builder
    }

    public packSwapWagmi (recipt: string, amountOut: bigint, maxInput: bigint, encodedPath: string): Builder {
        this._builder.put({
            cmd: Command.V3_SWAP_EXACT_OUT,
            input: {
                recipt: new Address(recipt),
                output: new Uint(amountOut), // 0.001 DAI
                maxspt: new Uint(maxInput),
                uepath: new Byts(Buffer.from(encodedPath, 'hex')),
                permit: new Bool(true)
            }
        })

        return this._builder
    }

    public static packToWagmi (
        token: string,
        amount: string,
        expiration: string,
        nonce: string,
        spender: string,
        sigDeadline: string
    ): any {
        const types = {
            PermitDetails: [
                { name: 'token', type: 'address' },
                { name: 'amount', type: 'uint160' },
                { name: 'expiration', type: 'uint48' },
                { name: 'nonce', type: 'uint48' }
            ],
            PermitSingle: [
                { name: 'details', type: 'PermitDetails' },
                { name: 'spender', type: 'address' },
                { name: 'sigDeadline', type: 'uint256' }
            ]
        } as const

        const value = {
            details: {
                token,
                amount,
                expiration,
                nonce
            },
            spender,
            sigDeadline
        } as const

        return { types, value }
    }

    public packPermitSingleData (
        token: Address,
        amount: Uint,
        expiration: Uint,
        nonce: Uint,
        spender: Address,
        sigDeadline: Uint
    ): string {
        const value: AbiType[] = [
            token,
            amount,
            expiration,
            nonce,
            spender,
            sigDeadline
        ].map(t => t.toAbiFormat())

        const input = this._abi_coder.encode([
            'address',
            'uint',
            'uint',
            'uint',
            'address',
            'uint'
        ], value)
        // const string = token.replace('0x', '')
        // + amount.replace('0x', '')
        // + expiration.replace('0x', '')
        // + nonce.replace('0x', '')
        // + spender.replace('0x', '')
        // + sigDeadline.replace('0x', '')
        return input
    }

    public addressToToken (address: string, decimals: number): Token {
        return new Token(
            this._chainId,
            address,
            decimals
        )
    }

    public static amountToNanoAmount (amount: string | number, token: Token): BigNumber {
        return ethers.utils.parseUnits(
            amount.toString(),
            token.decimals
        )
    }

    public static amountToCurrencyAmount
    (amount: BigNumber | string | number | BigInt, tokenTo: Token): CurrencyAmount<Token> {
        return CurrencyAmount.fromRawAmount(
            tokenTo,
            JSBI.BigInt(amount)
            // amountInn.toString()
        )
    }

    public static encodeFee (n: number): string {
        const bytes: Array<number> = new Array(3).fill(0)
        bytes[0] = (n >> 16) & 0xFF
        bytes[1] = (n >> 8) & 0xFF
        bytes[2] = n & 0xFF
        return Buffer.from(bytes).toString('hex')
    }

    public static encodePath (patharr: PathArray): string {
        let encoded = ''
        for (const e of patharr) {
            switch (typeof e) {
                case 'string': encoded += e.slice(2); break
                case 'number': encoded += CustomRouter.encodeFee(e); break
                default: break
            }
        }
        return encoded.toLocaleLowerCase()
    }

    public async getRouter
    (amountOut: string | number | BigNumber | BigInt, tokenFrom: Token, tokenTo: Token):
    Promise<undefined | (string | number)[]> {
        const currencyAmount = CustomRouter.amountToCurrencyAmount(amountOut, tokenTo)
        const resp = await this._router.route(
            currencyAmount,
            tokenFrom,
            TradeType.EXACT_OUTPUT
        )

        if (!resp) {
            console.error('resp not found')
            return undefined
        }

        if (!resp.route) {
            console.error('resp.route not found')
            return undefined
        }

        if (resp.route.length === 0) {
            console.error('resp.route.length === 0')
            return undefined
        }

        const path = resp?.trade.swaps[0].route.path
        if (!path) {
            return undefined
        }

        const poolsraw = resp?.trade.swaps[0].route.pools
        const pools: IPool[] = poolsraw.map(p => ({
            t0: p.token0.address,
            t1: p.token1.address,
            fee: <number>(<any>p).fee
        }))

        const findPool = (a: string, b: string): IPool => {
            for (const p of pools) {
                if ((p.t0 === a || p.t0 === b) && (p.t1 === a || p.t1 === b)) {
                    return p
                }
            }

            throw new Error('pool not found in path range')
        }

        const patharr: PathArray = []

        for (let i = 0; i < path.length; i++) {
            if (i + 1 >= path.length) break

            const poolForPath = findPool(path[i].address, path[i + 1].address)

            if (i === 0) patharr.push(path[i].address)

            patharr.push(poolForPath.fee)
            patharr.push(path[i + 1].address)
        }

        return patharr.reverse()
    }

    public async getTransFromData () {

    }

    public get builder (): Builder {
        return this._builder
    }
}
