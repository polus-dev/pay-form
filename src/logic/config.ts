import { Blockchain_t, ChainId } from "../store/api/endpoints/types";

export interface RPCproviderType {
  url: string;
  name: Blockchain_t;
  chainId: number;
}

export const RPCprovider: RPCproviderType[] = [
  {
    name: "ethereum",
    url: "https://eth-mainnet.g.alchemy.com/v2/Q59fIJ1Y_uMFPE2Zg7cCdI182EgN9rvD",
    chainId: ChainId.ethereum,
  },
  {
    name: "bsc",
    url: "https://bsc-dataseed1.binance.org/",
    chainId: ChainId.bsc,
  },
  {
    name: "polygon",
    url: "https://polygon-mainnet.g.alchemy.com/v2/jIKi9Sm2Wr8kjGissTbEQlRu_-aWaFM5",
    chainId: ChainId.polygon,
  },
  {
    name: "arbitrum",
    url: "https://arb-mainnet.g.alchemy.com/v2/IbMFg1XQzi-eyshgzQ3hTD338aylLB4g",
    chainId: ChainId.arbitrum,
  },
  {
    name: "optimism",
    url: "https://rpc.optimism.gateway.fm",
    chainId: ChainId.optimism,
  },
];

export const PERMIT2_ADDRESS = "0x000000000022d473030f116ddee9f6b43ac78ba3";
export const UNIVERSAL_ROUTER = {
  polygon: "0x4C60051384bd2d3C01bfc845Cf5F4b44bcbE9de5",
  ethereum: "0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B",
  bsc: "0x5Dc88340E1c5c6366864Ee415d6034cadd1A9897",
  arbitrum: "0x4C60051384bd2d3C01bfc845Cf5F4b44bcbE9de5",
  optimism: "0xb555edF5dcF85f42cEeF1f3630a52A108E55A654",
};
export const ADDRESS_POLUS = {
  polygon: "0x377f05e398e14f2d2efd9332cdb17b27048ab266",
  ethereum: "0x25adcda8324c7081b0f7eaa052df04e076694d62",
  bsc: "0x25adcda8324c7081b0f7eaa052df04e076694d62",
  arbitrum: "0x910e31052Ddc7A444b6B2a6A877dc71c9A021bda",
  optimism: "0x2bd0a4277B94B3dA535419712433e135FA9273C1",
};

export const QUOTER_ADDRESS = {
  polygon: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
  ethereum: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
  bsc: "0x78D78E420Da98ad378D7799bE8f4AF69033EB077",
  arbitrum: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
  optimism: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
};
