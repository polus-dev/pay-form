/* eslint-disable no-restricted-syntax */
import { ethers as eth } from "ethers";
import { UType, Address, Uint, Byts, Bool, AbiType } from "./types";

const ABI_CODER = new eth.utils.AbiCoder();

export enum Command {
  V3_SWAP_EXACT_OUT = 0x01,
  PERMIT2_TRANSFER_FROM = 0x02,
  PAY_PORTION = 0x06,
  WRAP_ETH = 0x0b,
  UNWRAP_WETH = 0x0c,
  PERMIT2_PERMIT = 0x0a,
}

export interface V3SwapExactOut {
  recipt: Address;
  output: Uint;
  maxspt: Uint;
  uepath: Byts;
  permit: Bool;
}

export interface Permit2TransferFrom {
  tfetch: Address;
  recipt: Address;
  amount: Uint;
}

export interface PayPortion {
  ttoken: Address;
  recipt: Address;
  points: Uint;
}

export interface PermitDetails {
  token: Address;
  amount: Uint;
  expiration: Uint;
  nonce: Uint;
}

export interface PermitSingle {
  details: PermitDetails;
  spender: Address;
  sigDeadline: Uint;
}

export interface Permit2Permit {
  PermitSingle: PermitSingle;
  signature: Byts;
}

export type Input = V3SwapExactOut | PayPortion;

export interface CommandWithInput {
  command: Command;
  input: UType[];
}

export interface Serialized {
  commands: string;
  inputs: string[];
}

export class Builder {
  private _data: CommandWithInput[] = [];

  public put(
    options:
      | { cmd: Command.V3_SWAP_EXACT_OUT; input: V3SwapExactOut }
      | { cmd: Command.PERMIT2_TRANSFER_FROM; input: Permit2TransferFrom }
      | { cmd: Command.PAY_PORTION; input: PayPortion }
      | { cmd: Command.PERMIT2_PERMIT; input: Permit2Permit }
  ): Builder {
    const { cmd, input } = options;

    switch (cmd) {
      case Command.V3_SWAP_EXACT_OUT:
        this.put0x01(input);
        break;
      case Command.PERMIT2_TRANSFER_FROM:
        this.put0x02(input);
        break;
      case Command.PAY_PORTION:
        this.put0x06(input);
        break;
      case Command.PERMIT2_PERMIT:
        this.put0x0a(input);
        break;
      default:
        throw new Error("Builder: unexpected command");
    }

    return this;
  }

  private put0x01(input: V3SwapExactOut): void {
    this._data.push({
      command: Command.V3_SWAP_EXACT_OUT,
      input: [
        input.recipt,
        input.output,
        input.maxspt,
        input.uepath,
        input.permit,
      ],
    });
  }

  private put0x02(input: Permit2TransferFrom): void {
    this._data.push({
      command: Command.PAY_PORTION,
      input: [input.tfetch, input.recipt, input.amount],
    });
  }

  private put0x06(input: PayPortion): void {
    this._data.push({
      command: Command.PAY_PORTION,
      input: [input.ttoken, input.recipt, input.points],
    });
  }

  private put0x0a(input: Permit2Permit): void {
    this._data.push({
      command: Command.PERMIT2_PERMIT,
      input: [
        input.PermitSingle.details.token,
        input.PermitSingle.details.amount,
        input.PermitSingle.details.expiration,
        input.PermitSingle.details.nonce,
        input.PermitSingle.spender,
        input.PermitSingle.sigDeadline,
        input.signature,
      ],
    });
  }

  public serialize(): Serialized {
    const commands: Command[] = [];
    const inputs: string[] = [];

    for (const cmd of this._data) {
      commands.push(cmd.command);

      const types: string[] = [];
      const value: AbiType[] = [];

      for (const item of cmd.input) {
        types.push(item.ABI_TYPE);
        value.push(item.toAbiFormat());
      }

      const input = ABI_CODER.encode(types, value);
      // console.log('------------------')
      // console.log(types, value)
      // console.log('------------------')
      inputs.push(input);
    }

    const commandHex = `0x${Buffer.from(commands).toString("hex")}`;
    return { commands: commandHex, inputs };
  }

  public get data(): CommandWithInput[] {
    return this._data;
  }
}
