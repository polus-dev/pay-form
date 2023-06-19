import { configureStore } from "@reduxjs/toolkit";
import smartLineSlice from "./features/smartLine/smartLineSlice";
import transactionSlice from "./features/transaction/transactionSlice";
import connectionSlice from "./features/connection/connectionSlice";
import guideSlice from "./features/guide/guideSlice";
import { paymentApi } from "./api/endpoints/payment/Payment";
import { merchantApi } from "./api/endpoints/merchant/Merchant";
import viewSlice from "./features/view/viewSlice";
import { assetApi } from "./api/endpoints/asset/Asset";
import tokenPairPriceSlice from "./features/tokenPairPrice/tokenPairPriceSlice";

export const store = configureStore({
  reducer: {
    transaction: transactionSlice,
    smartLine: smartLineSlice,
    connection: connectionSlice,
    guide: guideSlice,
    view: viewSlice,
    tokenPairPrice: tokenPairPriceSlice,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [merchantApi.reducerPath]: merchantApi.reducer,
    [assetApi.reducerPath]: assetApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      paymentApi.middleware,
      merchantApi.middleware,
      assetApi.middleware
    ),
});

export interface ThunkConfig {
  state: RootState;
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
