import { IEncodeTransfer } from "./types/IEncodeTransfer";

import { ethers } from "ethers";
import { PolusContractAbi } from "./types/polusContractAbi";
interface IPayThroughPolusContract
  extends Omit<IEncodeTransfer, "context" | "txData" | "universalRouterAddress"> { }

export function doPayThroughPolusContract({
  fee,
  uuid,
  merchant,
  merchantAmount,
  tokenAddress,
  feeRecipient
}: IPayThroughPolusContract) {
  const polusContract = new ethers.utils.Interface(PolusContractAbi);
  if (tokenAddress) {
    return polusContract.encodeFunctionData("DoERC20Payment", [
      '0x' + uuid,
      tokenAddress,
      feeRecipient,
      fee,
      merchant,
      merchantAmount,
    ]);
  } else {
    return polusContract.encodeFunctionData("DoETHPayment", [
      '0x' + uuid,
      feeRecipient,
      fee,
      merchant,
      merchantAmount,
    ]);
  }
}
