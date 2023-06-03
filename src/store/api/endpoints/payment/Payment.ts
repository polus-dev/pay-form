import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  IGetPaymentByPaymentId,
  IGetPaymentsResponse,
} from './Payment.interface';

export const paymentApi = createApi({
  reducerPath: 'paymentApi' as const,
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_REACT_API_URL + 'public',
  }),
  endpoints: (builder) => ({
    getPaymentByPaymentId: builder.query<
      IGetPaymentsResponse[number],
      IGetPaymentByPaymentId
    >({
      query: (body) => ({
        url: `payment.take`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
    useGetPaymentByPaymentIdQuery,
  useLazyGetPaymentByPaymentIdQuery
} = paymentApi;
