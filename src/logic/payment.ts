/* eslint-disable no-nested-ternary */
import { BigNumber, ethers } from "ethers";
import { AllowanceTransfer, PermitSingle } from "@uniswap/permit2-sdk";
import { Token } from "@uniswap/sdk-core";

import permit2 from "../permit_abi.json";
import token_abi from "../token_abi.json";
import { fullListTokens } from "./tokens";
import { getPriceToken } from "./utils";
import { CustomRouter } from "./router";
import { NULL_ADDRESS } from "../constants";

export interface ConfigPayment {
  networkId: number;
  tokenA: ListToken;
  tokenB: ListToken;
  addressUser: string;
  addressMerchant: string;
  amountOut: string;
  callback: Function;
}

interface TimeType {
  time1: string;
  time2: string;
}

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

interface TokenClass {
  info: ListToken;
  contract: ethers.Contract | undefined;
  erc20: Token;
  isNative: boolean;
}

export interface ListToken {
  name: string;
  icon: any;
  decimals: {
    1: number;
    56: number;
    137: number;
    42161: number;
  };
  address: {
    1: string;
    56: string;
    137: string;
    42161: string;
  };
  price: number;
  native?: boolean;
  wrapAlt?: string;
  namePrice: string;
  amountIn: number;
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
    url: "https://rpc.ankr.com/bsc",
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
  137: "0x4C60051384bd2d3C01bfc845Cf5F4b44bcbE9de5",
  1: "0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B",
  56: "0x5Dc88340E1c5c6366864Ee415d6034cadd1A9897",
  42161: "0x4C60051384bd2d3C01bfc845Cf5F4b44bcbE9de5",
};
const ADDRESS_POLUS = {
  polygon: "0x377f05e398e14f2d2efd9332cdb17b27048ab266",
  mainnet: "0x25adcda8324c7081b0f7eaa052df04e076694d62",
  bsc: "0x25adcda8324c7081b0f7eaa052df04e076694d62",
  arbitrum: "0x910e31052Ddc7A444b6B2a6A877dc71c9A021bda",
};

const QUOTER_ADDRESS = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

export class Payment {
  private _networkId: number;

  private _tokenA: TokenClass;

  private _tokenB: TokenClass;

  private _addressUser: string;

  private _addressMerchant: string;

  private _amountOut: string;

  private _networkRpcUrl: string;

  private _provider: ethers.providers.JsonRpcProvider;

  private _addressPermit: string;

  private _addressRouter: string;

  private _addressPolusContract: string;

  private _callback: Function;

  private _time: TimeType;

  private _contractPermit: ethers.Contract;

  constructor(config: ConfigPayment) {
    this._networkId = config.networkId;
    this._addressUser = config.addressUser;
    this._addressMerchant = config.addressMerchant;
    this._amountOut = config.amountOut;

    this._addressPermit = PERMIT2_ADDRESS;
    this._addressRouter = UNIVERSAL_ROUTER[this._networkId as PolusChainId];

    if (this._networkId === 137) {
      this._addressPolusContract = ADDRESS_POLUS.polygon;
      this._networkRpcUrl = RPCprovider[2].url;
    } else if (this._networkId === 1) {
      this._addressPolusContract = ADDRESS_POLUS.mainnet;
      this._networkRpcUrl = RPCprovider[0].url;
    } else if (this._networkId === 56) {
      this._addressPolusContract = ADDRESS_POLUS.bsc;
      this._networkRpcUrl = RPCprovider[1].url;
    } else if (this._networkId === 42161) {
      this._addressPolusContract = ADDRESS_POLUS.arbitrum;
      this._networkRpcUrl = RPCprovider[3].url;
    } else {
      // сеть не найдена
      this._networkRpcUrl = "";
      this._addressPolusContract = ADDRESS_POLUS.polygon;
    }

    this._provider = new ethers.providers.JsonRpcProvider(this._networkRpcUrl);

    const idNetw = (this._networkId as PolusChainId) ?? 137;

    this._tokenA = {
      info: config.tokenA,

      contract: new ethers.Contract(
        config.tokenA.native ? NULL_ADDRESS : config.tokenA.address[idNetw],
        token_abi,
        this._provider
      ),
      isNative: Boolean(config.tokenA.native),
      erc20: config.tokenA.native
        ? this.createWrapAltFromNative(config.tokenA.wrapAlt!)
        : new Token(
            this._networkId,
            config.tokenA.address[idNetw],
            config.tokenA.decimals[idNetw],
            config.tokenA.name,
            config.tokenA.name
          ),
    };
    this._tokenB = {
      info: config.tokenB,
      contract: new ethers.Contract(
        config.tokenA.native ? NULL_ADDRESS : config.tokenA.address[idNetw],
        token_abi,
        this._provider
      ),
      isNative: Boolean(config.tokenB.native),

      erc20: config.tokenB.native
        ? this.createWrapAltFromNative(config.tokenB.wrapAlt!)
        : new Token(
            this._networkId,
            config.tokenB.address[idNetw],
            config.tokenB.decimals[idNetw],
            config.tokenB.name,
            config.tokenB.name
          ),
    };

    this._contractPermit = new ethers.Contract(
      this._addressPermit,
      permit2,
      this._provider
    );

    this._callback = config.callback;

    this._time = {
      time1: BigInt(~~(Date.now() / 1000) + 60 * 30).toString(),
      time2: BigInt(~~(Date.now() / 1000) + 60 * 60 * 24 * 30).toString(),
    };
  }

  get addressPolusContract(): string {
    return this._addressPolusContract;
  }

  public createWrapAltFromNative(AltName: string): Token {
    const wrapAlt = fullListTokens.find((item) => item.name === AltName);
    if (!wrapAlt)
      throw new Error("createWrapAltFromNative:wrapAlt is undefined");
    const idNetw = this._networkId as PolusChainId;
    return new Token(
      this._networkId,
      wrapAlt.address[idNetw],
      wrapAlt.decimals[idNetw],
      wrapAlt.name,
      wrapAlt.name
    );
  }

  public async fetchFeeData() {
    return this._provider.getFeeData();
  }

  public async checkAllowance(
    token: "A" | "B",
    type: "permit" | "polus" | "router"
  ): Promise<BigNumber> {
    let contr = this._tokenA.contract;
    if (token === "B") {
      contr = this._tokenB.contract;
    }
    if (!contr) throw new Error("checkAllowance:contract is undefined");

    const toPermit =
      type === "permit"
        ? this._addressPermit
        : type === "polus"
        ? this._addressPolusContract
        : this._addressRouter;

    try {
      const allow: BigNumber = await contr.allowance(
        this._addressUser,
        toPermit
      );

      console.log("checkAllowance:allow", allow);

      return allow;
    } catch (error) {
      this._callback("Error checkAllowance", false);
      console.error("checkAllowance:error", error);
      return BigNumber.from(0);
    }
  }

  public async AllowancePermit(
    token: "A" | "B",
    type: "router" | "polus"
  ): Promise<Permit2AllowanceType | undefined> {
    let contr = this._tokenA.contract;
    if (token === "B") {
      contr = this._tokenB.contract;
    }

    if (!contr) throw new Error("AllowancePermit:contract is undefined");
    const toRouter =
      type === "router" ? this._addressRouter : this._addressPolusContract;

    try {
      const allow: Permit2AllowanceType = await this._contractPermit.allowance(
        this._addressUser,
        contr.address,
        toRouter
      );

      console.log("AllowancePermit:allow", allow);

      return allow;
    } catch (error) {
      this._callback("Error AllowancePermit", false);
      console.error("AllowancePermit:error", error);
      return undefined;
    }
  }

  /**
   * getDecimals
   */
  public async getDecimals(): Promise<BigNumber> {
    let contr = this._tokenA.contract;

    if (this.tokenA.isNative) {
      return BigNumber.from(18);
    }

    if (!contr) throw new Error("getDecimals:contract is undefined");
    const decimals: BigNumber = await contr.decimals();
    return decimals;
  }

  public async getBalance(token: "A" | "B"): Promise<BigNumber> {
    let contr = this._tokenA.contract;
    if (token === "B") {
      contr = this._tokenB.contract;
    }

    try {
      if (this.tokenA.isNative) {
        return await this._provider.getBalance(this._addressUser);
      }

      if (!contr) throw new Error("getBalance:contract is undefined");

      const balance: BigNumber = await contr.balanceOf(this._addressUser);

      console.log("getBalance:balance", balance);

      return balance;
    } catch (error) {
      this._callback("Error getBalance", false);
      console.error("getBalance:error", error);
      return BigNumber.from(0);
    }
  }

  public static async getAllAmountIn(
    amountOut: string,
    outToken: ListToken
  ): Promise<ListTokens> {
    const localFull = fullListTokens;

    const newLocalFull = await getPriceToken(localFull);

    const amountOutUSDPrice = newLocalFull.filter(
      (token) => token.namePrice === outToken.namePrice
    )[0].price;
    const amountOutUSD = Number(amountOut) * amountOutUSDPrice;

    console.log("getAllAmountIn:amountOutUSD", amountOutUSD);

    for (let i = 0; i < newLocalFull.length; i++) {
      if (newLocalFull[i].namePrice === outToken.namePrice) {
        newLocalFull[i].amountIn = Number(amountOut);
      } else {
        newLocalFull[i].amountIn = amountOutUSD / newLocalFull[i].price;
      }
    }

    console.log("getAllAmountIn:newLocalFull", newLocalFull);

    return newLocalFull;
  }

  public ApproveSyncPermit(): {
    address: `0x${string}`;
    abi: any;
    functionName: string;
    args: any[];
  } {
    if (!this._tokenA.contract)
      throw new Error("ApproveSyncPermit:contract is undefined");
    return {
      address: this._tokenA.contract.address as `0x${string}`,
      abi: token_abi,
      functionName: "approve",
      args: [this._addressPermit, ethers.constants.MaxUint256],
    };
  }

  public Approve(
    address: string | "permit" | "polus" | "router",
    type: 0 | 1 = 1
  ): {
    address: `0x${string}`;
    abi: any;
    functionName: string;
    args: any[];
  } {
    if (!this._tokenA.contract)
      throw new Error("Approve:contract is undefined");

    return {
      address: this._tokenA.contract.address as `0x${string}`,
      abi: token_abi,
      functionName: "approve",
      args: [
        address === "permit"
          ? this._addressPermit
          : address === "polus"
          ? this._addressPolusContract
          : address === "router"
          ? UNIVERSAL_ROUTER
          : address,
        ethers.constants.MaxUint256,
      ],
    };
  }

  public dataForSign(nonce: number): DataSign {
    if (!this._tokenA.contract)
      throw new Error("checkAllowance:contract is undefined");

    const dataForSign = CustomRouter.packToWagmi(
      this._tokenA.contract.address,
      (2n ** 160n - 1n).toString(),
      this._time.time2,
      nonce.toString(),
      this._addressRouter,
      this._time.time1
    );

    const valuesAny: PermitSingle = dataForSign.value;

    const { domain, types, values } = AllowanceTransfer.getPermitData(
      valuesAny,
      this._addressPermit,
      this._networkId
    );
    return {
      domain,
      types,
      value: values,
    };
  }

  public async getValueForSwap(
    path: string,
    amountOut: string
  ): Promise<BigNumber> {
    const coder = new ethers.utils.AbiCoder();
    const data =
      "0x2f80bb1d" +
      coder.encode(["bytes", "uint256"], [path, amountOut]).replace("0x", "");
    const result = await this._provider.call({ to: QUOTER_ADDRESS, data });
    return BigNumber.from(result);
  }

  public async getFee(): Promise<ethers.providers.FeeData> {
    const fee = await this._provider.getFeeData();
    return fee;
  }

  public get networkId(): number {
    return this._networkId;
  }

  public get tokenA(): TokenClass {
    return this._tokenA;
  }

  public get tokenB(): TokenClass {
    return this._tokenB;
  }

  public get addressRouter(): string {
    return this._addressRouter;
  }

  public get addressPermit(): string {
    return this._addressPermit;
  }

  public get addressMerchant(): string {
    return this._addressMerchant;
  }

  public get amountOut(): string {
    return this._amountOut;
  }
}
