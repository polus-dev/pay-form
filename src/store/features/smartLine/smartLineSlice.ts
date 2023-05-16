import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'


export const enum SmartLineStatus {
  DEFAULT = "smart-line-default-color",
  SUCCSESS = "smart-line-succsess-color",
  ERROR = "smart-line-error-color",
}


export interface SmartLineState {
  smartLineStatus: SmartLineStatus
}

const initialState: SmartLineState = {
  smartLineStatus: SmartLineStatus.DEFAULT,
}

export const counterSlice = createSlice({
  name: 'smart line',
  initialState,
  reducers: {
    setSmartLineStatus: (state, action: PayloadAction<SmartLineStatus>) => {
      state.smartLineStatus = action.payload
    }
  },
})

export const { setSmartLineStatus } = counterSlice.actions

export default counterSlice.reducer
