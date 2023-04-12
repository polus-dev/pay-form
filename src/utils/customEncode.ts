import { BigNumber, ethers } from 'ethers';

const coder = new ethers.utils.AbiCoder();

const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
const EXECUTE_SELECTOR = '0x3593564c';
const RECIPIENT = '0xba0d95449b5e901cfb938fa6b6601281cef679a4';
const DECIMALS = 6;
const COMMISION = 0.5;

function calculateCommision(amount: number) {
  const commision = (amount * COMMISION) / 100;
  return Math.round(commision);
}

function encodeTransfer(
  token: string,
  recipient: string,
  amount: string
): string {
  const types = ['address', 'address', 'uint256'];
  const encoded = coder.encode(types, [token, recipient, amount]);

  return encoded;
}

export function encodePay(d: string, amount: number): string {
  const data = d.slice(10);
  const types = ['bytes', 'bytes[]', 'uint256'];
  const decoded = coder.decode(types, Buffer.from(data, 'hex'));

  const commands: string = decoded[0] + '05'; // +TRANSFER
  const inputs = JSON.parse(JSON.stringify(decoded[1])) as string[];
  const deadline = decoded[2] as number;

  const transfer = encodeTransfer(
    USDC_ADDRESS,
    RECIPIENT,
    calculateCommision(amount).toString()
  );

  inputs.push(transfer);

  let out = coder.encode(types, [commands, inputs, deadline]).replace('0x', '');
  out = EXECUTE_SELECTOR + out;
  return out;
}
