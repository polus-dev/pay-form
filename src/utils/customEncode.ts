import { ethers } from 'ethers';

const coder = new ethers.utils.AbiCoder();

const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
const EXECUTE_SELECTOR = '0x3593564c';
const RECIPIENT = '0xba0d95449b5e901cfb938fa6b6601281cef679a4';
const RECIPIENT2 = '0xba0d95449b5e901cfb938fa6b6601281cef679a4';
const COMMISION = 0.5;
const TRANSFER_OPCODE = '05';
const FAKE_OPCODE = '90';



interface IEncodeTransfer {
  txData: string,
  tokenAddress: string,
  recipient: string,
  amount: string
  uiid: string,
}

function calculateCommision(amount: number) {
  const commision = (amount * COMMISION) / 100;
  return Math.round(commision);
}

function encodeTransfer(
  token: string,
  recipient: string,
  amount: string | number
): string {
  const types = ['address', 'address', 'uint256'];
  const encoded = coder.encode(types, [token, recipient, amount]);
  return encoded;
}

function assertAmount(amount: any): asserts amount is number {
  if (isNaN(+amount) || +amount <= 0) {
    throw new Error('Invalid amount');
  }
}

export function encodePay({ uiid, amount, txData, recipient, tokenAddress }: IEncodeTransfer): string {
  assertAmount(amount);
  const data = txData.slice(10);
  const types = ['bytes', 'bytes[]', 'uint256'];
  const decoded = coder.decode(types, Buffer.from(data, 'hex'));

  const commands: string = decoded[0] + TRANSFER_OPCODE + TRANSFER_OPCODE + FAKE_OPCODE;
  const inputs = structuredClone<string[]>(decoded[1]);
  const deadline = decoded[2] as number;
  const commision = calculateCommision(amount);


  const transfer = encodeTransfer(
    tokenAddress,
    recipient,
    amount - commision
  );


  const transfer2 = encodeTransfer(
    tokenAddress,
    recipient, // TODO: change to commision address
    commision
  );

  const uiid_encoded = coder.encode(['uint256', 'bytes'], ['0x' + uiid, '0x00']);

  inputs.push(...[transfer, transfer2, uiid_encoded]);
  const out = coder.encode(types, [commands, inputs, deadline]).replace('0x', '');
  return EXECUTE_SELECTOR + out;
}
