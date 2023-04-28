import { FEE_RECIPIENT } from "../../constants";
import { ethers } from "ethers";
import { Command } from "./types/Command";
import { IEncodeTransfer } from "./types/IEncodeTransfer";
import { PolusContractAbi } from "./types/polusContractAbi";
import { WrapStatus } from "./types/WrapStatus";

const coder = new ethers.utils.AbiCoder();

const EXECUTE_SELECTOR = "0x3593564c";

function encodeTransfer(
  token: string,
  recipient: string,
  amount: string | number
): string {
  const types = ["address", "address", "uint256"];
  const encoded = coder.encode(types, [token, recipient, amount]);
  return encoded;
}

function assertAmount(amount: any): asserts amount is number {
  if (isNaN(+amount) || +amount <= 0) {
    throw new Error("Invalid amount");
  }
}

function wrapper(address: string, amount: string | number): string {
  const types = ["address", "uint256"];
  const encoded = coder.encode(types, [address, amount]);
  return encoded;
}

export function encodePay({
  uuid: uuid,
  txData,
  merchant: merchant,
  tokenAddress = "Constants.ETH",
  context,
  merchantAmount,
  fee,
}: IEncodeTransfer): string {
  // assertAmount(amoun);
  const data = txData.slice(10);
  const types = ["bytes", "bytes[]", "uint256"];
  const decoded = coder.decode(types, Buffer.from(data, "hex"));
  let commands: string;
  let wrapStatus: WrapStatus = 0;

  if (context.from === "native" && context.to === "erc20") {
    commands =
      Command.WRAP +
      decoded[0] +
      Command.TRANSFER +
      Command.TRANSFER +
      Command.FAKE;
    wrapStatus = WrapStatus.WRAP;
  } else if (context.from === "erc20" && context.to === "native") {
    commands =
      decoded[0] +
      Command.UNWRAP +
      Command.TRANSFER +
      Command.TRANSFER +
      Command.FAKE;
    wrapStatus = WrapStatus.UNWRAP;
  } else {
    const polusContract = new ethers.utils.Interface(PolusContractAbi);
    if (context.throughPolusContract.erc20) {
      return polusContract.encodeFunctionData("DoERC20Payment", [
        uuid,
        tokenAddress,
        FEE_RECIPIENT,
        fee,
        merchant,
        merchantAmount,
      ]);
    } else if (context.throughPolusContract.native) {
      return polusContract.encodeFunctionData("DoETHPayment", [
        uuid,
        FEE_RECIPIENT,
        fee,
        merchant,
        merchantAmount,
      ]);
    }
    commands = decoded[0] + Command.TRANSFER + Command.TRANSFER + Command.FAKE;
  }

  const inputs = structuredClone<string[]>(decoded[1]);

  if (wrapStatus === WrapStatus.WRAP) {
    const wrap = wrapper(tokenAddress, merchantAmount);
    inputs.unshift(wrap);
  } else if (wrapStatus === WrapStatus.UNWRAP) {
    const wrap = wrapper(tokenAddress, merchantAmount);
    inputs.push(wrap);
  }

  const deadline = decoded[2] as number;

  const merchantTransfer = encodeTransfer(
    tokenAddress,
    merchant,
    merchantAmount
  );

  const commisionTransfer = encodeTransfer(tokenAddress, FEE_RECIPIENT, fee);

  const uiid_encoded = coder.encode(
    ["uint256", "bytes"],
    ["0x" + uuid, "0x00"]
  );

  inputs.push(...[merchantTransfer, commisionTransfer, uiid_encoded]);

  const out = coder
    .encode(types, [commands, inputs, deadline])
    .replace("0x", "");
  return EXECUTE_SELECTOR + out;
}
