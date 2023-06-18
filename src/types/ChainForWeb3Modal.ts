import { mainnet, polygon, arbitrum, bsc, optimism } from "wagmi/chains";
import { Blockchain_t } from "../store/api/endpoints/types";
export const ChainForWeb3Modal: Partial<Record<Blockchain_t, any>> = {
  ethereum: mainnet,
  polygon,
  arbitrum,
  bsc,
  optimism,
}
