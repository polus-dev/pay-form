import { readContract } from "wagmi/actions";
import abi from "../../quoter_abi.json";
export async function getValueForSwap(path: string, amountOut: string) {
  const data = await readContract({
    address: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
    functionName: "quoteExactOutput",
    args: [path, amountOut],
    abi,
  });
  return data;
}
