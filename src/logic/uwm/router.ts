import { ethers as eth } from "ethers";

const EXECUTE_SELECTOR_0 = "0x3593564c";
const EXECUTE_SELECTOR_1 = "0x24856bc3";

// ----------------------------------------------------------------
// import { keccak256, toUtf8Bytes, BytesLike } from 'ethers'

// const utf8 = (s: string): Uint8Array => toUtf8Bytes(s)
// const hash = (b: BytesLike): string => keccak256(b)

// const EXECUTE_SELECTOR_0 = hash(utf8('execute(bytes,bytes[],uint256)'))
// const EXECUTE_SELECTOR_1 = hash(utf8('execute(bytes,bytes[])'))

// console.log('EXECUTE_SELECTOR_0', EXECUTE_SELECTOR_0_.slice(0, 10))
// console.log('EXECUTE_SELECTOR_1', EXECUTE_SELECTOR_1_.slice(0, 10))
// ----------------------------------------------------------------

const ABI_CODER = new eth.utils.AbiCoder();

export class UniversalRouter {
  public static encodeExecute(
    commands: string,
    inputs: string[],
    deadline?: number
  ): string {
    let result = "";
    const withdead = deadline !== undefined;

    const types: string[] = ["bytes", "bytes[] calldata"];
    const value: any[] = [commands, inputs];

    if (withdead) {
      types.push("uint256");
      value.push(deadline);
    }

    // console.log('types', types)
    // console.log('value', value)

    result += withdead ? EXECUTE_SELECTOR_0 : EXECUTE_SELECTOR_1;
    result += ABI_CODER.encode(types, value).slice(2);

    return result;
  }
}
