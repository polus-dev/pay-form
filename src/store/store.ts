import { configureStore } from '@reduxjs/toolkit'
import smartLineSlice from './features/smartLine/smartLineSlice'
import transactionSlice from './features/transaction/transactionSlice'
import connectionSlice from "./features/connection/connectionSlice";
import guideSlice from "./features/guide/guideSlice";
import { paymentApi } from "./api/endpoints/payment/Payment";
import { merchantApi } from "./api/endpoints/merchant/Merchant";

export const store = configureStore({
  reducer: {
    transaction: transactionSlice,
    smartLine: smartLineSlice,
    connection: connectionSlice,
    guide: guideSlice,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [merchantApi.reducerPath]: merchantApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }).concat(
    paymentApi.middleware,
    merchantApi.middleware,
  )
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
