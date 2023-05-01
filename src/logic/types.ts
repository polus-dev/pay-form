type ListCurrencies = "matic" | "usdc" | "weth" | "usdt";
interface Invoice {
  uuid: string;
  amount: number;
  description: string | null;
  asset: ListCurrencies;
  status: "in_progress" | "expired" | "completed";
  currencies: {
    polygon: {
      matic?: string;
      usdc?: string;
      weth?: string;
      usdt?: string;
    };
    ethereum: {
      matic?: string;
      usdc?: string;
      weth?: string;
      usdt?: string;
    };
  };
  uuid_hex: string;
  exp: number;
  merchant_object_info: {
    id: number;
    name: string;
    address: string;
    website: string;
    description: string | null;
    registration_date: string;
    redirect_url: string;
  };
}

interface TokenPolus {
  name: string;
  address: string;
  nano: number;
  icon: any;
}

export type { Invoice, TokenPolus, ListCurrencies };
