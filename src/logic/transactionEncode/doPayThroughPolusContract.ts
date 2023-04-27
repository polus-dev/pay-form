import { IEncodeTransfer } from "./types/IEncodeTransfer";

import { ethers } from "ethers";
import { PolusContractAbi } from "./types/polusContractAbi";
import { FEE_RECIPIENT } from "../../constants";
interface IPayThroughPolusContract
  extends Omit<IEncodeTransfer, "context" | "txData"> {}

export function doPayThroughPolusContract({
  fee,
  uuid,
  merchant,
  merchantAmount,
  tokenAddress,
}: IPayThroughPolusContract) {
  const polusContract = new ethers.utils.Interface(PolusContractAbi);
  if (tokenAddress) {
    return polusContract.encodeFunctionData("DoERC20Payment", [
      uuid,
      tokenAddress,
      FEE_RECIPIENT,
      fee,
      merchant,
      merchantAmount,
    ]);
  } else {
    return polusContract.encodeFunctionData("DoETHPayment", [
      uuid,
      FEE_RECIPIENT,
      fee,
      merchant,
      merchantAmount,
    ]);
  }
}
