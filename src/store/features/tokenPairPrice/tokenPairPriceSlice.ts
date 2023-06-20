import { createSlice } from "@reduxjs/toolkit";
import { Asset_t } from "../../api/endpoints/types";
import { tokenPairPriceThunk } from "./tokenPairPriceThunk";

export interface ITokenPairPriceState {
  amount?: string;
  assetName?: Uppercase<Asset_t>;
  isLoading: boolean;
}

const initialState: ITokenPairPriceState = {
  isLoading: false,
};

export const userTokenPairPriceSlice = createSlice({
  name: "tokenPairPrice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(tokenPairPriceThunk.pending, (state) => {
      state.isLoading = true;
    }),
      builder.addCase(tokenPairPriceThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.amount = action.payload.amount;
        state.assetName = action.payload.assetName;
      }),
      builder.addCase(tokenPairPriceThunk.rejected, (state, action) => {
        debugger;
        if (action.error.name === "AbortError") {
          return;
        }
        state.isLoading = false;
        state.amount = "Unknown";
      });
  },
});

export const {} = userTokenPairPriceSlice.actions;

export default userTokenPairPriceSlice.reducer;
