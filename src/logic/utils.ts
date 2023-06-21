/* eslint-disable @typescript-eslint/naming-convention */
import { BigNumber, ethers } from "ethers";

export function getParameterByName(
  name: string,
  url = window.location.href
): string | null {
  const name1 = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp(`[?&]${name1}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
export function weiToEthNum(
  nanoAmount: BigNumber | string | BigInt,
  decimals: number
): number {
  return Number(ethers.utils.formatUnits(BigNumber.from(nanoAmount), decimals));
}

export function weiToEth(
  nanoAmount: BigNumber | string,
  decimals: number
): string {
  // console.log(nanoAmount)
  const amount = ethers.utils.formatUnits(BigNumber.from(nanoAmount), decimals);
  let stringAmount = Number(amount).toPrecision(2);

  if (Number(stringAmount) === 0) {
    stringAmount = Number(amount).toPrecision(3);
  }
  if (Number(stringAmount) === 0) {
    stringAmount = Number(amount).toPrecision(4);
  }
  if (Number(stringAmount) === 0) {
    stringAmount = Number(amount).toPrecision(5);
  }

  if (Number(stringAmount) === 0) {
    stringAmount = Number(amount).toFixed(1);
  }
  return stringAmount;
}

export function NtoStr(n1: number | string | BigNumber | Number): string {
  const n2 = Number(n1.toString());

  let stringAmount = Number(n2).toPrecision(5);

  if (stringAmount[stringAmount.length - 1] === "0") {
    stringAmount = Number(n2).toPrecision(4);
  }
  if (stringAmount[stringAmount.length - 1] === "0") {
    stringAmount = Number(n2).toPrecision(3);
  }
  if (stringAmount[stringAmount.length - 1] === "0") {
    stringAmount = Number(n2).toPrecision(2);
  }

  if (Number(stringAmount) === 0) {
    stringAmount = Number(n2).toFixed(1);
  }
  stringAmount = n2.toLocaleString("en", {
    currency: "usd",
    maximumFractionDigits: 7,
    maximumSignificantDigits: 7,
  });
  return stringAmount;
}

export function ETHToWei(amount: string, desimals: number): BigNumber {
  return ethers.utils.parseUnits(amount, desimals);
}

import { parseFixed } from "@ethersproject/bignumber";
import { Asset_t, Blockchain_t, IPayment } from "./api";

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
  const regexp: RegExp = new RegExp(
    `^[-+]?(\\d{1,${digits}}|(?=\\d+\\.\\d+)\\d{1,${digits}}\\.\\d{1,${decimals}})$`
  );

  if (regexp.test(xs)) {
    return parseFixed(xs, decimals);
  } else {
    throw new Error("Unknown format for fixed-point number: " + x);
  }
}

export const getBlockchains = (payment: IPayment) =>
  Object.keys(payment.assets) as Blockchain_t[];

export const getAsset = (payment: IPayment, human = false) => {
  const assets = payment.assets;
  const blockchain = getBlockchains(payment)[0];
  // @ts-ignore
  const asset: Asset_t = Object.keys(assets[blockchain])[0];
  // @ts-ignore
  let amount = assets[blockchain][asset].amount;
  const address = assets[blockchain][asset].address;
  const fee = assets[blockchain][asset].fee;
  return { asset, amount, address, fee };
};

export const getMerchantAddress = (payment: IPayment) =>
  getAsset(payment).address;

export const getPaymentFee = (payment: IPayment) => getAsset(payment).fee;

export const getPathFromCallData = (calldata: string) => {
  const coder = new ethers.utils.AbiCoder();
  const types = [["bytes", "bytes[]", "uint256"], ["address", "uint256", "uint256", "bytes", "bool"]];
  return coder.decode(types[1], coder.decode(types[0], Buffer.from(calldata.slice(10), "hex"))[1][0])[3]
  // 🤡
}


export const roundCryptoAmount = (amount: string) => {
   let z = "0", o = 4, v = ".", isStartWithZero = amount.startsWith(z), floatPointIndex = amount.indexOf(v);
   while (isStartWithZero ? amount[++floatPointIndex] === z : amount[++floatPointIndex] !== z && floatPointIndex < amount.length && floatPointIndex <= o);
   return amount.slice(0, amount[floatPointIndex - 1] === v && !isStartWithZero ? floatPointIndex - 1 : isStartWithZero ? floatPointIndex + 1 : floatPointIndex);
 };
