import { configureStore } from '@reduxjs/toolkit'
import smartLineSlice from './features/smartLine/smartLineSlice'
import transactionSlice from './features/transaction/transactionSlice'

export const store = configureStore({
  reducer: {
    transaction: transactionSlice,
    stamrtLine: smartLineSlice,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
