import { IPagination } from "../../types";

export interface IMerchant {
  id: string;
  name: string;
  description: string;
  evm_withdraw_address: string;
  tron_withdraw_address: string;
  domain: string;
  domain_confirmation_code: string;
  success_redirect_url: string;
  fail_redirect_url: string;
  webhook_url: string;
  is_domain_confirmed: boolean;
  is_signing_key_generated: boolean;
  created_at: string;
}

export interface ICreateMerchantRequest {
  name: string;
  description: string;
  domain: string;
  evm_withdraw_address: string;
  tron_withdraw_address: string;
  success_redirect_url?: string;
  fail_redirect_url?: string;
}

export interface ICreateMerchantResponse {
  id: string;
  name: string;
  description: string;
  domain: string;
  domain_confirmation_code: string;
  evm_withdraw_address: string;
  tron_withdraw_address: string;
}

export interface IGetMerchantRequest extends IPagination {
  merchant_id?: string;
}

export interface IMerchantId {
  merchant_id: string;
}

export type IDeleteMerchantRequest = IMerchant;

interface IWebhookItem {
  id: string;
  merchant_id: string;
  payment_id: string;
  endpoint: string;
  response_body: string;
  response_status_code: number;
  created_at: string;
}

export interface ISetWebhookRequest {
  merchant_id: string;
  webhook_url: string;
}

export type IGetWebhookHistoryResponse = IWebhookItem[];
export type IGetMerchantResponse = IMerchant[];
export type IGetMerchantByIdResponse = IMerchant;
export type IUpdateMerchantRequest = Partial<
  ICreateMerchantRequest & { merchant_id: string }
>;
