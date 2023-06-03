import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  IGetMerchantByIdResponse,
  IGetMerchantRequest,
  IGetMerchantResponse,
} from "./Merchant.interface";

export const merchantApi = createApi({
  reducerPath: "merchantApi" as const,
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_REACT_API_URL + "public",
  }),
  endpoints: (builder) => ({
    getMerchantById: builder.query<
      IGetMerchantByIdResponse,
      IGetMerchantRequest
    >({
      query: (body) => ({
        url: `merchant.take`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGetMerchantByIdQuery, useLazyGetMerchantByIdQuery } =
  merchantApi;
