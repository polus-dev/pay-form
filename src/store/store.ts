import { configureStore } from '@reduxjs/toolkit'
import providerSlice from './features/provider/providerSlice'
import transactionSlice from './features/transaction/transactionSlice'

export const store = configureStore({
  reducer: {
    provider: providerSlice,
    transaction: transactionSlice,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
