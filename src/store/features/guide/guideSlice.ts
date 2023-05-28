import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ConnectionState {
  isVisible: boolean;
}

const initialState: ConnectionState = {
  isVisible: true,
}

export const connectionSlice = createSlice({
  name: 'guide',
  initialState,
  reducers: {
    setVisibleGuideButton: (state, action: PayloadAction<boolean>) => {
      state.isVisible = action.payload;
    },
  },
})

export const {  setVisibleGuideButton} = connectionSlice.actions

export default connectionSlice.reducer