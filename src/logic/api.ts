import axios from "axios";
import { Invoice } from "./types";

export interface InvoiceType {
  id: string;
  merchant_id: string;
  description: string;
  asset: "usdt" | "usdc" | "weth" | "matic";
  asset_amount: string;
  status: "pending";
  evm_withdraw_address: string;
  tron_withdraw_address: string | undefined;
  selected_blockchain: null;
  expires_at: string;
  created_at: string;
  asset_amount_without_fee: string | null;
  asset_amount_decimals: string | null;
  asset_amount_decimals_without_fee: string | null;
  fee: string | null;
}

export interface MerchantType {
  id: string;
  name: string;
  description: string;
  domain: string;
  evm_withdraw_address: string;
  tron_withdraw_address: string | null;
  is_domain_confirmed: boolean;
  success_redirect_url: string | null;
  fail_redirect_url: string | null;
}

export type Info = {
  merchant: MerchantType | undefined;
  invoice: InvoiceType;
};

class PolusApi {
  private _url: string = "https://api.poluspay.com/";

  constructor(url?: string) {
    if (url) this._url = url;
  }

  public async getPaymentInfo(uuid: string): Promise<MerchantType | undefined> {
    const res = await axios.post(`${this._url}api/v1/payment/info`, { uuid });

    if (res.data.status === "error") {
      console.error(res.data);
      return undefined;
    }

    const resData: MerchantType = res.data;
    return resData;
  }

  public async getInfo(uuid: string): Promise<Info | undefined> {
    try {
      const res = await axios.post(`${this._url}public/payment.take`, {
        payment_id: uuid,
      });

      const resData: InvoiceType = res.data;
      console.log("resData", resData);
      resData.created_at = (Date.parse(resData.created_at) / 1000).toString();
      resData.expires_at = (Date.parse(resData.expires_at) / 1000).toString();

      const mer = await this.getInfoMerchant(resData.merchant_id);
      return {
        invoice: resData,
        merchant: mer,
      };
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }

  public async getInfoMerchant(
    uuid: string
  ): Promise<MerchantType | undefined> {
    try {
      const res = await axios.post(`${this._url}public/merchant.take`, {
        merchant_id: uuid,
      });

      const resData: MerchantType = res.data;
      return resData;
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }
}

export { PolusApi };
