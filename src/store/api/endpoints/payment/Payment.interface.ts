import { IPagination } from "../../types";

export interface IPayment {
  id: string;
  merchant_id: string;
  description: string;
  assets: IAssets;
  evm_fee_address: string;
  // TODO: make types
  status: PaymentStatus;
  transaction?: ITransaction;
  // TODO: make types
  selected_blockchain: any;
  expires_at: string;
  created_at: string;
}

enum PaymentStatus {
  pending = "pending",
  success = "success",
  failed = "failed",
  inProgress = "in_progress",
}
interface ITransaction {
  hash: string;
  network: string;
  network_id: number;
  notification_delivered: boolean;
}

export type Blockchain_t = "arbitrum" | "bsc" | "ethereum" | "polygon" | "tron";
type Asset_t =
  | "usdt"
  | "usdc"
  | "dai"
  | "busd"
  | "matic"
  | "eth"
  | "bnb"
  | "trx"
  | "wbtc"
  | "weth"
  | "wmatic";

export interface ICreatePaymentRequest {
  description: string;
  merchant_id: string;
  assets: IAssets;
}

interface IAssets {
  // todo: make types
  // @ts-ignore
  [key in Blockchain_t]: {
    [key in Asset_t]: {
      amount: string | number;
      address: string;
      fee: string
    };
  };
}

export interface IGetPaymentByMerchantId extends IPagination {
  merchant_id: string;
}

export interface IGetPaymentByPaymentId {
  payment_id: string;
}

export type ICreatePaymentResponse = IPayment;

export type IGetPaymentsResponse = IPayment[];
