import { FEE_RECIPIENT, NULL_ADDRESS, UNIVERSAL_ROUTER } from "../../constants";
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
  tokenAddress,
  context,
  merchantAmount,
  asset_amount_decimals,
  fee,
}: IEncodeTransfer): string {
  // assertAmount(amoun);
  if (!tokenAddress)
    tokenAddress = NULL_ADDRESS
  const data = txData.slice(10);
  const types = ["bytes", "bytes[]", "uint256"];
  const decoded = coder.decode(types, Buffer.from(data, "hex"));
  let commands: string;
  let wrapStatus: WrapStatus = 0;

  if (context.from === "native" && context.to === "erc20") {
    commands =
      '0x' + Command.WRAP +
      (<string>decoded[0]).slice(2) +
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
  }

  else {

    commands = decoded[0] + Command.TRANSFER + Command.TRANSFER + Command.FAKE;
  }

  const inputs = structuredClone<string[]>(decoded[1]);

  if (wrapStatus === WrapStatus.WRAP) {
    const wrap = wrapper('0x0000000000000000000000000000000000000002', asset_amount_decimals!);
    inputs.unshift(wrap);
  } else if (wrapStatus === WrapStatus.UNWRAP) {
    const wrap = wrapper(merchant, merchantAmount);
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
  debugger
  return EXECUTE_SELECTOR + out;
}
