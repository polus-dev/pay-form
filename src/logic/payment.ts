import { BigNumber, ethers } from "ethers";
import { AllowanceTransfer, PermitSingle } from "@uniswap/permit2-sdk";

import permit2 from "../permit_abi.json";
import token_abi from "../token_abi.json";
import { CustomRouter } from "./router";
import { Asset_t, Blockchain_t, ChainId } from "../store/api/endpoints/types";
import { Token as ERC20, WETH9 } from "@uniswap/sdk-core";
import { Token } from "../store/api/types";

export type Permit2AllowanceType = {
  amount: bigint;
  expiration: number;
  nonce: number;
};

interface DataSign {
  domain: any;
  types: any;
  value: any;
}

export interface ListToken {
  name: Asset_t;
  icon: any;
  decimals: number;
  address: string;
  amountIn: number;
  namePrice: string;
  isNative: boolean;
  category: "stable" | "native" | "wrap" | "other";
}

export type PolusChainId = keyof ListToken["address"];

export type ListTokens = ListToken[];

export interface RPCproviderType {
  url: string;
  id: number;
  name: string;
  coin: string;
  nano: number;
}

export const RPCprovider: RPCproviderType[] = [
  {
    name: "mainnet",
    url: "https://eth-mainnet.g.alchemy.com/v2/Q59fIJ1Y_uMFPE2Zg7cCdI182EgN9rvD",
    id: 1,
    coin: "ETH",
    nano: 8,
  },
  {
    name: "bsc",
    url: "https://bsc-dataseed1.binance.org/",
    id: 56,
    coin: "BNB",
    nano: 8,
  },
  {
    name: "polygon",
    url: "https://polygon-mainnet.g.alchemy.com/v2/jIKi9Sm2Wr8kjGissTbEQlRu_-aWaFM5",
    id: 137,
    coin: "MATIC",
    nano: 18,
  },
  {
    name: "arbitrum",
    url: "https://arb-mainnet.g.alchemy.com/v2/IbMFg1XQzi-eyshgzQ3hTD338aylLB4g",
    id: 42161,
    coin: "ETH",
    nano: 18,
  },
];

const PERMIT2_ADDRESS = "0x000000000022d473030f116ddee9f6b43ac78ba3";
const UNIVERSAL_ROUTER = {
  polygon: "0x4C60051384bd2d3C01bfc845Cf5F4b44bcbE9de5",
  ethereum: "0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B",
  bsc: "0x5Dc88340E1c5c6366864Ee415d6034cadd1A9897",
  arbitrum: "0x4C60051384bd2d3C01bfc845Cf5F4b44bcbE9de5",
};
const ADDRESS_POLUS = {
  polygon: "0x377f05e398e14f2d2efd9332cdb17b27048ab266",
  ethereum: "0x25adcda8324c7081b0f7eaa052df04e076694d62",
  bsc: "0x25adcda8324c7081b0f7eaa052df04e076694d62",
  arbitrum: "0x910e31052Ddc7A444b6B2a6A877dc71c9A021bda",
};

const QUOTER_ADDRESS = {
  polygon: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
  ethereum: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
  bsc: "0x78D78E420Da98ad378D7799bE8f4AF69033EB077",
  arbitrum: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",

};

export class CustomProvider {
  protected provider: ethers.providers.JsonRpcProvider;

  constructor(protected blockchain: Blockchain_t) {
    let networkRpcUrl: string;
    if (blockchain === "polygon") {
      networkRpcUrl = RPCprovider[2].url;
    } else if (blockchain === "ethereum") {
      networkRpcUrl = RPCprovider[0].url;
    } else if (blockchain === "bsc") {
      networkRpcUrl = RPCprovider[1].url;
    } else if (blockchain === "arbitrum") {
      networkRpcUrl = RPCprovider[3].url;
    } else {
      throw new Error("CustomProvider:networkRpcUrl is undefined");
    }
    this.provider = new ethers.providers.JsonRpcProvider(networkRpcUrl);
  }

  get networkId(): number {
    return ChainId[this.blockchain];
  }

  public async getValueForSwap(
    path: string,
    amountOut: string
  ): Promise<BigNumber> {
    debugger
    const coder = new ethers.utils.AbiCoder();
    const data =
      "0x2f80bb1d" +
      coder.encode(["bytes", "uint256"], [path, amountOut]).replace("0x", "");
    const result = await this.provider.call({
      // @ts-ignore
      to: QUOTER_ADDRESS[this.blockchain],
      data,
    });
    return BigNumber.from(result);
  }

  get RouterAddress() {
    // @ts-ignore
    const address = UNIVERSAL_ROUTER[this.blockchain];
    if (!address) throw new Error("RouterAddress:address is undefined");
    return address;
  }

  get PolusAddress() {
    // @ts-ignore
    const address = ADDRESS_POLUS[this.blockchain];
    if (!address) throw new Error("PolusAddress:address is undefined");
    return address;
  }

  get PermitAddress() {
    return PERMIT2_ADDRESS;
  }

  public async fetchFeeData() {
    return this.provider.getFeeData();
  }
}

export class PaymentHelper extends CustomProvider {
  // ???
  time1 = BigInt(~~(Date.now() / 1000) + 60 * 30).toString();
  time2 = BigInt(~~(Date.now() / 1000) + 60 * 60 * 24 * 30).toString();

  constructor(
    blockchain: Blockchain_t,
    public userToken: Token,
    public merchantToken: Token,
    public userAddress: string
  ) {
    super(blockchain);
  }

  get userTokenContract() {
    return new ethers.Contract(
      this.userToken.contract,
      token_abi,
      this.provider
    );
  }

  get permitContract() {
    return new ethers.Contract(PERMIT2_ADDRESS, permit2, this.provider);
  }

  public async checkAllowanceToUserToken(
    type: "permit" | "polus" | "router"
  ): Promise<BigNumber> {
    if (!this.userToken.contract)
      throw new Error("checkAllowance:contract is undefined");

    const to: string =
      type === "permit"
        ? this.PermitAddress
        : type === "polus"
          ? this.PolusAddress
          : this.RouterAddress;

    if (!to) throw new Error("checkAllowance:to address is undefined");

    try {
      return await this.userTokenContract.allowance(this.userAddress, to);
    } catch (error) {
      throw new Error("checkAllowance:error");
    }
  }

  public dataForSign(nonce: number): DataSign {
    if (!this.userToken.contract)
      throw new Error("dataForSign:contract is undefined");

    const dataForSign = CustomRouter.packToWagmi(
      this.userToken.contract,
      (2n ** 160n - 1n).toString(),
      this.time2,
      nonce.toString(),
      this.RouterAddress,
      this.time1
    );

    const valuesAny: PermitSingle = dataForSign.value;

    const { domain, types, values } = AllowanceTransfer.getPermitData(
      valuesAny,
      this.PermitAddress,
      ChainId[this.blockchain]
    );
    return {
      domain,
      types,
      value: values,
    };
  }

  public async checkPermit(
    type: "router" | "polus"
  ): Promise<Permit2AllowanceType> {
    try {
      return await this.permitContract.allowance(
        this.userAddress,
        this.userToken.contract,
        type === "router" ? this.RouterAddress : this.PolusAddress
      );
    } catch (error) {
      throw new Error("checkPermit:error");
    }
  }

  public async getSwapPath(amount: string) {
    const router = new CustomRouter(this.networkId);
    const userToken = this.userToken.is_native
      ? WETH9[this.networkId]
      : this.userToken;
    const merchantToken = this.merchantToken.is_native
      ? WETH9[this.networkId]
      : this.merchantToken;
    return await router.getRouter(
      amount,
      new ERC20(
        this.networkId,
        this.userToken.contract,
        this.userToken.decimals
      ),
      new ERC20(
        this.networkId,
        this.merchantToken.contract,
        this.merchantToken.decimals
      )
    );
  }

  public async getBalance(): Promise<BigNumber> {
    try {
      if (this.userToken.is_native)
        return await this.provider.getBalance(this.userAddress);

      return await this.userTokenContract.balanceOf(this.userAddress);
    } catch (error) {
      throw new Error("getBalance:error");
    }
  }

  get Context(): "universal router" | "polus contract" {
    return (this.userToken.is_native && this.merchantToken.is_native) ||
      this.userToken.contract === this.merchantToken.contract
      ? "polus contract"
      : "universal router";
  }
}

export class WrapAltToken {
  static wrap = (chainId: number) => {
    if (chainId === 137)
      return new ERC20(
        chainId,
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        18
      );
    else return WETH9[chainId];
  };
}
