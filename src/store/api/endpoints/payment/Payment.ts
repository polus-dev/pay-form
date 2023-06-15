import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  IGetPaymentByPaymentId,
  IGetPaymentsResponse,
  IPayment,
} from "./Payment.interface";
import { Blockchain_t } from "../types";

export const paymentApi = createApi({
  reducerPath: "paymentApi" as const,
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_REACT_API_URL + "public",
  }),
  endpoints: (builder) => ({
    getPaymentByPaymentId: builder.query<
      IGetPaymentsResponse,
      IGetPaymentByPaymentId
    >({
      query: (body) => ({
        url: `payment.take`,
        method: "POST",
        body,
      }),
      transformResponse: (response: IPayment) => {
        return {
          ...response,
          blockchains: Object.keys(response.assets) as Blockchain_t[],
        };
      },
    }),
  }),
});

export const {
  useGetPaymentByPaymentIdQuery,
  useLazyGetPaymentByPaymentIdQuery,
} = paymentApi;
