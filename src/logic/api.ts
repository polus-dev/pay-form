import axios from "axios";
import { IPayment } from "../store/api/endpoints/payment/Payment.interface";

export interface InvoiceType {
  id: string;
  merchant_id: string;
  description: string;
  asset: "usdt" | "usdc" | "weth" | "matic";
  asset_amount: string;
  status: "pending" | "in_progress" | "success" | "failed";
  evm_withdraw_address: `0x${string}`;
  evm_fee_address: `0x${string}`;
  tron_withdraw_address: string | undefined;
  selected_blockchain: null;
  expires_at: string;
  created_at: string;
  asset_amount_without_fee: string | null;
  asset_amount_decimals: string | null;
  asset_amount_decimals_without_fee: string | null;
  fee: string | null;
  tron_asset_amount_decimals: string | null;
  tron_asset_amount: string;
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

interface ITransaction {
  hash: string;
  network: string;
  network_id: number;
  notification_delivered: boolean;
}

export type Info = {
  merchant: MerchantType | undefined;
  invoice: IPayment;
};

class PolusApi {
  private readonly _url: string = import.meta.env.VITE_REACT_API_URL;

  constructor(url?: string) {
    if (url) this._url = url;
  }

  public async getInfo(uuid: string): Promise<Info | undefined> {
    try {
      const res = await axios.post<IPayment>(
        `${this._url}public/payment.take`,
        { payment_id: uuid }
      );

      const resData = res.data;
      resData.created_at = (Date.parse(resData.created_at) / 1000).toString();
      resData.expires_at = (Date.parse(resData.expires_at) / 1000).toString();

      const mer = await this.getInfoMerchant(resData.merchant_id);

      if (!mer) {
        return undefined;
      }
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

  public async changeBlockchain(
    uuid: string,
    blockchain: "evm" | "tron"
  ): Promise<true | undefined> {
    try {
      const res = await axios.post(
        `${this._url}public/payment.selectBlockchain`,
        {
          payment_id: uuid,
          blockchain,
        }
      );
      return true;
    } catch (err) {
      // @ts-ignore
      if (err.response.data.code === 2012) {
        return true;
      }
      console.error(err);
      return undefined;
    }
  }
}

export { PolusApi };
