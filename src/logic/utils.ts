/* eslint-disable @typescript-eslint/naming-convention */
import axios from "axios";
import { BigNumber, ethers } from "ethers";

import { ListTokens } from "./payment";
import { fullListTokens } from "./tokens";

export async function getPriceToken(
  tokensList: ListTokens
): Promise<ListTokens> {
  const _listTokens = fullListTokens;
  const listNamed = [];
  for (let i = 0; i < tokensList.length; i++) {
    listNamed.push(tokensList[i].namePrice);
  }
  const data = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${listNamed.join(
      ","
    )}&vs_currencies=usd`
  );
  if (!data) return _listTokens;
  if (!data.data) return _listTokens;

  for (let i = 0; i < _listTokens.length; i++) {
    // console.log(data.data[_listTokens[i][i2].namePrice])
    if (data.data[_listTokens[i].namePrice]) {
      _listTokens[i].price = data.data[_listTokens[i].namePrice].usd;
    } else {
      console.error("not found coin ", _listTokens[i].namePrice);
    }
  }

  return _listTokens;
}

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
