import { IPagination } from "../../types";
import { Asset_t, Blockchain_t } from "../types";

export interface IPayment {
  id: string;
  merchant_id: string;
  description: string;
  assets: IAssets;
  evm_fee_address: string;
  status: PaymentStatus;
  transaction?: ITransaction;
  // TODO: make types
  selected_blockchain: any;
  expires_at: string;
  created_at: string;
}

export enum PaymentStatus {
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

type IAssets = {
  [key in Blockchain_t]: {
    [key in Asset_t]: {
      amount: string;
      address: string;
      fee: string;
    };
  };
};

export interface IGetPaymentByMerchantId extends IPagination {
  merchant_id: string;
}

export interface IGetPaymentByPaymentId {
  payment_id: string;
}

export type IGetPaymentsResponse = IPayment & {
  blockchains: Blockchain_t[];
};

export type Payment = IGetPaymentsResponse;
