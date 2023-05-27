import { configureStore } from '@reduxjs/toolkit'
import smartLineSlice from './features/smartLine/smartLineSlice'
import transactionSlice from './features/transaction/transactionSlice'
import connectionSlice from "./features/connection/connectionSlice";

export const store = configureStore({
  reducer: {
    transaction: transactionSlice,
    smartLine: smartLineSlice,
    connection: connectionSlice,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
