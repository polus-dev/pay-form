/* eslint-disable @typescript-eslint/naming-convention */
import axios from "axios"
import { BigNumber, ethers } from "ethers"

import { ListTokens } from "./payment"
import { fullListTokens } from "./tokens"

export async function getPriceToken(
    tokensList: ListTokens
): Promise<ListTokens> {
    const _listTokens = fullListTokens
    const listNamed = []
    for (let i = 0; i < tokensList.length; i++) {
        listNamed.push(tokensList[i].namePrice)
    }

    try {
        const data = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price?ids=${listNamed.join(
                ","
            )}&vs_currencies=usd`
        )
        if (!data) return _listTokens
        if (!data.data) return _listTokens

        window.localStorage.setItem("price", JSON.stringify(data.data))

        for (let i = 0; i < _listTokens.length; i++) {
            // console.log(data.data[_listTokens[i][i2].namePrice])
            if (data.data[_listTokens[i].namePrice]) {
                _listTokens[i].price = data.data[_listTokens[i].namePrice].usd
            } else {
                console.log("not found coin ", _listTokens[i].namePrice)
            }
        }
    } catch (err) {
        const data = JSON.parse(window.localStorage.getItem("price") ?? '[]')
        if (!data) {
            return _listTokens
        }

        for (let i = 0; i < _listTokens.length; i++) {
            // console.log(data.data[_listTokens[i][i2].namePrice])
            if (data[_listTokens[i].namePrice]) {
                _listTokens[i].price = data[_listTokens[i].namePrice].usd
            } else {
                console.log("not found coin ", _listTokens[i].namePrice)
            }
        }
    }

    return _listTokens
}

export function getParameterByName(
    name: string,
    url = window.location.href
): string | null {
    const name1 = name.replace(/[\[\]]/g, "\\$&")
    const regex = new RegExp(`[?&]${name1}(=([^&#]*)|&|#|$)`)
    const results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ""
    return decodeURIComponent(results[2].replace(/\+/g, " "))
}
export function weiToEthNum(
    nanoAmount: BigNumber | string | BigInt,
    decimals: number
): number {
    return Number(ethers.utils.formatUnits(BigNumber.from(nanoAmount), decimals))
}

export function weiToEth(
    nanoAmount: BigNumber | string,
    decimals: number
): string {
    // console.log(nanoAmount)
    const amount = ethers.utils.formatUnits(BigNumber.from(nanoAmount), decimals)
    let stringAmount = Number(amount).toPrecision(2)

    if (Number(stringAmount) === 0) {
        stringAmount = Number(amount).toPrecision(3)
    }
    if (Number(stringAmount) === 0) {
        stringAmount = Number(amount).toPrecision(4)
    }
    if (Number(stringAmount) === 0) {
        stringAmount = Number(amount).toPrecision(5)
    }

    if (Number(stringAmount) === 0) {
        stringAmount = Number(amount).toFixed(1)
    }
    return stringAmount
}

export function NtoStr(n1: number | string | BigNumber | Number): string {
    const n2 = Number(n1.toString())

    let stringAmount = Number(n2).toPrecision(5)

    if (stringAmount[stringAmount.length - 1] === "0") {
        stringAmount = Number(n2).toPrecision(4)
    }
    if (stringAmount[stringAmount.length - 1] === "0") {
        stringAmount = Number(n2).toPrecision(3)
    }
    if (stringAmount[stringAmount.length - 1] === "0") {
        stringAmount = Number(n2).toPrecision(2)
    }

    if (Number(stringAmount) === 0) {
        stringAmount = Number(n2).toFixed(1)
    }
    stringAmount = n2.toLocaleString("en", {
        currency: "usd",
        maximumFractionDigits: 7,
        maximumSignificantDigits: 7
    })
    return stringAmount
}

export function ETHToWei(amount: string, desimals: number): BigNumber {
    return ethers.utils.parseUnits(amount, desimals)
}




import { parseFixed } from "@ethersproject/bignumber";

/**
 * Convert a stringified fixed-point number to a big number with a custom number of decimals.
 *
 * @remarks
 * - Accepts scientific notation.
 * - Checks are in place to adhere to the numerical constraints of the EVM.
 * - Source: https://github.com/PaulRBerg/evm-bn/blob/main/src/toBn.ts
 */
export function toBn(x: string, decimals: number = 18): BigNumber {
    if (x === undefined || typeof x !== "string") {
        throw new Error("Input must be a string");
    }

    if (decimals < 1 || decimals > 77) {
        throw new Error("Decimals must be between 1 and 77");
    }

    let xs: string = x;


    // Limit the number of decimals to the value provided.
    if (xs.includes(".")) {
        const parts: string[] = xs.split(".");
        parts[1] = parts[1].slice(0, decimals);
        xs = parts[0] + "." + parts[1];
    }

    // Check if x is a whole number or a fixed-point number with some maximum number of decimals.
    const digits: number = 78 - decimals;
    const regexp: RegExp = new RegExp(`^[-+]?(\\d{1,${digits}}|(?=\\d+\\.\\d+)\\d{1,${digits}}\\.\\d{1,${decimals}})$`);

    if (regexp.test(xs)) {
        return parseFixed(xs, decimals);
    } else {
        throw new Error("Unknown format for fixed-point number: " + x);
    }
}
