import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { IAssets, IAssetsResponse } from "./Asset.interface";
import { TokenImages } from "../../../../img/TokenImages";

export const assetApi = createApi({
  reducerPath: "assetApi" as const,
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_REACT_API_URL + "public",
  }),
  endpoints: (builder) => ({
    getAssets: builder.query<IAssets, void>({
      query: () => ({
        url: `payment.assets.get`,
        method: "POST",
      }),
      transformResponse: (baseQueryReturnValue: IAssetsResponse) => {
        // @ts-ignore
       Object.keys(baseQueryReturnValue).forEach(assetKey => baseQueryReturnValue[assetKey].image = TokenImages[assetKey])
        return baseQueryReturnValue;
      }
    }),
  }),
});
export const { useGetAssetsQuery } = assetApi;
