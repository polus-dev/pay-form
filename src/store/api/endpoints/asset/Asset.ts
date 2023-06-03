import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {IAssetsResponse} from "./Asset.interface";

export const assetApi = createApi({
    reducerPath: 'assetApi' as const,
    baseQuery: fetchBaseQuery({baseUrl: import.meta.env.VITE_REACT_APP_BASE_URL + "public"}),
    endpoints: (builder) => ({
        getAssets: builder.query<IAssetsResponse, void>({
            query: () => ({
                url: `payment.assets.get`,
                method: 'POST',
            })
        }),
    }),
})
export const {useGetAssetsQuery} = assetApi