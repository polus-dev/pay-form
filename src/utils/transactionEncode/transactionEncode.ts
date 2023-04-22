import { ethers } from "ethers";
import { Command } from "./types/Command";
import { IEncodeTransfer } from "./types/IEncodeTransfer";
import { WrapStatus } from "./types/WrapStatus";

const coder = new ethers.utils.AbiCoder();

const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
const EXECUTE_SELECTOR = "0x3593564c";
const COMMISION_RECIPIENT = "0xba0d95449b5e901cfb938fa6b6601281cef679a4";
const COMMISION = 0.5;

function calculateCommision(amount: number) {
  const commision = (amount * COMMISION) / 100;
  return Math.round(commision);
}

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
  uiid,
  amount,
  txData,
  recipient,
  tokenAddress = "Constants.ETH",
  context,
}: IEncodeTransfer): string {
  assertAmount(amount);
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
  } else if (context.from === "erc20" && context.to === "erc20")
    commands = decoded[0] + Command.TRANSFER + Command.TRANSFER + Command.FAKE;
  else throw new Error(" native to native context");

  const inputs = structuredClone<string[]>(decoded[1]);

  if (wrapStatus === WrapStatus.WRAP) {
    const wrap = wrapper(tokenAddress, amount);
    inputs.unshift(wrap);
  } else if (wrapStatus === WrapStatus.UNWRAP) {
    const wrap = wrapper(tokenAddress, amount);
    inputs.push(wrap);
  }

  const deadline = decoded[2] as number;
  const commision = calculateCommision(amount);

  const merchantTransfer = encodeTransfer(
    tokenAddress,
    recipient,
    amount - commision
  );

  const commisionTransfer = encodeTransfer(
    tokenAddress,
    COMMISION_RECIPIENT,
    commision
  );

  const uiid_encoded = coder.encode(
    ["uint256", "bytes"],
    ["0x" + uiid, "0x00"]
  );

  inputs.push(...[merchantTransfer, commisionTransfer, uiid_encoded]);
  const out = coder
    .encode(types, [commands, inputs, deadline])
    .replace("0x", "");
  return EXECUTE_SELECTOR + out;
}
