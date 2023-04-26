import { BigNumber, ethers } from "ethers";
import { AllowanceTransfer, PermitSingle } from "@uniswap/permit2-sdk";
import { Token } from "@uniswap/sdk-core";

import permit2 from "../permit_abi.json";
import token_abi from "../token_abi.json";
import { fullListTokens } from "./tokens";
import { getPriceToken } from "./utils";
import { CustomRouter } from "./router";

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
  contract: ethers.Contract;
  erc20: Token;
}

export interface ListToken {
  name: string;
  icon: any;
  decimals: number;
  address: {
    1: string;
    56: string;
    137: string;
  };
  price: number;
  native?: boolean;
  namePrice: string;
  amountIn: number;
}

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
    url: "https://rpc.ankr.com/eth",
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
    url: "https://side-dawn-sea.matic.quiknode.pro/ce9f1f0946472d034b646717ed6b29a175b85dba/",
    id: 137,
    coin: "MATIC",
    nano: 18,
  },
];

const PERMIT2_ADDRESS = "0x000000000022d473030f116ddee9f6b43ac78ba3";
const UNIVERSAL_ROUTER = "0x4C60051384bd2d3C01bfc845Cf5F4b44bcbE9de5";
const ADDRESS_POLUS = {
  polygon: "0x7D45c9Cf1263Db05065Dd446e5C6605adE19fBc2",
  mainnet: "0x0b89D43B3DD86f75c6010aB45395Cb9430Ff49B0",
  bsc: "0x0b89D43B3DD86f75c6010aB45395Cb9430Ff49B0",
};

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
    this._addressRouter = UNIVERSAL_ROUTER;

    if (this._networkId === 137) {
      this._addressPolusContract = ADDRESS_POLUS.polygon;
      this._networkRpcUrl = RPCprovider[2].url;
    } else if (this._networkId === 1) {
      this._addressPolusContract = ADDRESS_POLUS.mainnet;
      this._networkRpcUrl = RPCprovider[0].url;
    } else if (this._networkId === 56) {
      this._addressPolusContract = ADDRESS_POLUS.bsc;
      this._networkRpcUrl = RPCprovider[1].url;
    } else {
      // сеть не найдена
      this._networkRpcUrl = "";
      this._addressPolusContract = ADDRESS_POLUS.polygon;
    }

    this._provider = new ethers.providers.JsonRpcProvider(this._networkRpcUrl);

    const idNetw: 1 | 56 | 137 = (this._networkId as 1 | 56 | 137) ?? 137;

    this._tokenA = {
      info: config.tokenA,
      contract: new ethers.Contract(
        config.tokenA.address[idNetw],
        token_abi,
        this._provider
      ),
      erc20: new Token(
        this._networkId,
        config.tokenA.address[idNetw],
        config.tokenA.decimals,
        config.tokenA.name,
        config.tokenA.name
      ),
    };
    this._tokenB = {
      info: config.tokenB,
      contract: new ethers.Contract(
        config.tokenB.address[idNetw],
        token_abi,
        this._provider
      ),
      erc20: new Token(
        this._networkId,
        config.tokenB.address[idNetw],
        config.tokenB.decimals,
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

  public async checkAllowance(
    token: "A" | "B",
    type: "permit" | "polus"
  ): Promise<BigNumber> {
    let contr = this._tokenA.contract;
    if (token === "B") {
      contr = this._tokenB.contract;
    }

    const toPermit =
      type === "permit" ? this._addressPermit : this._addressPolusContract;

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

  public async getBalance(token: "A" | "B"): Promise<BigNumber> {
    let contr = this._tokenA.contract;
    if (token === "B") {
      contr = this._tokenB.contract;
    }

    try {
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
        newLocalFull[i].amountIn = newLocalFull[i].price * amountOutUSD;
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
    return {
      address: this._tokenA.contract.address as `0x${string}`,
      abi: token_abi,
      functionName: "approve",
      args: [this._addressPermit, ethers.constants.MaxUint256],
    };
  }

  public async Approve(
    address: string | "permit",
    type: 0 | 1 = 1
  ): Promise<ethers.providers.TransactionRequest | any> {
    if (type === 0) {
      const data = this._tokenA.contract.interface.encodeFunctionData(
        "approve",
        [
          address === "permit" ? this._addressPermit : address,
          ethers.constants.MaxUint256,
        ]
      );
      const tr: ethers.providers.TransactionRequest = {
        to: this._tokenA.contract.address,
        value: 0,
        chainId: this._networkId,
        data,
      };

      const estimatedGas = await this._provider.estimateGas(tr);
      const gasPrice = await this._provider.getGasPrice();

      tr.gasPrice = gasPrice;
      tr.gasLimit = estimatedGas;
      return tr;
    }

    return {
      address: this._tokenA.contract.address,
      abi: token_abi,
      functionName: "approve",
      args: [
        address === "permit" ? this._addressPermit : address,
        ethers.constants.MaxUint256,
      ],
    };
  }

  public dataForSign(nonce: number): DataSign {
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
