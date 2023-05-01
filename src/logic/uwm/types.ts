/* eslint-disable max-classes-per-file */
import { ethers as eth } from "ethers";

export type AbiType = string | boolean;

export interface Serializable {
  toAbiFormat(): AbiType;
}

export class Address implements Serializable {
  readonly ABI_TYPE = "address";

  private _address: Buffer;

  constructor(address: string) {
    if (!eth.utils.isAddress(address)) {
      throw new Error(`Address: "${address}" is invalid`);
    }

    this._address = Buffer.from(address.slice(2), "hex");
  }

  public toAbiFormat(): AbiType {
    return this._address.toString("hex");
  }

  public get address(): Buffer {
    return this._address;
  }
}

export class Uint implements Serializable {
  readonly ABI_TYPE = "uint256";

  private _uint: bigint;

  constructor(uint: bigint) {
    // ¯\_(ツ)_/¯ this is js lol ...
    // .toString(2) more faster than custom bn log2
    if (uint.toString(2).length > 256) {
      throw new Error("UInt: usigned integer overflow");
    }

    this._uint = uint;
  }

  public toAbiFormat(): AbiType {
    return this._uint.toString(10);
  }

  public get uint(): bigint {
    return this._uint;
  }
}

export class Byts implements Serializable {
  readonly ABI_TYPE = "bytes";

  private _bytes: Buffer;

  constructor(bytes: Buffer) {
    this._bytes = bytes;
  }

  public toAbiFormat(): AbiType {
    return `0x${this._bytes.toString("hex")}`;
  }

  public get bytes(): Buffer {
    return this._bytes;
  }
}

export class Bool implements Serializable {
  readonly ABI_TYPE = "bool";

  private _bool: boolean;

  constructor(bool: boolean) {
    this._bool = bool;
  }

  public toAbiFormat(): AbiType {
    return this._bool;
  }

  public get bool(): boolean {
    return this._bool;
  }
}

export type UType = Address | Uint | Byts | Bool;
