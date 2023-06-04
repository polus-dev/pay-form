import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export const enum ViewVariant {
  SELECT,
  PROCESS_BLOCK,
  TRON,
}

export interface ViewState {
  currentView: ViewVariant;
}

const initialState: ViewState = {
  currentView: ViewVariant.SELECT,
};

export const viewSlice = createSlice({
  name: "view" as const,
  initialState,
  reducers: {
    setView(state, action: PayloadAction<ViewVariant>) {
      state.currentView = action.payload;
    },
  },
});

export const { setView } = viewSlice.actions;

export default viewSlice.reducer;
