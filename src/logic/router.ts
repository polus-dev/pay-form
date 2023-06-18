/* eslint-disable no-restricted-syntax */
import {
    BaseProvider,
    JsonRpcProvider as Provider
} from "@ethersproject/providers"
import { CurrencyAmount, Token, TradeType } from "@uniswap/sdk-core"
import { AlphaRouter, SwapRoute } from "@uniswap/smart-order-router"
import { BigNumber, ethers } from "ethers"
import JSBI from "jsbi"
import { AbiType, Address, Bool, Byts, Uint } from "./uwm/types"
import { Builder, Command } from "./uwm/builder"
import { RPCprovider } from "./config"

type PathArray = (string | number)[]

interface IPool {
    t0: string,
    t1: string,
    fee: number
}

interface valuesSign {
    details: {
        token: string,
        amount: string,
        expiration: string,
        nonce: string
    },
    spender: string,
    sigDeadline: string
}

export class CustomRouter {
    private _router: AlphaRouter

    private _provider: BaseProvider

    private _chainId: number

    private _abi_coder: ethers.utils.AbiCoder

    private _builder: Builder

    constructor(chainId: number = 137) {
        const rpc = RPCprovider.find(el => el.chainId === chainId)?.url
        if (!rpc) throw new Error("rpc is undefined")
        this._provider = new Provider(
            rpc,
            chainId
        )
        this._router = new AlphaRouter({ chainId, provider: this._provider })
        this._chainId = chainId

        this._abi_coder = new ethers.utils.AbiCoder()

        this._builder = new Builder()
    }

    public packSignToWagmi(
        token: string,
        spender: string,
        signature: string
    ): Builder {
        const signature2 = new Byts(
            Buffer.from(signature.replace("0x", ""), "hex")
        )
        console.log("signature2", signature2)
        this._builder.put({
            cmd: Command.PERMIT2_PERMIT,
            input: {
                PermitSingle: {
                    details: {
                        token: new Address(token),
                        amount: new Uint(2n ** 10n - 1n),
                        expiration: new Uint(2n ** 40n - 1n),
                        nonce: new Uint(1n)
                    },
                    spender: new Address(spender), // universalRouter
                    sigDeadline: new Uint(BigInt(~~(Date.now() / 1000) + 60 * 30))
                },
                signature: signature2
            }
        })

        return this._builder
    }

    public packSignToWagmi2(value: valuesSign, signature: string): Builder {
        const signature2 = new Byts(
            Buffer.from(signature.replace("0x", ""), "hex")
        )
        console.log("signature2", signature2)

        const data = {
            PermitSingle: {
                details: {
                    token: new Address(value.details.token),
                    amount: new Uint(BigInt(value.details.amount)),
                    expiration: new Uint(BigInt(value.details.expiration)),
                    nonce: new Uint(BigInt(value.details.nonce))
                },
                spender: new Address(value.spender), // universalRouter
                sigDeadline: new Uint(BigInt(value.sigDeadline))
            },
            signature: signature2
        }

        console.log("PermitSingle", data)

        this._builder.put({
            cmd: Command.PERMIT2_PERMIT,
            input: data
        })

        return this._builder
    }

    public packSwapWagmi(
        recipt: string,
        amountOut: bigint,
        maxInput: bigint,
        encodedPath: string
    ): Builder {
        const patch = Buffer.from(encodedPath.replace("0x", ""), "hex")

        const inputs = {
            recipt: new Address(recipt),
            output: new Uint(amountOut), // 0.001 DAI
            maxspt: new Uint(maxInput),
            uepath: new Byts(patch),
            permit: new Bool(true)
        }

        console.log("inputs", inputs)
        this._builder.put({
            cmd: Command.V3_SWAP_EXACT_OUT,
            input: inputs
        })

        return this._builder
    }

    public static packToWagmi(
        token: string,
        amount: string,
        expiration: string,
        nonce: string,
        spender: string,
        sigDeadline: string
    ): { types: any, value: valuesSign } {
        const types = {
            PermitDetails: [
                { name: "token", type: "address" },
                { name: "amount", type: "uint160" },
                { name: "expiration", type: "uint48" },
                { name: "nonce", type: "uint48" }
            ],
            PermitSingle: [
                { name: "details", type: "PermitDetails" },
                { name: "spender", type: "address" },
                { name: "sigDeadline", type: "uint256" }
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

    public packPermitSingleData(
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

        const input = this._abi_coder.encode(
            ["address", "uint", "uint", "uint", "address", "uint"],
            value
        )
        // const string = token.replace('0x', '')
        // + amount.replace('0x', '')
        // + expiration.replace('0x', '')
        // + nonce.replace('0x', '')
        // + spender.replace('0x', '')
        // + sigDeadline.replace('0x', '')
        return input
    }

    public addressToToken(address: string, decimals: number): Token {
        return new Token(this._chainId, address, decimals)
    }

    public static amountToNanoAmount(
        amount: string | number,
        token: Token
    ): BigNumber {
        return ethers.utils.parseUnits(amount.toString(), token.decimals)
    }

    public static amountToCurrencyAmount(
        amount: BigNumber | string | number | BigInt,
        tokenTo: Token
    ): CurrencyAmount<Token> {
        return CurrencyAmount.fromRawAmount(
            tokenTo,
            JSBI.BigInt(amount)
            // amountInn.toString()
        )
    }

    public static encodeFee(n: number): string {
        const bytes: Array<number> = new Array(3).fill(0)
        bytes[0] = (n >> 16) & 0xff
        bytes[1] = (n >> 8) & 0xff
        bytes[2] = n & 0xff
        return Buffer.from(bytes).toString("hex")
    }

    public static encodePath(patharr: PathArray): string {
        let encoded = ""
        for (const e of patharr) {
            switch (typeof e) {
                case "string":
                    encoded += e.slice(2)
                    break
                case "number":
                    encoded += CustomRouter.encodeFee(e)
                    break
                default:
                    break
            }
        }
        return encoded.toLocaleLowerCase()
    }

    public async getRouter(
        amountOut: string | number | BigNumber | BigInt,
        tokenFrom: Token,
        tokenTo: Token
    ): Promise<SwapRoute | null | undefined> { // Promise<undefined | (string | number)[]>
        const currencyAmount = CustomRouter.amountToCurrencyAmount(
            amountOut,
            tokenTo
        )

        console.log("start get route")
        const resp = await this._router.route(
            currencyAmount,
            tokenFrom,
            TradeType.EXACT_OUTPUT
        )

        console.log("route found")

        if (!resp) {
            console.error("resp not found")
            return undefined
        }

        if (!resp.route) {
            console.error("resp.route not found")
            return undefined
        }

        if (resp.route.length === 0) {
            console.error("resp.route.length === 0")
            return undefined
        }
        const path = resp?.trade.swaps[0].route.path
        if (!path) {
            return undefined
        }

        return resp

        // const poolsraw = resp?.trade.swaps[0].route.pools
        // const pools: IPool[] = poolsraw.map(p => ({
        //     t0: p.token0.address,
        //     t1: p.token1.address,
        //     fee: <number>(<any>p).fee
        // }))

        // const findPool = (a: string, b: string): IPool => {
        //     for (const p of pools) {
        //         if ((p.t0 === a || p.t0 === b) && (p.t1 === a || p.t1 === b)) {
        //             return p
        //         }
        //     }

        //     throw new Error('pool not found in path range')
        // }

        // const patharr: PathArray = []

        // for (let i = 0; i < path.length; i++) {
        //     if (i + 1 >= path.length) break

        //     const poolForPath = findPool(path[i].address, path[i + 1].address)

        //     if (i === 0) patharr.push(path[i].address)

        //     patharr.push(poolForPath.fee)
        //     patharr.push(path[i + 1].address)
        // }

        // return patharr.reverse()
    }

    public async getTransFromData() { }

    public get builder(): Builder {
        return this._builder
    }
}
